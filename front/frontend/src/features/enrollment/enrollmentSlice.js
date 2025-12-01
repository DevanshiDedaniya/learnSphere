import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
//import enrollmentService from "./enrollmentService";
import axios from "axios";

export const fetchEnrollments = createAsyncThunk(
  "enrollment/fetchEnrollments",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const res = await axios.get("http://localhost:5000/api/enrollments/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // array of student’s enrollments
  }
);

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState: { enrollments: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state) => {
        state.loading = false;
        state.enrollments = [];
      });
  },
});

export default enrollmentSlice.reducer;
