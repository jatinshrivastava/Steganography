import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "./api";

export const Services = {
  // Thunks

  // Login User
  loginUser: createAsyncThunk("user/login", async (data) => {
    try {
      const response = await api.post("/api/rest/user/login/", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  }),

  // Signup User
  signupUser: createAsyncThunk("user/signup", async (data) => {
    try {
      const response = await api.post("/api/rest/user/signup/", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  }),

  // Logout User
  logoutUser: createAsyncThunk("user/logout", async () => {
    try {
      const response = await api.post("/api/rest/user/logout/");
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  }),

  // Get User Details
  getUserDetails: createAsyncThunk("loggedInUserDetails/fetch", async () => {
    const response = await api.get("/api/rest/user/logged-in-user-details/");
    return response.data;
  }),

  // File Upload
  uploadFile: createAsyncThunk("fileUpload/upload", async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/rest/file/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }),

  // Get records
  getRecords: createAsyncThunk("records/get", async () => {
    const res = await api.post("/api/rest/file/get-records/");
    return res.data;
  }),

  // Get Files
  getFiles: createAsyncThunk("files/get", async () => {
    const res = await api.post("/api/rest/file/get-files/");
    return res.data;
  }),

  // Get User Hashes
  getUserHashes: createAsyncThunk("userHashes/get", async () => {
    const res = await api.post("/api/rest/crypto/get-user-hashes/");
    return res.data;
  }),

  // Get Files
  hashFile: createAsyncThunk("files/hash", async ({ file_id }) => {
    // Construct the request body
    const requestBody = {
      file_id,
    };
    const res = await api.post("/api/rest/crypto/hash-file/", requestBody);
    return res.data;
  }),

  // File Encode
  encodeData: createAsyncThunk(
    "fileEncoding/encode",
    async ({
      plaintext_file_id,
      message_file_id,
      startingBit,
      length,
      mode,
    }) => {
      // Construct the request body
      const requestBody = {
        plaintext_file_id,
        message_file_id,
        startingBit,
        length,
        mode,
      };

      // Make the API call
      const res = await api.post("/api/rest/file/encode/", requestBody);

      // Return the response data
      return res.data;
    },
  ),

  // Delete Record
  deleteRecord: createAsyncThunk(
    "recordDelete/delete-record",
    async ({ file_name }) => {
      // Construct the request body
      const requestBody = {
        file_name,
      };

      // Make the API call
      const res = await api.post(
        "/api/rest/record/delete-record/",
        requestBody,
      );

      // Return the response data
      return res.data;
    },
  ),

  // Delete File
  deleteFile: createAsyncThunk("fileDelete/delete", async ({ file_id }) => {
    // Construct the request body
    const requestBody = {
      file_id,
    };

    // Make the API call
    const res = await api.post("/api/rest/file/delete/", requestBody);

    // Return the response data
    return res.data;
  }),

  // Decode File
  decodeFile: createAsyncThunk("fileDecode/decode", async ({ record_id }) => {
    // Construct the request body
    const requestBody = {
      record_id,
    };

    // Make the API call
    const res = await api.post("/api/rest/file/decode/", requestBody);

    // Return the response data
    return res.data;
  }),

  // Generate Key
  generateKey: createAsyncThunk("crypto/generateKey", async ({ name }) => {
    // Construct the request body
    const requestBody = {
      name,
    };

    // Make the API call
    const res = await api.post("/api/rest/crypto/generateKey/", requestBody);

    // Return the response data
    return res.data;
  }),

  // Delete Key
  deleteKey: createAsyncThunk("crypto/deleteKey", async ({ key_id }) => {
    // Construct the request body
    const requestBody = {
      key_id,
    };

    // Make the API call
    const res = await api.post("/api/rest/crypto/deleteKey/", requestBody);

    // Return the response data
    return res.data;
  }),

  // Get User Key(s)
  getUserKeys: createAsyncThunk("crypto/getUserKeys", async ({ user_id }) => {
    // Construct the request body
    const requestBody = {
      user_id,
    };

    // Make the API call
    const res = await api.post("/api/rest/crypto/getUserKeys/", requestBody);

    // Return the response data
    return res.data;
  }),

  // Encrypt File
  encryptFile: createAsyncThunk(
    "crypto/encrypt-file",
    async ({ file_id, key_id }) => {
      // Construct the request body
      const requestBody = {
        file_id,
        key_id,
      };

      // Make the API call
      const res = await api.post("/api/rest/crypto/encrypt-file/", requestBody);

      // Return the response data
      return res.data;
    },
  ),

  // Decrypt File
  decryptFile: createAsyncThunk(
    "crypto/decrypt-file",
    async ({ file_id, key_id }) => {
      // Construct the request body
      const requestBody = {
        file_id,
        key_id,
      };

      // Make the API call
      const res = await api.post("/api/rest/crypto/decrypt-file/", requestBody);

      // Return the response data
      return res.data;
    },
  ),

  // Reducer
  fileUploadReducer: createSlice(
    {
      name: "fileUpload",
      reducers: {},
      extraReducers: (builder) => {
        builder.addCase(Services.uploadFile.pending, (state) => {
          state.uploading = true;
          state.error = null;
        });
        builder.addCase(Services.uploadFile.fulfilled, (state, action) => {
          state.uploading = false;
          state.uploadedFile = action.payload;
        });
        builder.addCase(Services.uploadFile.rejected, (state, action) => {
          state.uploading = false;
          state.error = action.error.message;
        });
      },
    },
    {
      name: "fileEncoding",
      reducers: {},
      extraReducers: (builder) => {
        builder.addCase(Services.encodeData.pending, (state) => {
          state.encoding = true;
          state.error = null;
        });
        builder.addCase(Services.encodeData.fulfilled, (state, action) => {
          state.encoding = false;
          state.encodedData = action.payload;
        });
        builder.addCase(Services.encodeData.rejected, (state, action) => {
          state.encoding = false;
          state.error = action.error.message;
        });
      },
    },
  ).reducer,
};
