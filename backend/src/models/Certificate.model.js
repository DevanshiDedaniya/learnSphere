import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment", required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  certificateId: { type: String, required: true, unique: true, index: true },
  issueDate: { type: Date, default: Date.now },
  certificateUrl: { type: String }, 
  meta: { type: Object }
}, { timestamps: true });

export default mongoose.model("Certificate", certificateSchema);
