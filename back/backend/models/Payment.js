import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["upi", "card"] },
  provider: { type: String, enum: ["stripe"], required: true },
  orderId: String,
  transactionId: String,
  receipt: String,
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  //courseAccessDuration: { type: Number, default: 365 }, // days
  paidAt: Date
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
