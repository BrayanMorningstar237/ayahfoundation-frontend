// src/pages/DonationSuccess.tsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function DonationSuccess() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentIntent = params.get("payment_intent");
  const status = params.get("redirect_status");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Donation {status}</h1>
        <p>Payment Intent ID: {paymentIntent}</p>
        <p>Thank you for your donation!</p>
      </div>
    </div>
  );
}
