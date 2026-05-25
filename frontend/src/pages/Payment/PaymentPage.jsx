import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import "../../styles/PaymentPage.css";

export default function PaymentPage() {
  const { id } = useParams();
  const { courses } = useSelector((state) => state.course);
  const course = courses.find((c) => c._id === id);

  const handlePayment = async () => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

    const response = await fetch("/api/payments/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: id }),
    });
    const session = await response.json();

    stripe.redirectToCheckout({ sessionId: session.id });
  };

  if (!course) return <p className="text-center mt-10">Course not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white mt-10 shadow rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <p className="text-indigo-600 font-semibold mb-6 text-lg">
        Price: ₹{course.price}
      </p>

      <button
        onClick={handlePayment}
        className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700"
      >
        Proceed to Payment
      </button>
    </div>
  );
}
