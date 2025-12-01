import API from "../../api/axiosConfig";

// Register new user
const signup = async (userData) => {
  const res = await API.post("/auth/signup", userData);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
};

// Login user
const login = async (userData) => {
  const res = await API.post("/auth/login", userData);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("token");
};

// Get profile
const getProfile = async () => {
  const res = await API.get("/auth/profile");
  return res.data;
};

// Update profile
const updateProfile = async (profileData) => {
  const res = await API.put("/auth/profile", profileData);
  return res.data;
};

const authService = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
};

export default authService;
