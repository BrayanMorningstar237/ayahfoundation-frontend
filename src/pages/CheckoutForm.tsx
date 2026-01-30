import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  donorName: string;
  donorEmail: string;
  amount: number;
  purpose: string;
}

const CheckoutForm = ({ donorName, amount, purpose }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // won't redirect in SPA
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setSuccess(true);
      } else {
        setError("Payment not completed. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "Payment failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Thank you for your donation!</h2>
        <p className="mb-2">Amount: ${amount}</p>
        <p className="mb-2">Purpose: {purpose}</p>
        <p className="mb-4">Donor: {donorName || "Anonymous"}</p>
        <p className="text-gray-600">Your payment has been successfully processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
      >
        {loading ? "Processing..." : "Confirm Payment"}
      </button>
    </form>
  );
};

export default CheckoutForm;
