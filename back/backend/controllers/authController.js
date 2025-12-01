import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);  // random string added to hash password
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName, email, password: hash, role, username, instructorProfile:
        role === "instructor"
          ? {
            title: "",
            totalCourses: 0,
            totalStudents: 0,
            averageRating: 0,
          }
          : undefined
    });
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10d" });

    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, role: user.role, username: user.username, email: user.email } });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email }).select("+password");    // here +password means explicitely include it to check because in schema we have marked select field as false
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // update last login
    user.lastLogin = new Date();
    await user.save();

    user.password = undefined;

    res.json({ token, user });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET PROFILE (works for both instructor & student)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE PROFILE (students + instructors)
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent email/password change from here
    delete updates.email;
    delete updates.password;

    // Common profile fields
    const allowedFields = ["fullName", "bio", "skills", "profileImage", "username"];
    for (let field of allowedFields) {
      if (updates[field] !== undefined) user[field] = updates[field];
    }

    // Instructor-specific updates
    if (user.role === "instructor" && updates.instructorProfile) {
      const { title, totalCourses, totalStudents, averageRating } =
        updates.instructorProfile;

      if (title !== undefined) user.instructorProfile.title = title;
      if (totalCourses !== undefined)
        user.instructorProfile.totalCourses = totalCourses;
      if (totalStudents !== undefined)
        user.instructorProfile.totalStudents = totalStudents;
      if (averageRating !== undefined)
        user.instructorProfile.averageRating = averageRating;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        profileImage: user.profileImage,
        instructorProfile: user.instructorProfile,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
