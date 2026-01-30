import { PayPalButtons } from "@paypal/react-paypal-js";
import { X } from "lucide-react";

interface Props {
  amount?: string;
  onClose: () => void;
}

const PayPalDonateModal = ({ amount = "10.00", onClose }: Props) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose} // Close when clicking outside
    >
      <div
        className="bg-white rounded-3xl shadow-xl p-8 w-11/12 max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Support Ayah Foundation
        </h2>

        {/* Optional description */}
        <p className="text-gray-600 text-center mb-6">
          Your donation helps us transform lives and communities. 💙
        </p>

        {/* PayPal Button */}
        <div className="flex justify-center">
          <PayPalButtons
            style={{ layout: "vertical", shape: "pill" }}
            createOrder={(_, actions) => {
              if (!actions.order) throw new Error("PayPal order unavailable");
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  { amount: { currency_code: "USD", value: amount } },
                ],
              });
            }}
            onApprove={(_, actions) => {
              if (!actions.order) throw new Error("PayPal capture unavailable");
              return actions.order.capture().then(() => {
                alert("Thank you for supporting Ayah Foundation 💙");
                onClose();
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PayPalDonateModal;
