import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Grid3x3,
  Table
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */
interface Donation {
  _id: string;
  donorName?: string;
  email?: string;
  amount: number;
  currency?: string;
  purpose: string;
  objectId?: string;
  status: "pending" | "completed" | "failed";
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PurposeMeta {
  objectId: string;
  title: string;
  image?: string;
  sectionName: string;
}

interface Stats {
  total: number;
  monthly: number;
  daily: number;
  avgDonation: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
}

interface Filters {
  status: "all" | "pending" | "completed" | "failed";
  purpose: string;
  dateRange: "all" | "today" | "week" | "month";
  search: string;
}

type GroupedDonations = Record<string, Donation[]>;

/* ================= MAIN COMPONENT ================= */
const AdminDonations = () => {
  const [activeTab, setActiveTab] = useState<"table" | "grouped">("table");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [groupedDonations, setGroupedDonations] = useState<GroupedDonations>({});
  const [purposeMetaMap, setPurposeMetaMap] = useState<Record<string, PurposeMeta>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    monthly: 0,
    daily: 0,
    avgDonation: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0
  });
  
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    purpose: "all",
    dateRange: "all",
    search: ""
  });

  const [purposes, setPurposes] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedPurposes, setExpandedPurposes] = useState<Set<string>>(new Set());

  /* ================= FETCH DONATIONS ================= */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch donations
        const donationsRes = await axios.get(`${API_URL}/donations`);
        const allDonations = donationsRes.data?.donations || [];
        
        // Transform donations
        const transformedDonations: Donation[] = allDonations.map((donation: any) => ({
          ...donation,
          currency: donation.currency || "USD",
          donor: donation.donorName || "Anonymous",
          email: donation.email || "No email provided",
          campaign: donation.purpose,
          date: new Date(donation.createdAt).toISOString().split('T')[0]
        }));
        
        setDonations(transformedDonations);
        setFilteredDonations(transformedDonations);
        
        // Group donations by purpose
        const grouped = transformedDonations.reduce((acc: GroupedDonations, donation) => {
          const key = donation.purpose || "General Donation";
          if (!acc[key]) acc[key] = [];
          acc[key].push(donation);
          return acc;
        }, {});
        setGroupedDonations(grouped);
        
        // Extract unique purposes
        const uniquePurposes = Object.keys(grouped);
        setPurposes(uniquePurposes.sort((a, b) => {
          if (a === "General Donation") return -1;
          if (b === "General Donation") return 1;
          return a.localeCompare(b);
        }));
        
        // Calculate stats
        calculateStats(transformedDonations);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  /* ================= FETCH PURPOSE METADATA ================= */
  useEffect(() => {
    const fetchPurposeMeta = async () => {
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
        console.error("Failed to load purpose metadata:", err);
      }
    };

    fetchPurposeMeta();
  }, []);

  /* ================= CALCULATE STATS ================= */
  const calculateStats = (donationsList: Donation[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const today = now.getDate();

    const monthlyDonations = donationsList.filter(d => {
      const date = new Date(d.createdAt);
      return date.getMonth() === thisMonth && 
             date.getFullYear() === thisYear;
    });

    const todayDonations = donationsList.filter(d => {
      const date = new Date(d.createdAt);
      return date.getDate() === today && 
             date.getMonth() === thisMonth && 
             date.getFullYear() === thisYear;
    });

    const total = donationsList.reduce((sum, d) => sum + d.amount, 0);
    const monthly = monthlyDonations.reduce((sum, d) => sum + d.amount, 0);
    const daily = todayDonations.reduce((sum, d) => sum + d.amount, 0);
    const avgDonation = donationsList.length > 0 ? total / donationsList.length : 0;

    const pendingCount = donationsList.filter(d => d.status === "pending").length;
    const completedCount = donationsList.filter(d => d.status === "completed").length;
    const failedCount = donationsList.filter(d => d.status === "failed").length;

    setStats({
      total,
      monthly,
      daily,
      avgDonation: Math.round(avgDonation * 100) / 100,
      pendingCount,
      completedCount,
      failedCount
    });
  };

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    let result = [...donations];

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(d => d.status === filters.status);
    }

    // Purpose filter
    if (filters.purpose !== "all") {
      result = result.filter(d => d.purpose === filters.purpose);
    }

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== "all") {
      result = result.filter(d => {
        const date = new Date(d.createdAt);
        switch (filters.dateRange) {
          case "today":
            return date.getDate() === now.getDate() && 
                   date.getMonth() === now.getMonth() && 
                   date.getFullYear() === now.getFullYear();
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return date >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(d =>
        (d.donorName?.toLowerCase().includes(searchLower)) ||
        (d.email?.toLowerCase().includes(searchLower)) ||
        (d.purpose.toLowerCase().includes(searchLower)) ||
        (d._id.toLowerCase().includes(searchLower))
      );
    }

    setFilteredDonations(result);
    
    // Also update grouped view if needed
    if (activeTab === "grouped") {
      const grouped = result.reduce((acc: GroupedDonations, donation) => {
        const key = donation.purpose || "General Donation";
        if (!acc[key]) acc[key] = [];
        acc[key].push(donation);
        return acc;
      }, {});
      setGroupedDonations(grouped);
    }
  }, [donations, filters, activeTab]);

  /* ================= HANDLERS ================= */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePurposeExpand = (purpose: string) => {
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

  const exportToCSV = () => {
    const headers = ["ID", "Donor", "Email", "Amount", "Currency", "Purpose", "Status", "Payment Method", "Date"];
    const dataToExport = activeTab === "table" ? filteredDonations : 
      Object.values(groupedDonations).flat();
    
    const csvData = dataToExport.map(d => [
      d._id,
      d.donorName || "Anonymous",
      d.email || "",
      d.amount,
      d.currency || "USD",
      d.purpose,
      d.status,
      d.paymentMethod || "N/A",
      new Date(d.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStatusUpdate = async (id: string, newStatus: Donation["status"]) => {
    try {
      await axios.patch(`${API_URL}/donations/${id}`, { status: newStatus });
      
      // Update local state
      setDonations(prev => 
        prev.map(d => d._id === id ? { ...d, status: newStatus } : d)
      );
      
      alert(`Donation status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update donation status");
    }
  };

  const metaForPurpose = (purpose: string): PurposeMeta | null => {
    const donationWithObject = donations.find(d => d.purpose === purpose && d.objectId);
    if (!donationWithObject?.objectId) return null;
    return purposeMetaMap[donationWithObject.objectId] || null;
  };

  const totalForPurpose = (purpose: string) => {
    return (groupedDonations[purpose] || []).reduce((sum, d) => sum + d.amount, 0);
  };

  /* ================= RENDER TABLE VIEW ================= */
  const renderTableView = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search donors, emails, purposes..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value as Filters["status"]})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select 
            value={filters.purpose}
            onChange={(e) => setFilters({...filters, purpose: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Purposes</option>
            {purposes.map(purpose => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>

          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value as Filters["dateRange"]})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <button 
            onClick={() => setFilters({
              status: "all",
              purpose: "all",
              dateRange: "all",
              search: ""
            })}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No donations found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <>
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleRowExpand(donation._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {expandedRows.has(donation._id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                          <div>
                            <div className="font-medium">{donation.donorName || "Anonymous"}</div>
                            <div className="text-sm text-gray-500">{donation.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold">${donation.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 ml-1">{donation.currency || "USD"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 max-w-xs truncate inline-block">
                          {donation.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(donation.status)}
                          <span className="capitalize">{donation.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <select
                            value={donation.status}
                            onChange={(e) => handleStatusUpdate(donation._id, e.target.value as Donation["status"])}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                          <button 
                            className="p-1 text-gray-500 hover:text-blue-600"
                            onClick={() => alert(`View donation ${donation._id} details`)}
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Row Details */}
                    {expandedRows.has(donation._id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Donation ID</p>
                              <p className="font-mono text-xs">{donation._id}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payment Method</p>
                              <p>{donation.paymentMethod || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Created</p>
                              <p>{new Date(donation.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Updated</p>
                              <p>{donation.updatedAt ? new Date(donation.updatedAt).toLocaleString() : "Never"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ================= RENDER GROUPED VIEW ================= */
  const renderGroupedView = () => (
    <div className="space-y-4">
      {/* Grouped View Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search purposes..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value as Filters["status"]})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button 
            onClick={() => setFilters({
              status: "all",
              purpose: "all",
              dateRange: "all",
              search: ""
            })}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Grouped Donations */}
      <div className="space-y-4">
        {Object.keys(groupedDonations).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No donations found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          Object.keys(groupedDonations).map((purpose) => {
            const isExpanded = expandedPurposes.has(purpose);
            const donationsForPurpose = groupedDonations[purpose];
            const totalAmount = totalForPurpose(purpose);
            const donorCount = donationsForPurpose.length;
            const meta = metaForPurpose(purpose);

            return (
              <div key={purpose} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Purpose Header */}
                <button
                  onClick={() => togglePurposeExpand(purpose)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {meta?.image ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img 
                            src={meta.image} 
                            alt={purpose}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {purpose[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{purpose}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {donorCount} donor{donorCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-green-600 font-bold">
                          ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-gray-500">
                          Avg: ${(totalAmount / donorCount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t">
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {donationsForPurpose.map((donation) => (
                              <tr key={donation._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="font-medium">{donation.donorName || "Anonymous"}</div>
                                  <div className="text-sm text-gray-500">{donation.email || "No email"}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-bold">${donation.amount.toFixed(2)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(donation.status)}
                                    <span className="capitalize text-sm">{donation.status}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {new Date(donation.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex space-x-2">
                                    <select
                                      value={donation.status}
                                      onChange={(e) => handleStatusUpdate(donation._id, e.target.value as Donation["status"])}
                                      className="px-2 py-1 border rounded text-xs"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="completed">Completed</option>
                                      <option value="failed">Failed</option>
                                    </select>
                                    <button 
                                      className="p-1 text-gray-500 hover:text-blue-600"
                                      onClick={() => alert(`View donation ${donation._id} details`)}
                                    >
                                      <Eye size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
          <p className="text-gray-600">Track and manage all donations and contributions</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700 transition"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Donations</p>
              <p className="text-3xl font-bold mt-2">${stats.total.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{donations.length} donations</p>
            </div>
            <DollarSign className="text-blue-600" size={24} />
          </div>
          <p className="text-green-600 text-sm mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            ${stats.monthly.toLocaleString()} this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Status Overview</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-600">Completed:</span>
                  <span className="font-semibold">{stats.completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Pending:</span>
                  <span className="font-semibold">{stats.pendingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Failed:</span>
                  <span className="font-semibold">{stats.failedCount}</span>
                </div>
              </div>
            </div>
            <BarChart3 className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Today's Donations</p>
              <p className="text-3xl font-bold mt-2">${stats.daily.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {donations.filter(d => {
                  const date = new Date(d.createdAt);
                  const today = new Date();
                  return date.getDate() === today.getDate() && 
                         date.getMonth() === today.getMonth() && 
                         date.getFullYear() === today.getFullYear();
                }).length} donations today
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Average Donation</p>
              <p className="text-3xl font-bold mt-2">${stats.avgDonation.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                ${stats.monthly.toLocaleString()} this month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("table")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "table"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Table size={18} />
              <span>Table View</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("grouped")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "grouped"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Grid3x3 size={18} />
              <span>Grouped View</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Active Tab Content */}
      {activeTab === "table" ? renderTableView() : renderGroupedView()}

      {/* Pagination */}
      {(activeTab === "table" && filteredDonations.length > 0) && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredDonations.length} of {donations.length} donations
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;