import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface Donation {
  _id: string;
  donorName?: string;
  amount: number;
  purpose: string;
  objectId?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

interface PurposeMeta {
  objectId: string;
  title: string;
  image?: string;
  sectionName: string;
}

type Grouped = Record<string, Donation[]>;

/* ================= COMPONENT ================= */

export default function AllDonors() {
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [purposeMetaMap, setPurposeMetaMap] = useState<Record<string, PurposeMeta>>({});
  const [loading, setLoading] = useState(true);
  const [expandedPurposes, setExpandedPurposes] = useState<Set<string>>(new Set());

  /* ================= ROUTE BUILDER ================= */

  const buildDynamicRoute = (section?: string, objectId?: string) => {
    if (!section || !objectId) return null;

    switch (section) {
      case "programs":
        return `/programs/${objectId}`;
      case "campaigns":
        return `/campaigns/${objectId}`;
      case "news":
        return `/news/${objectId}`;
      default:
        return null;
    }
  };

  /* ================= FETCH DONATIONS ================= */

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_URL}/donations`);

        const completed = (res.data?.donations || []).filter(
          (d: Donation) => d.status === "completed"
        );

        setDonations(completed);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  /* ================= FETCH PURPOSE META ================= */

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axios.get(`${API_URL}/donations/purposes`);

        const map: Record<string, PurposeMeta> = {};

        for (const p of res.data.purposes || []) {
          if (p.objectId) {
            map[p.objectId] = {
              objectId: p.objectId,
              title: p.title,
              image: p.image,
              sectionName: p.sectionName
            };
          }
        }

        setPurposeMetaMap(map);
      } catch (err) {
        console.error("purpose meta load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  /* ================= GROUP ================= */

  const grouped: Grouped = useMemo(() => {
    return donations.reduce((acc, d) => {
      const key = d.purpose || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(d);
      return acc;
    }, {} as Grouped);
  }, [donations]);

  /* ================= PURPOSE ORDER ================= */

  const purposes = useMemo(() => {
    const keys = Object.keys(grouped);
    return keys.sort((a, b) => {
      if (a === "General Donation") return -1;
      if (b === "General Donation") return 1;
      return a.localeCompare(b);
    });
  }, [grouped]);

  /* ================= HELPERS ================= */

  const totalFor = (p: string) =>
    grouped[p].reduce((s, d) => s + d.amount, 0);

  const metaForPurpose = (p: string): PurposeMeta | null => {
    const withObject = grouped[p].find(d => d.objectId);
    if (!withObject) return null;
    return purposeMetaMap[withObject.objectId!] || null;
  };

  const toggleExpand = (purpose: string) => {
    setExpandedPurposes(prev => {
      const next = new Set(prev);
      if (next.has(purpose)) {
        next.delete(purpose);
      } else {
        next.add(purpose);
      }
      return next;
    });
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-lg sm:text-xl font-bold">All Donors</h1>
            
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Donation Categories</h2>

        {/* ================= EXPANDABLE LIST ================= */}

        <div className="space-y-3">
          {purposes.map(purpose => {
            const isExpanded = expandedPurposes.has(purpose);
            const count = grouped[purpose].length;
            const total = totalFor(purpose);
            const meta = metaForPurpose(purpose);
            const route = buildDynamicRoute(meta?.sectionName, meta?.objectId);

            return (
              <div key={purpose} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                
                {/* Category Header - Clickable to expand */}
                <button
                  onClick={() => toggleExpand(purpose)}
                  className="w-full p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50 transition"
                >
                  {/* Icon/Avatar */}
                  <div className="flex-shrink-0">
                    {meta?.image ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                        <img 
                          src={meta.image} 
                          alt={purpose}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                        {purpose[0]}
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {purpose}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs sm:text-sm text-gray-500">
                        {count} donation{count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-green-600">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Expand Arrow */}
                  <div className="flex-shrink-0">
                    <svg 
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Link to related content if available */}
                    {route && (
                      <div className="px-4 sm:px-5 py-3 bg-blue-50 border-b border-blue-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(route);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View related {meta?.sectionName}
                        </button>
                      </div>
                    )}

                    {/* Donors List */}
                    <div className="divide-y divide-gray-100">
                      {grouped[purpose]
                        .sort((a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                        )
                        .map(d => (
                          <div key={d._id} className="p-4 sm:p-5 hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between gap-4">
                              {/* Donor Info */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                  {(d.donorName || "A")[0].toUpperCase()}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {d.donorName || "Anonymous"}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {new Date(d.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="flex-shrink-0">
                                <div className="text-lg sm:text-xl font-bold text-green-700">
                                  ${d.amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {purposes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No donations yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to contribute!</p>
          </div>
        )}

      </div>
    </div>
  );
}