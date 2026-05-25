import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";


const token = localStorage.getItem("token") || null;

const initialState = {
  user: null,
  token,
  loading: false,
  error: null,
};


export const signup = createAsyncThunk("auth/signup", async (userData, thunkAPI) => {
  try {
    const res = await authService.signup(userData);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Signup failed");
  }
});


export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const result = await authService.login(userData);
      return result;
    } catch (err) {      
      if (err.response) {    
        return thunkAPI.rejectWithValue(
          err.response.data?.message || 
          err.response.data?.error || 
          `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        return thunkAPI.rejectWithValue("Cannot connect to server. Check your network.");
      } else {
        return thunkAPI.rejectWithValue(err.message || "Login failed");
      }
    }
  }
);


export const getProfile = createAsyncThunk("auth/getProfile", async (_, thunkAPI) => {
  try {
    return await authService.getProfile();
  } catch (err) {
    return thunkAPI.rejectWithValue("Failed to fetch profile");
  }
});


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
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
