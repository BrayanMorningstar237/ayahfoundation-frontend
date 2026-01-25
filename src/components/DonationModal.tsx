import { motion } from "framer-motion";
import { Heart, X, ShieldCheck } from "lucide-react";
import { useState } from "react";

type DonationModalProps = {
  open: boolean;
  onClose: () => void;
};

const presetAmounts = [10, 25, 50, 100];

export default function DonationModal({ open, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number | "">("");
  const [custom, setCustom] = useState("");

  if (!open) return null;

  const handlePreset = (value: number) => {
    setAmount(value);
    setCustom("");
  };

  const handleCustom = (v: string) => {
    setCustom(v);
    setAmount(Number(v));
  };

  const handleDonate = () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    console.log("Donate:", amount);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-blue-600 text-white px-6 py-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 hover:opacity-80"
          >
            <X />
          </button>

          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 fill-white" />
            <h2 className="text-2xl font-bold">Make a Donation</h2>
          </div>

          <p className="text-blue-100 mt-2">
            Your generosity changes lives instantly.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Preset amounts */}
          <div className="grid grid-cols-2 gap-4">
            {presetAmounts.map((v) => (
              <button
                key={v}
                onClick={() => handlePreset(v)}
                className={`py-4 rounded-xl font-bold border transition
                  ${
                    amount === v
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 hover:bg-blue-50 border-gray-200"
                  }`}
              >
                ${v}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Custom Amount
            </label>

            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                $
              </span>
              <input
                type="number"
                value={custom}
                onChange={(e) => handleCustom(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Donate button */}
          <button
            onClick={handleDonate}
            className="w-full bg-yellow-400 hover:bg-yellow-500
                       text-gray-900 py-4 rounded-full text-lg font-bold
                       transition transform hover:scale-[1.02]
                       shadow-lg flex items-center justify-center gap-2"
          >
            <Heart className="w-6 h-6 fill-gray-900" />
            Donate {amount ? `$${amount}` : ""}
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure • Encrypted • Trusted
          </div>
        </div>
      </motion.div>
    </div>
  );
}
