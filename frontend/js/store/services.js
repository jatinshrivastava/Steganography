import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "./api";

// Thunks

// Login User
export const loginUser = createAsyncThunk("user/login", async (data) => {
  try {
    const response = await api.post("/api/rest/user/login/", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
});

// Logout User
export const logoutUser = createAsyncThunk("user/logout", async () => {
  try {
    const response = await api.post("/api/rest/user/logout/");
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
});

// Get User Details
export const getUserDetails = createAsyncThunk(
  "loggedInUserDetails/fetch",
  async () => {
    const response = await api.get("/api/rest/logged-in-user-details/");
    return response.data;
  },
);

// File Upload
export const uploadFile = createAsyncThunk(
  "fileUpload/upload",
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/rest/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },
);

// File Upload
export const getFiles = createAsyncThunk("files/get", async () => {
  const res = await api.post("/api/rest/get-files/");
  return res.data;
});

// File Encode
export const encodeData = createAsyncThunk(
  "fileEncoding/encode",
  async ({ plaintext_file_id, message_file_id, startingBit, length, mode }) => {
    // Construct the request body
    const requestBody = {
      plaintext_file_id,
      message_file_id,
      startingBit,
      length,
      mode,
    };

    // Make the API call
    const res = await api.post("/api/rest/encode/", requestBody);

    // Return the response data
    return res.data;
  },
);

// Reducer
export const fileUploadReducer = createSlice(
  {
    name: "fileUpload",
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
      });
      builder.addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadedFile = action.payload;
      });
      builder.addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message;
      });
    },
  },
  {
    name: "fileEncoding",
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(encodeData.pending, (state) => {
        state.encoding = true;
        state.error = null;
      });
      builder.addCase(encodeData.fulfilled, (state, action) => {
        state.encoding = false;
        state.encodedData = action.payload;
      });
      builder.addCase(encodeData.rejected, (state, action) => {
        state.encoding = false;
        state.error = action.error.message;
      });
    },
  },
).reducer;
