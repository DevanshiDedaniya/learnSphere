import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const signupService = async (userData) => {
  const { fullName, username, email, password, role } = userData;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already registered", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: hash,
    role,
    username,
    instructorProfile:
      role === "instructor"
        ? {
            title: "",
            totalCourses: 0,
            totalStudents: 0,
            averageRating: 0,
          }
        : undefined,
  });

  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      username: user.username,
      email: user.email,
    },
  };
};



export const loginService = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid credentials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials", 400);
  }

  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  user.lastLogin = new Date();
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    token,
    user: userResponse,
  };
};



export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found", 404);
  }
  return user;
};



export const updateProfileService = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found", 404);
  }

  const allowedFields = [
    "fullName",
    "bio",
    "skills",
    "profileImage",
    "username",
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  if (user.role === "instructor" && updates.instructorProfile) {
    const instructorUpdates = updates.instructorProfile;

    if (!user.instructorProfile) {
      user.instructorProfile = {};
    }

    const instructorFields = [
      "title",
      "totalCourses",
      "totalStudents",
      "averageRating",
    ];

    instructorFields.forEach((field) => {
      if (instructorUpdates[field] !== undefined) {
        user.instructorProfile[field] = instructorUpdates[field];
      }
    });
  }

  await user.save();

  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    bio: user.bio,
    skills: user.skills,
    profileImage: user.profileImage,
    instructorProfile: user.instructorProfile,
  };

  return responseUser;
};
