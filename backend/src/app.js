import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/error.middleware.js";
import logger from "./middlewares/logger.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

import path from "path";

const __dirname = path.resolve();

app.use(express.json());
app.use(logger);

// Serve static files
app.use("/certificates", express.static(path.join(__dirname, "public", "certificates")));
app.use("/profiles", express.static(path.join(__dirname, "public", "profiles")));


app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/certificates", certificateRoutes);


app.use(errorHandler);

export default app;