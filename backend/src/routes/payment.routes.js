import express from "express";
import { createPaymentIntent, stripeWebhook } from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createPaymentIntentSchema } from "../validation/payment.validation.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);
router.post("/create-intent/:courseId", auth, authorize("student"), validate(createPaymentIntentSchema, "params"), createPaymentIntent);

export default router;
