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

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/donations', icon: HeartHandshake, label: 'Donations' },
    { path: '/admin/hero', icon: Home, label: 'Wall Frame & Tagline' },
    { path: '/admin/sections', icon: Layers, label: 'Section Manager' },
    { path: '/admin/programs', icon: FolderKanban, label: 'Programs & Projects' },
    { path: '/admin/news', icon: Newspaper, label: 'News & Updates' },
    { path: '/admin/campaigns', icon: Video, label: 'Campaigns & Stories' },
    { path: '/admin/team', icon: Users, label: 'Team & Volunteers' }
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={`
        bg-gray-900 text-white h-screen flex flex-col relative
        transition-[width] duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* ================= LOGO ================= */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src={logoimg}
              alt="Ayah Foundation"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Ayah Foundation</p>
              <span className="text-xs text-gray-400">Admin Panel</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav
        className="
          flex-1 px-3 py-4 space-y-1
          overflow-y-auto overflow-x-hidden
          scrollbar-gutter-stable
        "
      >
        {menuItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-colors
              ${isActive(path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'}
            `}
          >
            {/* ICON (LOCKED SIZE – NEVER SHRINKS) */}
            <span className="w-6 h-6 flex items-center justify-center shrink-0">
              <Icon size={20} />
            </span>

            {/* LABEL */}
            {!collapsed && (
              <span className="text-sm whitespace-nowrap">
                {label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        {/* SETTINGS */}
        <Link
          to="/admin/settings"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-colors
            ${isActive('/admin/settings')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'}
          `}
        >
          <span className="w-6 h-6 flex items-center justify-center shrink-0">
            <Settings size={20} />
          </span>
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>

        {/* LOGOUT */}
        <button
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-300 hover:bg-red-600 hover:text-white
            transition-colors
          "
        >
          <span className="w-6 h-6 flex items-center justify-center shrink-0">
            <LogOut size={20} />
          </span>
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
