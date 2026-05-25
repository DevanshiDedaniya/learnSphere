import API from "../../api/axiosConfig";


const signup = async (userData) => {
  const res = await API.post("/auth/signup", userData);
  const result = res.data?.data;

  if (result?.token) {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }
  return result;
};


const login = async (userData) => {
  try {
    const res = await API.post("/auth/login", userData);
    const result = res.data?.data;

    if (result?.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  } catch (error) {
    console.error("Login Failed:", error);
    throw error; 
  }
};


const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


const getProfile = async () => {
  const res = await API.get("/auth/profile");
  return res.data?.data;
};


const updateProfile = async (profileData) => {
  const res = await API.put("/auth/profile", profileData);
  return res.data?.data;
};


const authService = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
};

export default authService;
