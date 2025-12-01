import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import certificateService from "./certificateService";

// 🔹 Fetch certificates
export const fetchCertificates = createAsyncThunk(
  "certificate/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await certificateService.getCertificates();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// 🔹 Issue certificate
export const issueCertificate = createAsyncThunk(
  "certificate/issue",
  async (enrollmentId, thunkAPI) => {
    try {
      return await certificateService.issueCertificate(enrollmentId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const certificateSlice = createSlice({
  name: "certificate",
  initialState: {
    certificates: [],
    loading: false,
    message: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload.certificates || [];
      })
      .addCase(fetchCertificates.rejected, (state) => {
        state.loading = false;
      })
      .addCase(issueCertificate.fulfilled, (state, action) => {
        state.certificates.push(action.payload.certificate);
        state.message = action.payload.message;
      });
  },
});

export default certificateSlice.reducer;
