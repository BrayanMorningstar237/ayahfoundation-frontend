import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AdminNavbar from "./components/AdminNavbar";
import AdminFooter from "./components/AdminFooter";
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Hero from "./pages/HeroSection";
import Sections from "./pages/Sections";

import Programs from "./pages/Programs";
import News from "./pages/News";
import Campaigns from "./pages/Campaigns";
import Team from "./pages/TeamVolunteers";
import Settings from "./pages/Settings";
import _Uploads from "./pages/Uploads";
import _Users from "./pages/Users";

const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (token && user) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 py-6">
  <Routes>
    {/* Core */}
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="sections" element={<Sections />} />

    {/* New / Updated */}
    <Route path="donations" element={<Donations />} />
    <Route path="hero" element={<Hero />} />
    <Route path="Programs" element={<Programs />} />
    <Route path="news" element={<News />} />
    <Route path="campaigns" element={<Campaigns />} />
    <Route path="team" element={<Team />} />

    {/* Settings */}
    <Route path="settings" element={<Settings />} />

    {/* Optional: default redirect */}
    <Route path="*" element={<Dashboard />} />
  </Routes>
</main>


        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminApp;
