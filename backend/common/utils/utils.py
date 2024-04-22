import base64
import os

from cryptography.fernet import Fernet, InvalidToken
# import puremagic
from django.conf import settings
from django.core.files.base import ContentFile, File
from django.core.files.storage import default_storage

import bitarray
import hashlib

from common.models import SteganographyRecord


class Utils:

    @staticmethod
    def get_time_taken(start_time: float, end_time: float) -> float:
        time_taken = (end_time - start_time) * 1000  # Calculate the time taken in milliseconds
        # Format the time taken to 3 decimal places
        time_taken = format(time_taken, '.3f')
        return float(time_taken)

    @staticmethod
    def file_to_bitarray(file_path):
        with open(file_path, "rb") as f:
            data = f.read()
        bit_array = bitarray.bitarray()
        bit_array.frombytes(data)
        return bit_array

    @staticmethod
    def get_file_path(file_name):
        # Construct the file path using MEDIA_ROOT and the file name
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        return file_path

    @staticmethod
    def get_file_size(file_path):
        # Get the size of the file in bytes
        file_size = os.path.getsize(file_path)
        return file_size

    @staticmethod
    def check_file_lengths_valid(plaintext_path, message_path):
        plaintext_size = Utils.get_file_size(plaintext_path)
        message_size = Utils.get_file_size(message_path)

        if plaintext_size > message_size:
            return True
        else:
            return False

    @staticmethod
    def read_file(file_path):
        with open(file_path, "rb") as file:
            content = file.read()
        return content

    @staticmethod
    def get_file_from_path(file_path):
        return File(open(file_path, "rb"))

    @staticmethod
    def write_file(file_name, content):
        # Save content using Django's default_storage
        file_name = default_storage.save(file_name, ContentFile(content))
        print(f"File name is: {file_name}")
        path = os.path.relpath(os.path.join(settings.MEDIA_ROOT, file_name))
        print(f"path is : {path}")
        # Return the full file path
        return Utils.get_file_from_path(path)

    @staticmethod
    def get_message_length(message_file_name):
        # Read content of message file
        message_content = Utils.read_file(Utils.get_file_path(message_file_name))

        # Convert content to binary string
        message_binary = "".join(format(byte, "08b") for byte in message_content)

        # Return length of binary string
        return len(message_binary)

    @staticmethod
    def get_magic_number(file_name):
        # print(f'val is: {puremagic.magic_file(get_file_path(file_name))}')
        # print(f'Magic number is: {magic_number}')
        return 0

    @staticmethod
    def get_header_size(mime_type):
        if mime_type == "image/jpeg":
            return 20  # JPEG files have a 20 byte header
        elif mime_type == "video/quicktime":
            return 8  # QuickTime files have an 8 byte header
        elif mime_type == "video/mp4":
            return 8  # MP4 files also have an 8 byte header
        elif mime_type == "text/plain":
            return 0  # Plain text files don't have a header
        else:
            return None  # Return None for unknown MIME types

    def encode_message(plaintext_file_name, message_file_name, starting_bit, length, mode):
        # Read content of plaintext and message files
        plaintext_content = Utils.read_file(Utils.get_file_path(plaintext_file_name))
        message_content = Utils.read_file(Utils.get_file_path(message_file_name))

        # Convert content to binary strings
        plaintext_binary = "".join(format(byte, "08b") for byte in plaintext_content)
        message_binary = "".join(format(byte, "08b") for byte in message_content)

        # Define initial length (L) and increment value based on mode (C)
        if mode == "enhanced":
            length_increment = 8
        else:
            length_increment = 0  # Default mode without length adjustment

        # Embed message into plaintext at specified position with dynamic length adjustment
        for i in range(starting_bit, len(plaintext_binary), length):
            if i + len(message_binary) > len(plaintext_binary):
                break
            plaintext_binary = (
                plaintext_binary[:i] + message_binary[:length] + plaintext_binary[i + length:]
            )
            # Increment length according to mode (C)
            length += length_increment
            if length > 8:
                length = 8  # Reset length to 8 if it exceeds maximum value (for cyclic adjustment)

        # Add the starting bit and length to the beginning of the binary string
        plaintext_binary = format(starting_bit, "016b") + format(length, "016b") + plaintext_binary

        # Convert binary string back to bytes
        modified_plaintext_content = bytes(
            [int(plaintext_binary[i: i + 8], 2) for i in range(0, len(plaintext_binary), 8)]
        )

        # Save modified plaintext file
        modified_plaintext_file_name = (
            os.path.splitext(plaintext_file_name)[0]
            + "_encoded"
            + os.path.splitext(plaintext_file_name)[1]
        )
        Utils.write_file(modified_plaintext_file_name, modified_plaintext_content)

        # Check if encoding was successful
        if os.path.exists(Utils.get_file_path(modified_plaintext_file_name)):
            # Compare file size with original plaintext file
            original_size = os.path.getsize(Utils.get_file_path(plaintext_file_name))
            modified_size = os.path.getsize(Utils.get_file_path(modified_plaintext_file_name))
            if modified_size > original_size or modified_size == original_size:
                return True, modified_plaintext_file_name
            else:
                return False, None
        else:
            return False, None

    @staticmethod
    def decode_message(encoded_file_name):
        # Read content of encoded file
        encoded_content = Utils.read_file(Utils.get_file_path(encoded_file_name))

        # Convert content to binary string
        encoded_binary = "".join(format(byte, "08b") for byte in encoded_content)

        # Extract starting bit and length from the beginning of the binary string
        starting_bit = int(encoded_binary[:16], 2)
        length = int(encoded_binary[16:32], 2)

        # Extract message from encoded binary string
        message_binary = ""
        for i in range(32 + starting_bit, len(encoded_binary), length):
            message_binary += encoded_binary[i: i + length]

        # Convert binary string back to bytes
        message_content = bytes(
            [int(message_binary[i: i + 8], 2) for i in range(0, len(message_binary), 8)]
        )

        # Save decoded message to file
        message_file_name = (
            os.path.splitext(encoded_file_name)[0] + "_decoded" + os.path.splitext(encoded_file_name)[1]
        )
        Utils.write_file(message_file_name, message_content)

        # Check if decoding was successful
        if os.path.exists(Utils.get_file_path(message_file_name)):
            return True, message_file_name
        else:
            return False, None

    @staticmethod
    def encode_message_simple(plaintext_file_path, skip_bits, length, message_file_path=None, message=None):
        # Read content of plaintext file
        plaintext_content = Utils.read_file(plaintext_file_path)
        # Convert content to binary string
        plaintext_binary = "".join(format(byte, "08b") for byte in plaintext_content)

        # Initialize flag to indicate type of embedding
        embedding_flag = 0

        if message_file_path is None and message is not None:
            # Convert message string to binary
            # if message.isdigit():  # Check if the message is a complete integer
            #     print('dsad')
            #     # Convert message string to binary
            #     message_binary = bin(int(message))[2:].zfill(8)  # Convert integer to binary string and pad with leading zeros
            #     print(f"message_binary is {message_binary}")
            # else:
            #     print('chat')
            #     # Convert message string to binary
            #     message_binary = "".join(format(ord(char), "08b") for char in message)
            # embedding_flag = 1  # Set flag to indicate text embedding


            message_binary = "".join(format(ord(char), "08b") for char in message)
            embedding_flag = 1  # Set flag to indicate text embedding

        elif message_file_path:
            # Read content of message file
            message_content = Utils.read_file(message_file_path)
            # Convert content to binary string
            message_binary = "".join(format(byte, "08b") for byte in message_content)

        # Embed message into plaintext at specified position with dynamic length adjustment
        j = 0
        for i in range(skip_bits, len(plaintext_binary), length):
            if j >= len(message_binary):
                break
            plaintext_binary = plaintext_binary[:i] + message_binary[j] + plaintext_binary[i + 1:]
            j += 1

        # Update the encoded binary with metadata about the embedded message and embedding flag
        encoded_binary = (
            plaintext_binary
            + format(skip_bits, "016b")
            + format(length, "016b")
            + format(len(message_binary), "016b")
            + format(embedding_flag, "016b")  # Add embedding flag
        )

        # Convert binary string back to bytes
        file_bytes = bytes(
            [int(encoded_binary[i: i + 8], 2) for i in range(0, len(encoded_binary), 8)]
        )

        # Save encoded file
        plaintext_file_name = os.path.basename(plaintext_file_path)
        encoded_file_name = (
            os.path.splitext(plaintext_file_name)[0]
            + "_encoded"
            + os.path.splitext(plaintext_file_name)[1]
        )
        content_file = ContentFile(file_bytes, name=encoded_file_name)
        return File(content_file)

    @staticmethod
    def decode_message_simple(encoded_file_path):
        # Read content of encoded file
        encoded_content = Utils.read_file(encoded_file_path)

        # Convert content to binary string
        encoded_binary = "".join(format(byte, "08b") for byte in encoded_content)

        # Extract the embedding flag from the encoded binary
        embedding_flag = int(encoded_binary[-16:], 2)  # Last 16 bits represent the embedding flag

        # Extract the skip_bits, length, and original_message_length from the last 64 bits
        skip_bits = int(encoded_binary[-64:-48], 2)  # Bits 49 to 34 from the end
        length = int(encoded_binary[-48:-32], 2)  # Bits 33 to 18 from the end
        original_message_length = int(encoded_binary[-32:-16], 2)  # Bits 17 to 2 from the end
        # Extract the message from the encoded binary string based on the embedding flag
        if embedding_flag == 0:  # File embedding
            message_binary = ""
            for i in range(skip_bits, skip_bits + original_message_length * length, length):
                # Check if index is out of range
                if i >= len(encoded_binary) - 64:
                    break
                message_binary += encoded_binary[i]

            # Convert binary string back to bytes
            file_bytes = bytes(
                [int(message_binary[i: i + 8], 2) for i in range(0, len(message_binary), 8)]
            )

            # Save decoded message to file
            encoded_file_name = os.path.basename(encoded_file_path)
            message_file_name = (
                os.path.splitext(encoded_file_name)[0] + "_decoded" + os.path.splitext(encoded_file_name)[1]
            )
            content_file = ContentFile(file_bytes, name=message_file_name)

            return File(content_file)
        elif embedding_flag == 1:  # Text embedding
            # Adjusting for skip bits and length in text embedding
            message_binary = ""
            for i in range(skip_bits, skip_bits + original_message_length * length, length):
                # Check if index is out of range
                if i >= len(encoded_binary) - 64:
                    break
                message_binary += encoded_binary[i]

            # Convert binary string to text
            message_text = "".join(chr(int(message_binary[i: i + 8], 2)) for i in range(0, len(message_binary), 8))
            return message_text
        else:
            # Handle invalid embedding flag
            raise ValueError("Invalid embedding flag detected in the encoded file.")

    @staticmethod
    def create_record(
        current_user, plaintext_file, message_file, encoded_file, skip_bits, length, mode
    ):
        # Create a new SteganographyRecord instance
        record = SteganographyRecord(
            user=current_user,
            plaintext_file=plaintext_file,
            message_file=message_file,
            encoded_file=encoded_file,
            skip_bits=skip_bits,
            length=length,
            mode=mode,
        )
        return record.save()

    @staticmethod
    def generate_key():
        return Fernet.generate_key().decode()
        # return Fernet.generate_key()

    @staticmethod
    def hash_file(file_path):
        hasher = hashlib.sha256()
        with open(file_path, 'rb') as f:
            while True:
                data = f.read(65536)  # Read in 64kb chunks
                if not data:
                    break
                hasher.update(data)
        return hasher.hexdigest()

    @staticmethod
    def encrypt_file(file_path, key):
        # Decode the key from base64
        # key = base64.urlsafe_b64decode(key)


        # Create a Fernet object with the provided key
        cipher_suite = Fernet(key)

        main_file_content = Utils.read_file(file_path)

        # # Read the file data
        # with open(file_path, 'rb') as file:
        #     file_data = file.read()

        # Encrypt the file data
        encrypted_data = cipher_suite.encrypt(main_file_content)

        main_file_name = os.path.basename(file_path)

        encrypted_file_name = (
            main_file_name + ".enc"
        )

        # Write the encrypted data to a new file
        content_file = ContentFile(encrypted_data, name=encrypted_file_name)
        return File(content_file)

    @staticmethod
    def decrypt_file(file_path, key):
        # Decode the key from base64
        key = base64.urlsafe_b64decode(key)

        # Create a Fernet object with the provided key
        cipher_suite = Fernet(key)

        main_file_content = Utils.read_file(file_path)

        # # Read the file data
        # with open(file_path, 'rb') as file:
        #     file_data = file.read()

        try:
            # Decrypt the file data
            decrypted_data = cipher_suite.decrypt(main_file_content)
        except InvalidToken:
            print("Decryption failed. The key is invalid.")
            return None

        file_name = os.path.basename(file_path)

        base_name, extension = os.path.splitext(file_name)

        print(f'base name: {base_name}')

        # Write the encrypted data to a new file
        content_file = ContentFile(decrypted_data, name=base_name)
        return File(content_file)

# def encode_message_optimized(plaintext_file_name, message_file_name, starting_bit, length, mode):
#     # Read content of plaintext and message files
#     plaintext_content = np.fromfile(get_file_path(plaintext_file_name), dtype=np.uint8)
#     message_content = np.fromfile(get_file_path(message_file_name), dtype=np.uint8)
#     # Define initial length (L) and increment value based on mode (C)
#     if mode == 'enhanced':
#         length_increment = 8
#     else:
#         length_increment = 0  # Default mode without length adjustment
#
#     # Ensure the starting bit is within the range of the plaintext content
#     starting_byte = starting_bit // 8
#     starting_bit_offset = starting_bit % 8
#     plaintext_length = len(plaintext_content)
#
#     # Embed message into plaintext at specified position with dynamic length adjustment
#     message_length = len(message_content)
#     message_index = 0
#     while message_index < message_length:
#         print(f'message_index: {message_index}, message_length:{message_length}')
#         # Calculate the current length for this iteration
#         current_length = min(length, 8 - starting_bit_offset)
#         print(f'current_length:{current_length}')
#         # Calculate the end index for this iteration
#         end_byte = min(starting_byte + (length // 8) + 1, plaintext_length)
#
#         # Extract the relevant bits from the message
#         message_bits = np.unpackbits(message_content[message_index:message_index + (current_length // 8) + 1])
#         message_bits = message_bits[-current_length:]  # Truncate excess bits
#
#         # Extract the relevant bits from the plaintext
#         plaintext_bits = np.unpackbits(plaintext_content[starting_byte:end_byte])
#         # Overwrite the bits in the plaintext with the message bits
#         plaintext_bits[starting_bit_offset:starting_bit_offset + current_length] = message_bits[:current_length]
#
#         # Pack the modified bits back into bytes
#         modified_bytes = np.packbits(plaintext_bits)
#
#         # Update the plaintext content with the modified bytes
#         plaintext_content[starting_byte:end_byte] = modified_bytes
#
#         # Update the starting position for the next iteration
#         starting_byte += (length // 8)
#         starting_bit_offset = (starting_bit_offset + current_length) % 8
#
#         # Increment the message index
#         message_index += (current_length // 8)
#         print(f'message_index:{message_index}')
#
#         # Increment length according to mode (C)
#         length += length_increment
#         if length > 8:
#             length = 8  # Reset length to 8 if it exceeds maximum value (for cyclic adjustment)
#
#     # Save modified plaintext file using default_storage
#     modified_plaintext_file_name = default_storage.save(os.path.splitext(plaintext_file_name)[0] + '_encoded' + \
#                                                         os.path.splitext(plaintext_file_name)[1],
#                                                         ContentFile(plaintext_content.tobytes()))
#
#     # Check if encoding was successful
#     if os.path.exists(modified_plaintext_file_name):
#         # Compare file size with original plaintext file
#         original_size = os.path.getsize(get_file_path(plaintext_file_name))
#         modified_size = os.path.getsize(get_file_path(modified_plaintext_file_name))
#         if modified_size > original_size:
#             return True, modified_plaintext_file_name
#         else:
#             return False, None
#     else:
#         return False, None
