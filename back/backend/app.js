// app.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth_routes.js";
import courseRoutes from "./routes/course_routes.js";
import enrollmentRoutes from "./routes/enrollment_routes.js";
import paymentRoutes from "./routes/payment_routes.js";
import certificateRoutes from "./routes/certificate_routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { fileURLToPath } from "url";


dotenv.config();
const app = express();

// Middlewares

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// Stripe webhook must receive raw body. Mount it BEFORE express.json or use route-specific raw parser:
// app.use("/api/payments/webhook", express.raw({ type: "application/json" }));


// Routes Middleware
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/certificates", certificateRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("✅ LearnSphere LMS Backend is Running");
});

// error handler
app.use(errorHandler);

// MongoDB + Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("❌ Database Connection Error:", err));
