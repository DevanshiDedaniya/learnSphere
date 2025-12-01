import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import courseReducer from "../features/course/courseSlice";
import enrollmentReducer from "../features/enrollment/enrollmentSlice";
import certificateReducer from "../features/certificate/certificateSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
    certificate: certificateReducer,
  },
});

export default store;
