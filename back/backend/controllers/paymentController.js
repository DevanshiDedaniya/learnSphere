// controllers/paymentController.js
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import { createEnrollmentHelper } from "../utils/enrollmentHelper.js";
import Course from "../models/Course.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent (Card Test Mode)
export const createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ message: "Course not found" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // in paise
      currency: "inr",
      // use card for test mode
      payment_method_types: ["card"],
      metadata: { courseId, userId: req.user._id.toString() },
      receipt_email: req.user.email,
    });

    // Save Payment record in DB
    const payment = await Payment.create({
      student: req.user._id,
      course: course._id,
      amount: course.price,
      paymentMethod: "card",
      provider: "stripe",
      orderId: paymentIntent.id,
      status: "pending",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    });
  } catch (err) {
    console.error("createPaymentIntent:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Stripe webhook endpoint:
 * - verify signature
 * - handle 'payment_intent.succeeded' to record payment & create enrollment
 * - handle 'payment_intent.payment_failed' to mark payment failed
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { courseId, userId } = paymentIntent.metadata;

        const payment = await Payment.findOne({ orderId: paymentIntent.id });
        if (payment) {
          payment.status = "success";
          payment.transactionId = paymentIntent.id;
          payment.paidAt = new Date();
          await payment.save();

          // Call helper (no circular dependency)
          await createEnrollmentHelper(userId, courseId, payment._id);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await Payment.findOneAndUpdate(
          { orderId: paymentIntent.id },
          { status: "failed" }
        );
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).json({ message: "Webhook handler error" });
  }
};
