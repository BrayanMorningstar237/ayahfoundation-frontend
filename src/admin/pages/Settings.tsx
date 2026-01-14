import { useState } from 'react';
import { 
  Save,
  Shield,
  Bell,
  Globe,
  Palette,
  Database,
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: "Ayah Foundation",
      siteDescription: "Transforming lives through sustainable development",
      contactEmail: "contact@ayahfoundation.org",
      contactPhone: "+237 6XX XXX XXX",
      address: "Yaoundé, Cameroon"
    },
    security: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorAuth: false
    },
    notifications: {
      emailNotifications: true,
      donationAlerts: true,
      newUserAlerts: true,
      weeklyReports: true
    },
    appearance: {
      primaryColor: "#2563eb",
      secondaryColor: "#f59e0b",
      darkMode: false,
      fontFamily: "Inter"
    }
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, settings[section as keyof typeof settings]);
    alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your admin panel settings and preferences</p>
        </div>
        <button 
          onClick={() => handleSave('all')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
        >
          <Save size={18} />
          <span>Save All Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(settings.general).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, [key]: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            ))}
            
            <button 
              onClick={() => handleSave('general')}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Save General Settings
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="text-red-600" size={24} />
            <h2 className="text-xl font-bold">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={settings.security.currentPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, currentPassword: e.target.value }
                })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={settings.security.newPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, newPassword: e.target.value }
                })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={settings.security.confirmPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, confirmPassword: e.target.value }
                })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, twoFactorAuth: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <label>Enable Two-Factor Authentication</label>
            </div>
            
            <button 
              onClick={() => handleSave('security')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="text-green-600" size={24} />
            <h2 className="text-xl font-bold">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
              </div>
            ))}
            
            <button 
              onClick={() => handleSave('notifications')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold">Appearance Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Primary Color</label>
              <input
                type="color"
                value={settings.appearance.primaryColor}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, primaryColor: e.target.value }
                })}
                className="w-8 h-8 cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Secondary Color</label>
              <input
                type="color"
                value={settings.appearance.secondaryColor}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, secondaryColor: e.target.value }
                })}
                className="w-8 h-8 cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Font Family</label>
              <select
                value={settings.appearance.fontFamily}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, fontFamily: e.target.value }
                })}
                className="px-3 py-1 border rounded-lg"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Dark Mode</label>
              <input
                type="checkbox"
                checked={settings.appearance.darkMode}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, darkMode: e.target.checked }
                })}
                className="w-4 h-4"
              />
            </div>
            
            <button 
              onClick={() => handleSave('appearance')}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              Save Appearance Settings
            </button>
          </div>
        </div>

        {/* Database Backup */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="text-orange-600" size={24} />
            <h2 className="text-xl font-bold">Database & Backup</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Backup</h3>
              <p className="text-gray-600 text-sm">
                Create a backup of your current database. This includes all content, settings, and user data.
              </p>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Create Backup Now
              </button>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Restore</h3>
              <p className="text-gray-600 text-sm">
                Restore from a previous backup. This will replace all current data.
              </p>
              <input
                type="file"
                accept=".json,.sql"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Restore Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;