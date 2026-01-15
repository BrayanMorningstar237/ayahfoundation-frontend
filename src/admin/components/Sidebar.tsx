import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Layers,
  Newspaper,
  Video,
  Users,
  HeartHandshake,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderKanban
} from 'lucide-react';

import logoimg from '../../assets/images/logo/AyahFoundation.jpeg';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Donations moved to SECOND
  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/donations', icon: <HeartHandshake size={20} />, label: 'Donations' },
    { path: '/admin/hero', icon: <Home size={20} />, label: 'Wall Frame & Tagline' },
    { path: '/admin/sections', icon: <Layers size={20} />, label: 'Section Manager' },
    { path: '/admin/Programs', icon: <FolderKanban size={20} />, label: 'Programs & Projects' },
    { path: '/admin/news', icon: <Newspaper size={20} />, label: 'News & Updates' },
    { path: '/admin/campaigns', icon: <Video size={20} />, label: 'Campaigns & Stories' },
    { path: '/admin/team', icon: <Users size={20} />, label: 'Team & Volunteers' }
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}
      h-screen flex flex-col relative`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <img
                src={logoimg}
                alt="Ayah Foundation"
                className="w-9 h-9 object-contain"
              />
              <div className="leading-tight">
                <h2 className="text-sm font-semibold">Ayah Foundation</h2>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 flex-1 overflow-y-auto space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
              ${isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'}`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        {/* Settings */}
        <Link
          to="/admin/settings"
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
            ${isActive('/admin/settings')
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-800 text-gray-300'}`}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* ✅ Logout Button */}
        <button
          className="flex items-center space-x-3 p-3 rounded-lg w-full text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
