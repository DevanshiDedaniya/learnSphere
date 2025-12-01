import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "instructor"], default: "student" },
  profileImage: { type: String },
  bio: { type: String, maxlength: 500 },
  skills: [String],
  isEmailVerified: { type: Boolean, default: false },

  instructorProfile: {
    title: String,
    totalCourses: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },

  lastLogin: Date
}, { timestamps: true });

export default mongoose.model("User", userSchema);
