import express from "express";
import { createPaymentIntent, stripeWebhook } from "../controllers/paymentController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Stripe webhook ( must be public, raw body)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Auth required
router.post("/create-intent/:courseId", authMiddleware(), createPaymentIntent);

export default router;
