import os
import random
import string
import time
from collections.abc import Iterable

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import AnonymousUser
from django.core.files.base import File
from django.db import IntegrityError
from django.http import JsonResponse, FileResponse
from django.views import generic

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from common.models import SteganographyRecord, UploadedFile, CryptographicKey, FileHash
from users.models import User
from common.utils.utils import Utils


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
        username = request.data.get("username")
        password = request.data.get("password")

        # Authenticate user
        user = authenticate(username=username, password=password)

        if user is not None:
            # Login the user
            login(request, user)
            # Return user details
            user_details = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "status": 200,
            }
            return Response(user_details, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="user/signup",
    )
    def signup(self, request):
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        password = request.data.get("password")

        # Check if a user with the same email already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new user instance
        user = User.objects.create_user(email=email, first_name=first_name, last_name=last_name,
                                        password=password)

        # Return user details
        user_details = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "status": 200,
        }
        return Response(user_details, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="user/logout",
    )
    def logout(self, request):
        logout(request)
        return Response(
            {"message": "User logged out successfully.", "status": 200}, status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="user/logged-in-user-details",
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
        url_path="file/upload",
    )
    def upload_file(self, request):
        file_obj = request.FILES.get("file")
        if file_obj is None:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Process the uploaded file here (save it, manipulate it, etc.)
        # For demonstration, we'll just return the file name
        # Save file
        my_file = UploadedFile(file=file_obj, user=request.user)
        my_file.save()

        # Get file name
        saved_file = my_file.file
        file_name = os.path.basename(saved_file.path)
        file_length = len(Utils.file_to_bitarray(saved_file.path))
        magic_number = Utils.get_magic_number(saved_file.path)

        return JsonResponse(
            {
                "status": 200,
                "file_name": file_name,
                "file_id": my_file.id,
                "bitarray_length": file_length,
                "magic_number": magic_number,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], url_path='file/download')
    def download_file(self, request, pk=None):
        # Get the file path from the request
        file_path = request.GET.get('file_path')

        if file_path is None:
            return Response({"error": "No file path provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Open the file
        file = open(file_path, 'rb')

        # Create a FileResponse instance to serve the file
        response = FileResponse(file, as_attachment=True)

        return response

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="file/encode",
    )
    def encode_file(self, request):
        # Extract parameters from the request
        plaintext_file_id = request.data.get("plaintext_file_id")
        message_file_id = request.data.get("message_file_id")
        message_text = request.data.get("message")
        starting_bit = request.data.get("startingBit")
        length = request.data.get("length")
        mode = request.data.get("mode")

        # Check if all required parameters are provided
        if None in (plaintext_file_id, starting_bit, length, mode):
            return Response(
                {"error": "All parameters are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not message_file_id and not message_text:
            return Response(
                {"error": "Provide either upload a file or type a message!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch file from db:
        plaintext_file = UploadedFile.objects.get(pk=plaintext_file_id).file

        if message_file_id:
            message_file = UploadedFile.objects.get(pk=message_file_id).file

            # Check File Size Valid
            file_size_valid = Utils.check_file_lengths_valid(plaintext_file.path, message_file.path)

            if not file_size_valid:
                return Response(
                    {"error": "Size of the plaintext file should be more than the message file!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # success, modified_file_name = encode_message(plaintext_file_name, message_file_name, starting_bit,
            #                                              length, mode)

            encoded_file = Utils.encode_message_simple(
                plaintext_file.path, starting_bit, length, message_file_path=message_file.path)

        else:
            message_file = None
            encoded_file = Utils.encode_message_simple(
                plaintext_file.path, starting_bit, length, message=message_text)

        if encoded_file is not None:
            record = Utils.create_record(
                request.user, plaintext_file, message_file, encoded_file, starting_bit, length, mode
            )
            return JsonResponse(
                {
                    "status": 200,
                    "message": "Encoding successful",
                    "encoded_file_name": encoded_file.name,
                    # "plaintext_file_name": plaintext_file_name,
                    # "message_file_name": message_file_name,
                    "starting_bit": starting_bit,
                    "length": length,
                    "mode": mode,
                },
                status=status.HTTP_200_OK,
            )

        else:
            # Delete plaintext file and message file
            # default_storage.delete(get_file_path(plaintext_file_name))
            # default_storage.delete(get_file_path(message_file_name))
            return Response({"error": "Server error"}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="file/get-records",
    )
    def get_records(self, request):
        files: Iterable[SteganographyRecord] = SteganographyRecord.objects.all()

        files_list = []
        for file in files:
            data = {
                "record_id": file.pk,
                "user_email": file.user.email,
                "user_name": file.user.get_full_name(),
                "created_on": file.created,
                "skip_bits": file.skip_bits,
                "length": file.length,
                "mode": file.mode,
                "created": file.created,
            }
            plaintext_data = {
                "file_name": os.path.basename(file.plaintext_file.name),
                "file_path": os.path.relpath(file.plaintext_file.path),
            }
            message_data = {}
            try:
                message_data = {
                    "file_name": os.path.basename(file.message_file.name),
                    "file_path": os.path.relpath(file.message_file.path),
                }
            except ValueError:
                pass
            encoded_data = {
                "file_name": os.path.basename(file.encoded_file.name),
                "file_path": os.path.relpath(file.encoded_file.path),
            }

            data["plaintext_file"] = plaintext_data
            data["message_file"] = message_data
            data["encoded_file"] = encoded_data

            files_list.append(data)

        return JsonResponse({"status": 200, "files": files_list}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="record/delete-record",
    )
    def delete_record(self, request):
        encoded_file_name = request.data.get("file_name")
        try:
            first_record = SteganographyRecord.objects.filter(
                encoded_file__contains=encoded_file_name
            ).first()

            # Delete record
            plaintext_file_name = os.path.basename(first_record.plaintext_file.path)
            message_file_name = os.path.basename(first_record.message_file.path)
            first_record.delete()

            # Delete Plaintext file
            plaintext_file = UploadedFile.objects.filter(file__contains=plaintext_file_name).first()
            plaintext_file.delete()

            # Delete message file
            message_file = UploadedFile.objects.filter(file__contains=message_file_name).first()
            message_file.delete()

            return Response(
                {"status": 200, "message": "File deleted successfully!"}, status=status.HTTP_200_OK
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 404, "message": "Unable to delete file!"}, status=status.HTTP_200_OK
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="file/delete",
    )
    def delete_file(self, request):
        file_id = request.data.get("file_id")
        try:
            first_record = UploadedFile.objects.get(pk=file_id)

            # Delete record
            first_record.delete()

            return Response(
                {"status": 200, "message": "File deleted successfully!"}, status=status.HTTP_200_OK
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 404, "message": "Unable to delete file!"}, status=status.HTTP_200_OK
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="file/decode",
    )
    def decode_file(self, request):
        record_id = request.data.get("record_id")
        try:
            first_record = SteganographyRecord.objects.get(id=record_id)

            # Decode File
            decoded_message = Utils.decode_message_simple(first_record.encoded_file.path)

            # Check if decoded message is a file
            if isinstance(decoded_message, File):
                # Save to UploadFile DB
                my_file = UploadedFile(user=request.user, file=decoded_message)
                my_file.save()

                # Get File name and path
                saved_file = my_file.file
                file_name = os.path.basename(saved_file.path)

                return Response(
                    {
                        "status": 200,
                        "file_name": file_name,
                        "file_path": os.path.relpath(saved_file.path),
                        "file_id": my_file.pk
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # Return message if the decoded content is text
                return Response(
                    {"status": 200, "message": decoded_message}, status=status.HTTP_200_OK
                )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 404, "message": "Unable to decode file!"}, status=status.HTTP_200_OK
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="crypto/generateKey",
    )
    def generate_key(self, request):
        name = request.data.get("name")
        try:
            start_time = time.time()
            key = Utils.generate_key()
            end_time = time.time()  # Stop the timer

            record = CryptographicKey(
                user=request.user,
                name=name,
                key=key
            )
            record.save()

            return Response(
                {
                    "status": 200,
                    "key": key,
                    "name": name,
                    "time_taken": Utils.get_time_taken(start_time, end_time),
                    "message": "Key generated successfully!",
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to generate key(s)!"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="crypto/deleteKey",
    )
    def delete_key(self, request):
        key_id = request.data.get("key_id")
        try:
            first_record = CryptographicKey.objects.get(pk=key_id)

            # Delete record
            first_record.delete()

            return Response(
                {
                    "status": 200,
                    "message": "Key deleted successfully!",
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to generate key(s)!"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="crypto/getUserKeys",
    )
    def getUserKeys(self, request):
        user_id = request.data.get("user_id")
        keys: Iterable[CryptographicKey] = CryptographicKey.objects.filter(user__id=user_id)

        try:
            lst = []
            for record in keys:
                data = {
                    "id": record.id,
                    "key": record.key,
                    "name": record.name,
                    "created": record.created,
                }
                lst.append(data)

            return Response(
                {
                    "status": 200,
                    "keys": lst,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to get key(s)!"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="file/get-files",
    )
    def get_files(self, request):
        files: Iterable[UploadedFile] = UploadedFile.objects.filter(user__id=request.user.id)

        files_list = []
        for file in files:
            data = {
                "id": file.pk,
                "user_name": file.user.get_full_name(),
                "file_name": os.path.basename(file.file.name),
                "created": file.created,
                "file_path": os.path.relpath(file.file.path)

            }

            files_list.append(data)

        return JsonResponse({"status": 200, "files": files_list}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="crypto/hash-file",
    )
    def hash_file(self, request):
        file_id = request.data.get("file_id")
        uploaded_file = UploadedFile.objects.get(pk=file_id)
        try:
            file = uploaded_file.file
            start_time = time.time()
            hashed_file = Utils.hash_file(file.path)
            end_time = time.time()  # Stop the timer
            file_name = os.path.basename(file.path).split(".")[0]

            # Generate a random 4-character string
            random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
            # Create a hash_name from the uploaded_file's name and the random string
            hash_name = f"{file_name}_{random_string}_hash"
            record = FileHash(
                user=request.user,
                file=uploaded_file,
                hash=hashed_file,
                name=hash_name,
            )
            record.save()

            return Response(
                {
                    "status": 200,
                    "hash_name": hash_name,
                    "time_taken": Utils.get_time_taken(start_time, end_time),
                    "message": "File hashed successfully!",
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to hash file!"}, status=status.HTTP_400_BAD_REQUEST
            )

        except IntegrityError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Hash already exists!"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="crypto/encrypt-file",
    )
    def encrypt_file(self, request):
        file_id = request.data.get("file_id")
        key_id = request.data.get("key_id")
        uploaded_file: UploadedFile = UploadedFile.objects.get(pk=file_id)
        key: CryptographicKey = CryptographicKey.objects.get(pk=key_id)
        try:
            file = uploaded_file.file
            start_time = time.time()
            encrypted_file = Utils.encrypt_file(file.path, key.key.encode())
            end_time = time.time()  # Stop the timer

            my_file = UploadedFile(file=encrypted_file, user=request.user)
            my_file.save()

            saved_file = my_file.file
            file_name = os.path.basename(saved_file.path)

            return Response(
                {
                    "status": 200,
                    "file_name": file_name,
                    "file_id": my_file.id,
                    "time_taken": Utils.get_time_taken(start_time, end_time),
                    "message": "File encrypted successfully!",
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to encrypt file!"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="crypto/decrypt-file",
    )
    def decrypt_file(self, request):
        file_id = request.data.get("file_id")
        key_id = request.data.get("key_id")
        uploaded_file: UploadedFile = UploadedFile.objects.get(pk=file_id)
        key: CryptographicKey = CryptographicKey.objects.get(pk=key_id)
        try:
            file = uploaded_file.file
            start_time = time.time()
            encrypted_file = Utils.decrypt_file(file.path, key.key.encode())
            end_time = time.time()  # Stop the timer

            if encrypted_file is not None:
                my_file = UploadedFile(file=encrypted_file, user=request.user)
                my_file.save()

                saved_file = my_file.file
                file_name = os.path.basename(saved_file.path)

                return Response(
                    {
                        "status": 200,
                        "file_name": file_name,
                        "file_id": my_file.id,
                        "time_taken": Utils.get_time_taken(start_time, end_time),
                        "message": "File encrypted successfully!",
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"status": 400, "message": "Unable to encrypt file!"}, status=status.HTTP_400_BAD_REQUEST
                )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to encrypt file!"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="crypto/get-user-hashes",
    )
    def get_user_hashes(self, request):
        hashes: Iterable[FileHash] = FileHash.objects.filter(user__id=request.user.id)

        hashes_list = []
        try:
            for hash_data in hashes:
                data = {
                    "id": hash_data.pk,
                    "file_name": os.path.basename(hash_data.file.file.path),
                    "hash_name": hash_data.name,
                    "hash": hash_data.hash,
                    "created": hash_data.created,
                }

                hashes_list.append(data)

            return Response(
                {
                    "status": 200,
                    "hashes": hashes_list,
                    "message": "Successful!",
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print(f"Error occured: {e}")
            return Response(
                {"status": 400, "message": "Unable to get hashes!"}, status=status.HTTP_400_BAD_REQUEST
            )
