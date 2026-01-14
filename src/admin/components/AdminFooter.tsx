import React from 'react';

const AdminFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-600 mb-2 md:mb-0">
          © {new Date().getFullYear()} Ayah Foundation. All rights reserved.
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="hidden md:inline">Admin Dashboard v1.0</span>
          <span>•</span>
          <a href="/" className="hover:text-blue-600 transition-colors">
            View Website
          </a>
          <span>•</span>
          <a href="/help" className="hover:text-blue-600 transition-colors">
            Help
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;