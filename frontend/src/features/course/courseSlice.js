import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import courseService from "./courseService";


export const fetchCourses = createAsyncThunk(
  "courses/fetchAll",
  async (searchTerm = "", thunkAPI) => {
    try {
      const data = await courseService.getAllCourses(searchTerm);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);



export const getCourseDetail = createAsyncThunk("courses/getOne", async (id, thunkAPI) => {
  try {
    return await courseService.getCourseById(id); 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const createCourse = createAsyncThunk("courses/create", async (data, thunkAPI) => {
  try {
    const res = await courseService.createCourse(data);
    console.log("Course created:", res);
    return res;
  } catch (error) {
    console.error("Create course error:", error.response || error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const fetchInstructorCourses = createAsyncThunk(
  "courses/instructor",
  async (_, thunkAPI) => {
    try {
      const data = await courseService.getInstructorCourses();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const deleteCourse = createAsyncThunk("courses/delete", async (id, thunkAPI) => {
  try {
    await courseService.deleteCourse(id);
    return id; 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const updateCourse = createAsyncThunk("courses/update", async ({ id, data }, thunkAPI) => {
  try {
    const updated = await courseService.updateCourse(id, data);
    return updated;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const courseSlice = createSlice({
  name: "course",
  initialState: {
    courses: [],
    course: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload?.courses || [];
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCourseDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourseDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload;
      })
      .addCase(getCourseDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(fetchInstructorCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload?.courses || [];
      })
      .addCase(fetchInstructorCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.unshift(action.payload); 
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export default courseSlice.reducer;
