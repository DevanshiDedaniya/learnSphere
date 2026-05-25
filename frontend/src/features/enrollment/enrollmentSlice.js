import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import enrollmentService from "./enrollmentService";

export const fetchEnrollments = createAsyncThunk(
  "enrollment/fetchEnrollments",
  async (_, thunkAPI) => {
    try {
      const data = await enrollmentService.getMyEnrollments();
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load enrollments"
      );
    }
  }
);

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState: { enrollments: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload?.enrollments || [];
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.enrollments = [];
        state.error = action.payload;
      });
  },
});

export default enrollmentSlice.reducer;
