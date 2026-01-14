import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Newspaper, 
  Image,
  Activity,
  Layout,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalNews: number;
  totalImages: number;
  totalVisits: number;
  totalTeamMembers?: number;
  totalPrograms?: number;
  totalCampaigns?: number;
  totalSections?: number;
}

interface Activity {
  type: string;
  action: string;
  time: string;
  user: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalNews: 0,
    totalImages: 0,
    totalVisits: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [statsResponse, activityResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/dashboard/activity', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data);
      setActivities(activityResponse.data.activities || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Redirect to login
        window.location.href = '/admin/login';
      } else if (error.response?.status === 404) {
        setError('Dashboard endpoints not configured yet. Please set up the backend.');
      } else {
        setError('Failed to load dashboard data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100',
      description: 'Admin & Editor accounts',
      endpointAvailable: true
    },
    {
      title: 'News Articles',
      value: stats.totalNews,
      icon: <Newspaper className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50 border-green-100',
      description: 'Published content',
      endpointAvailable: true
    },
    {
      title: 'Media Files',
      value: stats.totalImages,
      icon: <Image className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100',
      description: 'Images & documents',
      endpointAvailable: true
    },
    {
      title: 'Website Sections',
      value: stats.totalSections || 0,
      icon: <Layout className="h-8 w-8 text-orange-600" />,
      color: 'bg-orange-50 border-orange-100',
      description: 'Active sections',
      endpointAvailable: !!stats.totalSections
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={fetchDashboardData}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </button>
                <a
                  href="http://localhost:5000/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Check Backend Health
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Setup Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Setup Required</h3>
          <p className="text-yellow-700 mb-4">
            To use the dashboard with real data, you need to:
          </p>
          <ol className="list-decimal pl-5 text-yellow-700 space-y-2">
            <li>Ensure your backend server is running on port 5000</li>
            <li>Set up MongoDB connection in your backend</li>
            <li>Create the required database models (User, News, Section, etc.)</li>
            <li>Run <code className="bg-yellow-100 px-2 py-1 rounded">npm run dev</code> in your backend directory</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time data from your database</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} border rounded-xl p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                {!stat.endpointAvailable && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Data not available
                  </span>
                )}
              </div>
              <div className="p-3 bg-white rounded-full shadow-sm">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity - REAL DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <span className="text-sm text-gray-500">
              {activities.length} activities
            </span>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'section' ? 'bg-blue-100' :
                      activity.type === 'news' ? 'bg-green-100' :
                      activity.type === 'user' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'section' && <Layout className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'news' && <Newspaper className="h-5 w-5 text-green-600" />}
                      {activity.type === 'user' && <Users className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">by {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{formatTime(activity.time)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Activities will appear here as you update content</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/news"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Newspaper className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Add News</span>
            </a>
            <a
              href="/admin/uploads"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Upload Media</span>
            </a>
            <a
              href="/admin/sections"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Layout className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Edit Sections</span>
            </a>
            <a
              href="/admin/users"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Manage Users</span>
            </a>
          </div>

          {/* Database Status */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-medium text-gray-900 mb-3">Data Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Users in database:</span>
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">News articles:</span>
                <span className="font-medium">{stats.totalNews}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Media files:</span>
                <span className="font-medium">{stats.totalImages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Live Database Connection</h3>
            <p className="text-sm text-gray-600 mt-1">
              All data shown above is fetched directly from your MongoDB database in real-time.
              No mock data is used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Database icon import at the top
import { Database } from 'lucide-react';

export default Dashboard;