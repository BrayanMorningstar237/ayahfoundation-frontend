import { ShieldCheck, CreditCard, CheckCircle, Lock, ArrowLeft, Building2 } from "lucide-react";
import { useState } from "react";

import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
export default function DonationPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const presetAmounts = [10, 25, 50, 100, 250];

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
    setCustomAmount("");
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setAmount(value);
  };

  const handleNext = () => {
    if (step === 1 && (!amount || Number(amount) <= 0)) {
      return alert("Please select or enter a donation amount");
    }
    if (step === 2 && !paymentMethod) {
      return alert("Please select a payment method");
    }
    if (step === 3) {
      if (!donorInfo.name || !donorInfo.email) {
        return alert("Please fill in all required fields");
      }
      // Simulated donation success
      setStep(4);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 text-white/90 hover:text-white transition-all ${
                step === 1 ? "invisible" : "visible"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to last page</span>
            </button>
            
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <img
        src={logoimg}
        alt="Ayah Foundation"
        className="w-20 h-20 mx-auto mb-6 rounded-full shadow-md animate-pulse-slow"
      />
                </div>
                
              </div>
            </div>
            
            {/* Spacer to balance layout */}
            <div className="w-20 sm:w-24"></div>
          </div>

          {/* Main Header Content */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              Make a Donation
            </h1>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
              Support our mission and help us change lives. Every contribution makes a difference.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all ${
                    step >= num
                      ? "bg-blue-600 text-white scale-110"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > num ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : num}
                </div>
                <span className="text-xs sm:text-sm mt-2 font-medium text-gray-600 hidden sm:block">
                  {num === 1 && "Amount"}
                  {num === 2 && "Payment"}
                  {num === 3 && "Details"}
                  {num === 4 && "Complete"}
                </span>
              </div>
              {num < 4 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-all ${
                    step > num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Amount Selection */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
              Choose Your Donation Amount
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Select a preset amount or enter your own
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleAmountSelect(preset)}
                  className={`py-4 sm:py-6 px-4 rounded-xl font-bold text-lg sm:text-xl transition-all ${
                    amount === preset.toString()
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">
                $
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full py-4 pl-10 pr-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-lg transition-all"
              />
            </div>

            {amount && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Your donation:</span>
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                    ${amount}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 sm:py-5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
              Select Payment Method
            </h2>
            <p className="text-gray-600 text-center mb-8">
              This is a simulated donation process
            </p>

            <div className="space-y-4 mb-8">
              {[
                { id: "credit-card", label: "Credit Card", icon: CreditCard },
                { id: "paypal", label: "PayPal", icon: Building2 },
                { id: "bank-transfer", label: "Bank Transfer", icon: Building2 }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === method.id
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <method.icon className="w-6 h-6 text-gray-600" />
                  <span className="font-semibold text-gray-800">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBack}
                className="sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Donor Information */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
              Your Information
            </h2>
            <p className="text-gray-600 text-center mb-8">
              <Lock className="inline w-4 h-4 mr-1" />
              All information is simulated and secure
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={donorInfo.name}
                  onChange={(e) =>
                    setDonorInfo({ ...donorInfo, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={donorInfo.email}
                  onChange={(e) =>
                    setDonorInfo({ ...donorInfo, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {paymentMethod === "credit-card" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number (Simulated)
                    </label>
                    <input
                      type="text"
                      value={donorInfo.cardNumber}
                      onChange={(e) =>
                        setDonorInfo({ ...donorInfo, cardNumber: e.target.value })
                      }
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={donorInfo.expiry}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, expiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={donorInfo.cvv}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, cvv: e.target.value })
                        }
                        placeholder="123"
                        maxLength={3}
                        className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 text-center font-medium">
                ⚠️ This is a simulated donation. No actual payment will be processed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBack}
                className="sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Complete Donation
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Thank You!
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Your simulated donation of{" "}
              <span className="font-bold text-blue-600 text-2xl sm:text-3xl">
                ${amount}
              </span>{" "}
              has been processed successfully.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Donation Summary
              </h3>
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-800">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {paymentMethod?.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-800">
                    {donorInfo.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">
                    ✓ Simulated Success
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to{" "}
              <span className="font-semibold">{donorInfo.email}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setAmount("");
                  setCustomAmount("");
                  setPaymentMethod("");
                  setDonorInfo({
                    name: "",
                    email: "",
                    cardNumber: "",
                    expiry: "",
                    cvv: ""
                  });
                }}
                className="sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Make Another Donation
              </button>
              <button
                onClick={() => {
                  // Navigate to homepage or other action
                  alert("Redirecting to homepage...");
                }}
                className="sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-xl transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}