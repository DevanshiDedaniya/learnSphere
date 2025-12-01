import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import courseService from "./courseService";

// 🎓 Fetch all public courses
export const fetchCourses = createAsyncThunk("courses/fetchAll", async (searchTerm = "", thunkAPI) => {
  try {
    const data = await courseService.getAllCourses(searchTerm);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


// 📘 Fetch single course detail
export const getCourseDetail = createAsyncThunk("courses/getOne", async (id, thunkAPI) => {
  try {
    return await courseService.getCourseById(id); // ✅ Fixed here
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// 🧑‍🏫 Create new course (Instructor only)
export const createCourse = createAsyncThunk("courses/create", async (data, thunkAPI) => {
  try {
    const res = await courseService.createCourse(data);
    console.log("✅ Course created:", res);
    return res;
  } catch (error) {
    console.error("❌ Create course error:", error.response || error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// 🧑‍🏫 Fetch only instructor's courses
export const fetchInstructorCourses = createAsyncThunk("courses/instructor", async (_, thunkAPI) => {
  try {
    return await courseService.getInstructorCourses();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteCourse = createAsyncThunk("courses/delete", async (id, thunkAPI) => {
  try {
    await courseService.deleteCourse(id);
    return id; // return the deleted course ID
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// ✏️ Update a course
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
      // 📘 All Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🎓 Single Course
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

      // 🧑‍🏫 Instructor Courses
      .addCase(fetchInstructorCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchInstructorCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🆕 Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.unshift(action.payload); // ✅ immediately add new course
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
        // remove deleted course from list
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✏️ Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Replace old course with updated one
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
