import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { useLocation } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export default function DonateStripePage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState<number>(25);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [purpose, setPurpose] = useState("General Donation");
const [sectionId, setSectionId] = useState<string | null>(null);
const location = useLocation();

const preselect = location.state as
  | {
      section?: "news" | "programs" | "campaigns";
      objectId?: string;
      title?: string;
    }
  | null;

  const isLockedPurpose = Boolean(preselect?.objectId);

  const presetAmounts = [10, 25, 50, 100, 250];
  const staticPurposes = [
  "General Donation",
  "Orphans Support",
  "Shelter & Housing",
  "Support for Refugees",
  "Refugee Relief",
  "IDP Camps – North West Cameroon",
  "IDP Camps – South West Cameroon",
  "Emergency Food Assistance",
  "Food for Vulnerable Families",
  "Medical Support",
  "Cancer Care Support",
  "Support for the Sick & Disabled",
  "Maternal & Child Health",
  "Education Support for Displaced Children",
  "Clean Water & Sanitation",
  "Emergency Relief & Crisis Response"
];


const [purposeOptions, setPurposeOptions] = useState<
  { label: string; sectionId?: string; objectId?: string }[]
>([]);
const [objectId, setObjectId] = useState<string | null>(null);
useEffect(() => {
  const fetchDynamicPurposes = async () => {
    try {
      const [programsRes, campaignsRes, newsRes] = await Promise.all([
        fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/programs"),
        fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/campaigns"),
        fetch("https://ayahfoundation-backend.onrender.com/api/public/sections/news"),
      ]);

      const programs = await programsRes.json();
      const campaigns = await campaignsRes.json();
      const news = await newsRes.json();

     const dynamicOptions: { label: string; sectionId?: string; objectId?: string }[] = [];

// Programs
programs.content.programs.forEach((p: any) => {
  dynamicOptions.push({
    label: `Program: ${p.title}`,
    sectionId: programs._id, // Section ID
    objectId: p.id,          // <-- use p.id, not p._id
  });
});

// Campaigns
campaigns.content.successStories.forEach((c: any) => {
  dynamicOptions.push({
    label: `Campaign: ${c.title}`,
    sectionId: campaigns._id, // the section ID
    objectId: c.id,            // use `id` from the story
  });
});

// News
news.content.news.forEach((n: any) => {
  dynamicOptions.push({
    label: `Story: ${n.title}`,
    sectionId: news._id,
    objectId: n.id,
  });
});

      const staticOptions = staticPurposes.map(label => ({ label }));

      setPurposeOptions([...staticOptions, ...dynamicOptions]);
    } catch (err) {
      console.error("Failed to load donation purposes", err);
      setPurposeOptions(staticPurposes.map(label => ({ label })));
    }
  };

  fetchDynamicPurposes();
}, []);

useEffect(() => {
  if (!preselect?.objectId || purposeOptions.length === 0) return;

  const match = purposeOptions.find(
    p => p.objectId === preselect.objectId
  );

  if (!match) return;

  setPurpose(match.label);
  setSectionId(match.sectionId || null);
  setObjectId(match.objectId || null);
}, [preselect, purposeOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://ayahfoundation-backend.onrender.com/api/stripe/create-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
  amount,
  donorName: anonymous ? "Anonymous" : donorName,
  donorEmail: anonymous ? "" : donorEmail,
  purpose,
  sectionId,  // Section collection ID
  objectId,   // Individual program/campaign/news ID
}),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create payment intent");
      }

      const data = await res.json();
      if (!data.clientSecret) throw new Error("No clientSecret returned");

      setClientSecret(data.clientSecret);
      setDonationId(data.donationId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle going back to donation form
  const handleBackToDonation = () => {
    setClientSecret(null);
    setDonationId(null);
    setError(null);
  };

  // Poll backend for donation status
  useEffect(() => {
    if (!donationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://ayahfoundation-backend.onrender.com/api/donations/${donationId}`
        );
        if (!res.ok) throw new Error("Failed to fetch donation status");

        const data = await res.json();
        const status = data.donation.status;

        if (status === "completed") {
          setSuccess("Thank you! Your donation was successful.");
          clearInterval(interval);
        } else if (status === "failed") {
          setError("Payment failed. Please try again.");
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [donationId]);

  // Success Page
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header with Logo */}
        <div className="bg-white border-b border-blue-100 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logoimg} 
                alt="Ayah Foundation" 
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
              />
              <div>
                <h1 className="text-xl font-bold text-blue-900">Ayah Foundation</h1>
                <p className="text-sm text-blue-600">Making a difference together</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Success Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-blue-100">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-3 text-blue-900">
                Donation Successful!
              </h2>
              
              <p className="text-gray-600 mb-2 text-lg">
                Thank you for your generosity
              </p>
              
              <p className="text-gray-500 mb-8 text-sm">
  Your ${amount} donation helps create meaningful impact
</p>

              {/* Divider */}
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-8 rounded-full"></div>

             

              {/* Back Button */}
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Stripe Elements once clientSecret exists
  if (clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header with Logo and Back Button */}
        <div className="bg-white border-b border-blue-100 py-2 px-3 sm:py-4 sm:px-6">
  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
    
    {/* Back button */}
    <div className="flex justify-center sm:justify-start w-full sm:w-auto">
      <button
        onClick={handleBackToDonation}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="truncate sm:inline">Back to Donation</span>
      </button>
    </div>

    {/* Logo + Title */}
    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 w-full sm:w-auto">
      <img
        src={logoimg}
        alt="Ayah Foundation"
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-200"
      />
      <div className="text-center sm:text-left">
        <h1 className="text-base sm:text-xl font-bold text-blue-900">
          Ayah Foundation
        </h1>
       
      </div>
    </div>

    {/* Optional spacer for desktop */}
    <div className="hidden sm:block w-24"></div>
  </div>
</div>


        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Donation Summary */}
            <div className="mb-8 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Donation Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Amount</p>
                  <p className="text-2xl font-bold text-blue-900">${amount.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Purpose</p>
                  <p className="text-lg font-semibold text-blue-900">{purpose}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Donor</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {anonymous ? "Anonymous" : donorName || "Guest"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form Container - Wider */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 md:p-8">
              <div className="max-w-3xl mx-auto">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    donorName={anonymous ? "Anonymous" : donorName}
                    donorEmail={anonymous ? "" : donorEmail}
                    amount={amount}
                    purpose={purpose}
                  />
                </Elements>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 text-center text-sm text-blue-600">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your Donation is secure and encrypted</span>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Donation Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Logo */}
<div className="bg-white border-b border-blue-100 px-4 py-3 sm:py-4">
  <div className="max-w-7xl mx-auto flex items-center justify-between">

    {/* LEFT: Mobile back arrow + Logo + Title */}
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">

      {/* Mobile back arrow (hidden on md+) */}
      <button
        onClick={() => (window.location.href = "/")}
        aria-label="Back to home"
        className="
          md:hidden
          h-11 w-11
          flex items-center justify-center
          text-blue-600
          rounded-lg
          transition-all
          active:scale-95
          flex-shrink-0
        "
      >
        <i className="ri-arrow-left-s-line text-xl"></i>
      </button>

      {/* Logo */}
      <img
        src={logoimg}
        alt="Ayah Foundation"
        className="w-10 h-10 sm:w-12 sm:h-12 object-cover flex-shrink-0"
      />

      {/* Title */}
      <h1 className="text-base sm:text-xl font-bold text-blue-900 truncate">
        AYAH FOUNDATION
      </h1>
    </div>

    {/* RIGHT: Desktop back button (hidden on mobile) */}
    <button
      onClick={() => (window.location.href = "/")}
      className="
        hidden md:inline-flex
        h-11
        px-6
        items-center
        justify-center
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        text-white
        rounded-lg
        font-medium
        transition-colors
      "
    >
      Back to Home
    </button>

  </div>
</div>



      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
  <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
    Make a Donation
  </h1>
  <p className="text-blue-600 text-lg">
    Every contribution supports real people and real change.
  </p>
</div>


          {/* Main Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Donation Amount */}
              <div className="flex-1 p-6 md:p-8 bg-gradient-to-b from-blue-50 to-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Donation Amount</h2>
                </div>

                {/* Preset Amount Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`py-3 px-2 rounded-lg font-bold text-base transition-all ${
                        amount === preset
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative mb-6">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-bold">
                    $
                  </div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    You can enter custom amount
                  </label>
                  <input
                    type="number"
                    placeholder="Custom Amount"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                {/* Purpose Selector */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Purpose
                  </label>
                  <select
  value={purpose}
  onChange={e => setPurpose(e.target.value)}
  disabled={isLockedPurpose}
  className="w-full p-3 border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
>
  {purposeOptions.map((p) => (
    <option key={p.label} value={p.label}>
      {p.label}
    </option>
  ))}
</select>
{isLockedPurpose && (
  <p className="text-xs text-gray-500 mt-1">
    This donation is linked to a specific story/campaign.
  </p>
)}

                  <div className="absolute right-3 top-10 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Side - Donor Information */}
              <div className="flex-1 p-6 md:p-8 bg-white border-t lg:border-t-0 lg:border-l border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Your Information</h2>
                </div>

                {/* Anonymous Checkbox */}
                <label className="flex items-start gap-3 p-3 mb-6 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 block">Donate Anonymously</span>
                    <span className="text-sm text-gray-600">Your name won't be publicly displayed</span>
                  </div>
                </label>

                {/* Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name {!anonymous && <span className="text-gray-400">(Optional)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={anonymous ? "Anonymous" : "John Doe"}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className={`w-full p-3 border rounded-lg font-medium transition-all ${
                      anonymous 
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
                        : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    disabled={anonymous}
                  />
                </div>

                {/* Email Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address {!anonymous && <span className="text-gray-400">(Optional)</span>}
                  </label>
                  <input
                    type="email"
                    placeholder={anonymous ? "anonymous@donor.org" : "john@example.com"}
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className={`w-full p-3 border rounded-lg font-medium transition-all ${
                      anonymous 
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
                        : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    disabled={anonymous}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>

               
              </div>
            </div>
          </form>

          
        </div>
      </div>
    </div>
  );
}