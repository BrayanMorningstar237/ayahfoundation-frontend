import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import logoimg from "../assets/images/logo/AyahFoundation.jpeg";
import { useLocation, useNavigate } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export default function DonateStripePage() {
  const navigate = useNavigate();
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
  const [objectId, setObjectId] = useState<string | null>(null);
  const [purposeOptions, setPurposeOptions] = useState<{ label: string; sectionId?: string; objectId?: string }[]>([]);

  const location = useLocation();
  const preselect = location.state as { section?: string; objectId?: string; title?: string } | null;
  const isLockedPurpose = Boolean(preselect?.objectId);

  const presetAmounts = [10, 25, 50, 100, 250];
  const staticPurposes = [
    "General Donation", "Orphans Support", "Shelter & Housing", "Support for Refugees",
    "Refugee Relief", "IDP Camps – North West Cameroon", "IDP Camps – South West Cameroon",
    "Emergency Food Assistance", "Food for Vulnerable Families", "Medical Support",
    "Cancer Care Support", "Support for the Sick & Disabled", "Maternal & Child Health",
    "Education Support for Displaced Children", "Clean Water & Sanitation", "Emergency Relief & Crisis Response"
  ];

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

        const dynamicOptions: any[] = [];
        programs.content.programs.forEach((p: any) => dynamicOptions.push({ label: `Program: ${p.title}`, sectionId: programs._id, objectId: p.id }));
        campaigns.content.successStories.forEach((c: any) => dynamicOptions.push({ label: `Campaign: ${c.title}`, sectionId: campaigns._id, objectId: c.id }));
        news.content.news.forEach((n: any) => dynamicOptions.push({ label: `Story: ${n.title}`, sectionId: news._id, objectId: n.id }));

        setPurposeOptions([...staticPurposes.map(label => ({ label })), ...dynamicOptions]);
      } catch (err) {
        setPurposeOptions(staticPurposes.map(label => ({ label })));
      }
    };
    fetchDynamicPurposes();
  }, []);

  useEffect(() => {
    if (!preselect?.objectId || purposeOptions.length === 0) return;
    const match = purposeOptions.find(p => p.objectId === preselect.objectId);
    if (match) {
      setPurpose(match.label);
      setSectionId(match.sectionId || null);
      setObjectId(match.objectId || null);
    }
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
      const res = await fetch("https://ayahfoundation-backend.onrender.com/api/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          donorName: anonymous ? "Anonymous" : donorName,
          donorEmail: anonymous ? "" : donorEmail,
          purpose,
          sectionId,
          objectId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment intent");
      setClientSecret(data.clientSecret);
      setDonationId(data.donationId);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDonation = () => {
    setClientSecret(null);
    setDonationId(null);
    setError(null);
  };

  // Poll for completion
  useEffect(() => {
    if (!donationId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://ayahfoundation-backend.onrender.com/api/donations/by-id/${donationId}`);
        const data = await res.json();
        if (data.donation.status === "completed") {
          setSuccess("Thank you! Your donation was successful.");
          clearInterval(interval);
        } else if (data.donation.status === "failed") {
          setError("Payment failed. Please try again.");
          setClientSecret(null);
          clearInterval(interval);
        }
      } catch (err) { console.error(err); }
    }, 3000);
    return () => clearInterval(interval);
  }, [donationId]);

  // --- UI COMPONENTS ---

  const Header = ({ showBackArrow = true, backAction = () => navigate(-1) }: { showBackArrow?: boolean, backAction?: () => void }) => (
    <div className="bg-white border-b border-blue-100 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {showBackArrow && (
            <button onClick={backAction} className="p-2 -ml-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <img src={logoimg} alt="Logo" className="w-10 h-10 rounded-full border border-blue-100" />
          <h1 className="font-bold text-blue-900 text-sm sm:text-lg uppercase tracking-tight">Ayah Foundation</h1>
        </div>
        <button onClick={() => navigate("/")} className="hidden sm:block text-sm font-medium text-blue-600 hover:text-blue-800">
          Back to Home
        </button>
      </div>
    </div>
  );

  // 1. SUCCESS STATE
  if (success) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header showBackArrow={false} />
        <div className="flex flex-col items-center justify-center px-4 pt-12">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl text-center border border-blue-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your donation of <span className="font-bold text-blue-600">${amount}</span> was successful.</p>
            <button onClick={() => navigate("/")} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. STRIPE PAYMENT STATE
  if (clientSecret) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header backAction={handleBackToDonation} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={handleBackToDonation} className="flex items-center gap-2 text-blue-600 mb-4 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Edit amount or details
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-6">
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <span className="font-medium opacity-90 text-sm">Amount to pay:</span>
              <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="p-6">
               <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm donorName={anonymous ? "Anonymous" : donorName} donorEmail={anonymous ? "" : donorEmail} amount={amount} purpose={purpose} />
               </Elements>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN FORM STATE (MOBILE FIRST)
  return (
    <div className="min-h-screen bg-white md:bg-blue-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Support Our Cause</h1>
          <p className="text-gray-500">Your kindness changes lives in Cameroon and beyond.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white md:rounded-3xl md:shadow-2xl md:border border-blue-100 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Amount Selection */}
          <div className="flex-1 p-6 md:p-10 border-b md:border-b-0 md:border-r border-blue-50 bg-blue-50/30">
            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Choose Amount
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset} type="button"
                  onClick={() => setAmount(preset)}
                  className={`py-3 rounded-xl font-bold transition-all border-2 ${amount === preset ? "bg-blue-600 border-blue-600 text-white shadow-md" : "bg-white border-blue-100 text-blue-600 hover:border-blue-300"}`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <span className="absolute left-4 top-[38px] text-gray-400 font-bold">$</span>
              <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Custom Amount</label>
              <input
                type="number" value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-600 outline-none text-lg font-bold"
                placeholder="0.00"
              />
            </div>

            <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Donation Purpose</label>
            <select
              value={purpose} onChange={e => setPurpose(e.target.value)}
              disabled={isLockedPurpose}
              className="w-full p-3 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-600 outline-none appearance-none"
            >
              {purposeOptions.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>

          {/* Right: Personal Info */}
          <div className="flex-1 p-6 md:p-10">
            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Your Information
            </h3>

            <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <input
                type="checkbox" checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />
              <div>
                <p className="font-bold text-sm text-blue-900">Donate Anonymously</p>
                <p className="text-xs text-gray-500">Hide your name from public view</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Full Name</label>
                <input
                  type="text" disabled={anonymous} value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder={anonymous ? "Anonymous Donor" : "Full Name"}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Email Address</label>
                <input
                  type="email" disabled={anonymous} value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none disabled:bg-gray-50"
                />
              </div>
            </div>

            {error && <p className="mt-4 text-red-500 text-sm font-medium">⚠️ {error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
            >
              {loading ? "Initializing..." : `Donate $${amount} Now`}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Secure SSL Encrypted Payment</p>
          </div>
        </form>
      </div>
    </div>
  );
}