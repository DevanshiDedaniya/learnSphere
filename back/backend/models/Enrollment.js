import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  watchedDuration: { type: Number, default: 0 }, // seconds
  isCompleted: { type: Boolean, default: false }
});

const enrollmentSchema = new mongoose.Schema({

  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  progress: [lessonProgressSchema], // per-lesson progress
  completionPercentage: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  expiresAt: { type: Date }, // will be auto calculated

  status: {
    type: String,
    enum: ["enrolled", "in_progress", "completed", "expired", "cancelled"],
    default: "enrolled"
  },

  certificateIssued: { type: Boolean, default: false },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }

}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
