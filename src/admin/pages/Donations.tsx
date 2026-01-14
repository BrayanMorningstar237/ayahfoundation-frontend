import { useState } from 'react';
import { 
  Filter, 
  Download, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react';

const Donations = () => {
  const [donations, _setDonations] = useState([
    {
      id: 1,
      donor: "John Smith",
      email: "john@example.com",
      amount: 500,
      currency: "USD",
      campaign: "Education Programs",
      date: "2024-01-15",
      status: "completed",
      paymentMethod: "Credit Card"
    },
    {
      id: 2,
      donor: "Sarah Johnson",
      email: "sarah@example.com",
      amount: 250,
      currency: "USD",
      campaign: "Healthcare Initiative",
      date: "2024-01-14",
      status: "pending",
      paymentMethod: "PayPal"
    },
    // Add more donations...
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    campaign: 'all',
    dateRange: 'all'
  });

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

  const stats = {
    total: 45230,
    monthly: 12500,
    daily: 420,
    avgDonation: 85
  };

  const exportToCSV = () => {
    console.log('Exporting donations to CSV');
    alert('CSV exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
          <p className="text-gray-600">Track and manage all donations and contributions</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
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
            </div>
            <DollarSign className="text-blue-600" size={24} />
          </div>
          <p className="text-green-600 text-sm mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            +12.5% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-3xl font-bold mt-2">${stats.monthly.toLocaleString()}</p>
            </div>
            <BarChart3 className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Today's Donations</p>
              <p className="text-3xl font-bold mt-2">${stats.daily}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Average Donation</p>
              <p className="text-3xl font-bold mt-2">${stats.avgDonation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select 
            value={filters.campaign}
            onChange={(e) => setFilters({...filters, campaign: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Campaigns</option>
            <option value="education">Education Programs</option>
            <option value="healthcare">Healthcare Initiative</option>
            <option value="food">Food Security</option>
          </select>

          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <button className="px-4 py-2 border rounded-lg flex items-center space-x-2">
            <Filter size={18} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">#{donation.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{donation.donor}</div>
                      <div className="text-sm text-gray-500">{donation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold">${donation.amount}</span>
                    <span className="text-sm text-gray-500 ml-1">{donation.currency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {donation.campaign}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{donation.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(donation.status)}
                      <span className="capitalize">{donation.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="p-1 text-gray-500 hover:text-blue-600">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to {donations.length} of 50 donations
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-lg">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border rounded-lg">2</button>
            <button className="px-3 py-1 border rounded-lg">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;