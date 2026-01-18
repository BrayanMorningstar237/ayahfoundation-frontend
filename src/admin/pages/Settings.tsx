import { useEffect, useState } from 'react';
import axios from '../services/axios';
import { Globe, Shield } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    security: {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  /* =========================
     LOAD SETTINGS
  ========================= */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [siteRes, adminRes] = await Promise.all([
          axios.get('/settings/site'),
          axios.get('/auth/me')
        ]);

        const admin = adminRes.data.user || adminRes.data;

        setSettings(prev => ({
          ...prev,
          general: {
            siteName: siteRes.data.siteName || '',
            address: siteRes.data.address || '',
            phone: siteRes.data.phone || '',
            email: siteRes.data.email || '',
            website: siteRes.data.website || '',
            facebook: siteRes.data.socialLinks?.facebook || '',
            twitter: siteRes.data.socialLinks?.twitter || '',
            instagram: siteRes.data.socialLinks?.instagram || '',
            linkedin: siteRes.data.socialLinks?.linkedin || '',
            youtube: siteRes.data.socialLinks?.youtube || ''
          },
          security: {
            ...prev.security,
            name: admin?.name || '',
            email: admin?.email || ''
          }
        }));
      } catch (err) {
        console.error(err);
        alert('Failed to load settings');
      }
    };

    loadSettings();
  }, []);

  /* =========================
     SAVE HANDLER
  ========================= */
  const handleSave = async (type: 'general' | 'security') => {
    try {
      setLoading(true);

      if (type === 'general') {
        await axios.put('/settings/site', {
          siteName: settings.general.siteName,
          address: settings.general.address,
          phone: settings.general.phone,
          email: settings.general.email,
          website: settings.general.website,
          socialLinks: {
            facebook: settings.general.facebook,
            twitter: settings.general.twitter,
            instagram: settings.general.instagram,
            linkedin: settings.general.linkedin,
            youtube: settings.general.youtube
          }
        });
      }

      if (type === 'security') {
        if (
          settings.security.newPassword &&
          settings.security.newPassword !== settings.security.confirmPassword
        ) {
          alert('Passwords do not match');
          return;
        }

        await axios.put('/settings/credentials', {
          name: settings.security.name,
          email: settings.security.email,
          currentPassword: settings.security.currentPassword,
          newPassword: settings.security.newPassword || undefined
        });

        setSettings(prev => ({
          ...prev,
          security: {
            ...prev.security,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
      }

      alert('Settings updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl m-auto">
      {/* WEBSITE SETTINGS */}
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="text-blue-600" />
          <h2 className="text-xl font-bold">Website Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.general).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                value={value}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, [key]: e.target.value }
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          ))}
        </div>

        <button
          disabled={loading}
          onClick={() => handleSave('general')}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Save Website Settings
        </button>
      </div>

      {/* SECURITY SETTINGS */}
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-red-600" />
          <h2 className="text-xl font-bold">Admin Security</h2>
        </div>

        <div className="space-y-4 max-w-md">
          {['name', 'email', 'currentPassword', 'newPassword', 'confirmPassword'].map(
            field => (
              <input
                key={field}
                type={field.toLowerCase().includes('password') ? 'password' : 'text'}
                placeholder={field.replace(/([A-Z])/g, ' $1')}
                value={(settings.security as any)[field]}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, [field]: e.target.value }
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
            )
          )}
        </div>

        <button
          disabled={loading}
          onClick={() => handleSave('security')}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          Update Credentials
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
