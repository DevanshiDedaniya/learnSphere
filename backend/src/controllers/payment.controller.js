import { success, error } from "../utils/response.util.js";
import * as paymentService from "../services/payment.service.js";
import dotenv from "dotenv";
dotenv.config();



export const createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const result = await paymentService.createPaymentIntentService(
      userId,
      courseId,
      req.user.email
    );

    return success(
      res,
      {
        clientSecret: result.paymentIntent.client_secret,
        paymentId: result.payment._id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        amount: result.course.price,
        courseTitle: result.course.title,
      },
      "Payment intent created successfully"
    );
  } catch (err) {
    console.error("createPaymentIntent:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Failed to create payment intent";
    return error(res, message, statusCode);
  }
};



export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = paymentService.verifyWebhookSignatureService(
      req.rawBody || req.body,
      sig
    );

    const result = await paymentService.handleWebhookEventService(event);
    return success(res, result.message);
  } catch (err) {
    console.error("Error processing webhook:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Webhook handler error";
    return error(res, message, statusCode);
  }
};
