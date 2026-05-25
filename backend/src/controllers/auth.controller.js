import { success, error } from "../utils/response.util.js";
import {signupService,loginService,getProfileService,updateProfileService} from "../services/auth.service.js";


export const signup = async (req, res) => {
  try {
    const result = await signupService(req.body);
    return success(res, result, "User registered", 201);
  } catch (err) {
    console.error("Register error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Server error";
    return error(res, message, statusCode);
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    return success(res, result, "Login successful", 200);
  } catch (err) {
    console.error("Login error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Server error";
    return error(res, message, statusCode);
  }
};



export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user._id);
    return success(res, user, "Profile fetched successfully", 200);
  } catch (err) {
    console.error("Get profile error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Server error";
    return error(res, message, statusCode);
  }
};



export const updateProfile = async (req, res) => {
  try {
    const result = await updateProfileService(req.user._id, req.body);
    return success(res, result, "Profile updated successfully", 200);
  } catch (err) {
    console.error("Update profile error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Server error";
    return error(res, message, statusCode);
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image file provided", 400);
    }
    
    // The relative path that will be stored in the DB (since app.js serves /profiles)
    const imageUrl = `/profiles/${req.file.filename}`;
    
    // Call service to update the user record
    const result = await updateProfileService(req.user._id, { profileImage: imageUrl });
    
    return success(res, result, "Profile image uploaded successfully", 200);
  } catch (err) {
    console.error("Upload profile image error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Server error";
    return error(res, message, statusCode);
  }
};
