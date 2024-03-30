import os
from collections.abc import Iterable

from django.conf import settings
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import AnonymousUser
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views import generic

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from common.models import UploadedFile, SteganographyRecord
from common.utils.utils import check_file_lengths_valid, encode_message, get_file_path, \
    encode_message_simple, get_magic_number, file_to_bitarray, createRecord, get_file_from_path


class IndexView(generic.TemplateView):
    template_name = "common/index.html"


class RestViewSet(viewsets.ViewSet):
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="rest-check",
    )
    def rest_check(self, request):
        return Response(
            {
                "result": "This message comes from the backend. "
                          "If you're seeing this, the REST API is working!"
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="user/login",
    )
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate user
        user = authenticate(username=username, password=password)

        if user is not None:
            # Login the user
            login(request, user)
            # Return user details
            user_details = {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'status': 200
            }
            return Response(user_details, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="user/logout",
    )
    def logout(self, request):
        logout(request)
        return Response({"message": "User logged out successfully.", "status": 200}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="logged-in-user-details",
    )
    def get_logged_in_user_details(self, request):
        if request.user.is_anonymous:
            return Response({"error": "No user logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        user_details = {}
        if not isinstance(request.user, AnonymousUser):
            user_details["first_name"] = request.user.first_name
            user_details["last_name"] = request.user.last_name
            user_details["email"] = request.user.email

        return Response(user_details, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="upload",
    )
    def upload_file(self, request):
        file_obj = request.FILES.get('file')
        if file_obj is None:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Process the uploaded file here (save it, manipulate it, etc.)
        # For demonstration, we'll just return the file name
        # Save file
        my_file = UploadedFile(file=file_obj)
        my_file.save()

        # Get file name
        saved_file = my_file.file
        file_name = os.path.basename(saved_file.path)
        file_length = len(file_to_bitarray(saved_file.path))
        magic_number = get_magic_number(saved_file.path)

        return Response({"file_name": file_name, "file_id": my_file.id, "bitarray_length": file_length, "magic_number": magic_number},
                        status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="encode",
    )
    def encode_file(self, request):
        # Extract parameters from the request
        plaintext_file_id = request.data.get('plaintext_file_id')
        message_file_id = request.data.get('message_file_id')
        starting_bit = request.data.get('startingBit')
        length = request.data.get('length')
        mode = request.data.get('mode')

        # Check if all required parameters are provided
        if not all([plaintext_file_id, message_file_id, starting_bit, length, mode]):
            return Response({"error": "All parameters are required"}, status=status.HTTP_400_BAD_REQUEST)


        # Fetch file from db:
        plaintext_file = UploadedFile.objects.get(pk=plaintext_file_id).file
        message_file = UploadedFile.objects.get(pk=message_file_id).file

        # Process the encoding logic here
        # Check File Size Valid
        file_size_valid = check_file_lengths_valid(plaintext_file.path, message_file.path)

        if not file_size_valid:
            return Response({"error": "Size of the plaintext file should be more than the message file!"},
                            status=status.HTTP_400_BAD_REQUEST)

        # success, modified_file_name = encode_message(plaintext_file_name, message_file_name, starting_bit,
        #                                              length, mode)

        encoded_file = encode_message_simple(plaintext_file.path, message_file.path, starting_bit, length)

        print(f'encoded_file: {encoded_file}')
        if encoded_file is not None:
            # TODO: HANDLE ANONYMOUS USER
            record = createRecord(request.user, plaintext_file, message_file, encoded_file, starting_bit, length, mode)
            print(f'After save record')
            return Response({
                "status": "success",
                "message": "Encoding successful",
                "encoded_file_name": encoded_file.name,
                # "plaintext_file_name": plaintext_file_name,
                # "message_file_name": message_file_name,
                "starting_bit": starting_bit,
                "length": length,
                "mode": mode
            }, status=status.HTTP_200_OK)
        else:
            # Delete plaintext file and message file
            # default_storage.delete(get_file_path(plaintext_file_name))
            # default_storage.delete(get_file_path(message_file_name))
            return Response({"error": "Server error"}, status=status.HTTP_400_BAD_REQUEST)

        # For demonstration, we'll just return the parameters received
        return Response({"plaintextFileName": plaintext_file_name, "messageFileName": message_file_name,
                         "startingBit": starting_bit, "length": length, "mode": mode}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="get-files",
    )
    def get_files(self, request):
        files: Iterable[SteganographyRecord] = SteganographyRecord.objects.all()

        files_list = []
        for file in files:
            data = {'user_id': file.user.id, 'skip_bits': file.skip_bits, 'length': file.length, 'mode': file.mode, 'created': file.created}
            plaintext_data = {'file_name': os.path.basename(file.plaintext_file.name), 'file_path': os.path.relpath(file.plaintext_file.path)}
            message_data = {'file_name': os.path.basename(file.message_file.name), 'file_path': os.path.relpath(file.message_file.path)}
            encoded_data = {'file_name': os.path.basename(file.encoded_file.name), 'file_path': os.path.relpath(file.encoded_file.path)}

            data['plaintext_file'] = plaintext_data
            data['message_file'] = message_data
            data['encoded_file'] = encoded_data

            files_list.append(data)

        return JsonResponse({"status": 200, "files": files_list}, status=status.HTTP_200_OK)
