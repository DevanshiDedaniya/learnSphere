import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";
//import Signup from "../../pages/Auth/Signup";

const token = localStorage.getItem("token") || null;

const initialState = {
  user: null,
  token,
  loading: false,
  error: null,
};

// Register User
// export const registerUser = createAsyncThunk(
//   "auth/register",
//   async (userData, thunkAPI) => {
//     try {
//       const res = await authService.register(userData);
//       localStorage.setItem("token", res.token);
//       localStorage.setItem("user", JSON.stringify(res.user));
//       return res;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to register");
//     }
//   }
// );
export const signup = createAsyncThunk("auth/signup", async (userData, thunkAPI) => {
  try {
    const res = await authService.signup(userData);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Signup failed");
  }
});

// Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Fetch Profile
export const getProfile = createAsyncThunk("auth/getProfile", async (_, thunkAPI) => {
  try {
    return await authService.getProfile();
  } catch (err) {
    return thunkAPI.rejectWithValue("Failed to fetch profile");
  }
});

// Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      return await authService.updateProfile(data);
    } catch (err) {
      return thunkAPI.rejectWithValue("Profile update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
