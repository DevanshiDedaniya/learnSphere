import Stripe from "stripe";
import Payment from "../models/Payment.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";
import * as enrollmentService from "./enrollment.service.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPaymentIntentService = async (userId, courseId, userEmail) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  const alreadyEnrolled = await Enrollment.findOne({
    student: userId,
    course: courseId,
  });
  if (alreadyEnrolled) {
    throw new Error("You are already enrolled in this course", 400);
  }

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(course.price * 100),
      currency: "inr",
      payment_method_types: ["card"],
      metadata: { courseId: courseId.toString(), userId: userId.toString() },
      receipt_email: userEmail,
    },
    {
      idempotencyKey: `${userId}_${courseId}`,
    }
  );

  const payment = await Payment.create({
    student: userId,
    course: courseId,
    amount: course.price,
    currency: "INR",
    paymentMethod: "card",
    provider: "stripe",
    orderId: paymentIntent.id,
    status: "pending",
  });

  return {
    paymentIntent,
    payment,
    course,
  };
};



export const verifyWebhookSignatureService = (rawBody, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    throw new Error(`Invalid webhook signature: ${err.message}`, 400);
  }
};



export const processPaymentIntentSucceededService = async (paymentIntent) => {
  if (!paymentIntent?.id) {
    return { message: "Webhook received", processed: false };
  }

  const { courseId, userId } = paymentIntent.metadata || {};
  const payment = await Payment.findOne({ orderId: paymentIntent.id });

  if (!payment) {
    console.warn("Payment record not found:", paymentIntent.id);
    return { message: "Payment not found but webhook received", processed: false };
  }

  if (payment.status === "success") {
    return { message: "Payment already processed", processed: false };
  }

  payment.status = "success";
  payment.transactionId = paymentIntent.id;
  payment.paidAt = new Date();
  await payment.save();

  const enrollment = await enrollmentService.enrollCourseService(
    userId,
    courseId,
    payment._id
  );

  return { message: "Payment successful & enrollment created", processed: true };
};



export const processPaymentIntentFailedService = async (paymentIntent) => {
  if (!paymentIntent?.id) {
    return { message: "Webhook received", processed: false };
  }

  const payment = await Payment.findOne({ orderId: paymentIntent.id });
  if (!payment) {
    return { message: "Payment not found but webhook received", processed: false };
  }

  payment.status = "failed";
  await payment.save();

  return { message: "Payment failed", processed: true };
};



export const processPaymentIntentCanceledService = async (paymentIntent) => {
  if (!paymentIntent?.id) {
    return { message: "Webhook received", processed: false };
  }

  const payment = await Payment.findOne({ orderId: paymentIntent.id });
  if (!payment) {
    return { message: "Payment not found but webhook received", processed: false };
  }

  payment.status = "cancelled";
  await payment.save();

  return { message: "Payment canceled", processed: true };
};



export const handleWebhookEventService = async (event) => {
  const paymentIntent = event.data.object;

  switch (event.type) {
    case "payment_intent.succeeded":
      return await processPaymentIntentSucceededService(paymentIntent);

    case "payment_intent.payment_failed":
      return await processPaymentIntentFailedService(paymentIntent);

    case "payment_intent.canceled":
      return await processPaymentIntentCanceledService(paymentIntent);

    default:
      return { message: "Unhandled event type", processed: false };
  }
};
