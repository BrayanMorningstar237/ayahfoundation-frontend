import { useEffect, useState } from 'react';
import {
  Save,
  Trash2,
  Loader2,
  Upload,
  UserPlus,
  User,
  Users,
  Facebook,
  Twitter,
  Linkedin,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/* ================= TYPES ================= */

type MemberType = 'team' | 'volunteer';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  enabled: boolean;
  type: MemberType;
  socials: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

interface TeamContent {
  title: string;
  subtitle: string;
  members: TeamMember[];
}

/* ================= UPLOAD ================= */

const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'sections/team');

  const res = await fetch(
    'https://ayahfoundation-backend.onrender.com/api/dashboard/upload/single',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    }
  );

  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

/* ================= COMPONENT ================= */

export default function TeamVolunteers() {
  const [content, setContent] = useState<TeamContent>({
    title: '',
    subtitle: '',
    members: []
  });

  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://ayahfoundation-backend.onrender.com/api/sections/team');
        const data = await res.json();
        if (data?.content) {
  setContent({
    ...data.content,
    members: (data.content.members || []).map((m: any) => ({
      ...m,
      socials: m.socials || {}   // GUARANTEE socials exists
    }))
  });
}

      } catch (error) {
        console.error('Failed to load team data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= HELPERS ================= */

  const updateField = (key: keyof TeamContent, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const addMember = () => {
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: '',
      role: '',
      image: '',
      enabled: true,
      type: 'team',
      socials: {}
    };
    
    setContent(prev => ({
      ...prev,
      members: [newMember, ...prev.members]
    }));
    setExpandedMember(newMember.id);
    setDirty(true);
  };

  const updateMember = (
    id: string,
    key: keyof TeamMember,
    value: any
  ) => {
    setContent(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.id === id ? { ...m, [key]: value } : m
      )
    }));
    setDirty(true);
  };

  const updateSocial = (
    id: string,
    key: 'facebook' | 'twitter' | 'linkedin',
    value: string
  ) => {
    setContent(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.id === id
          ? { ...m, socials: { ...m.socials, [key]: value } }
          : m
      )
    }));
    setDirty(true);
  };

  const removeMember = (id: string) => {
    setContent(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
    setDirty(true);
    if (expandedMember === id) setExpandedMember(null);
  };

  /* ================= SAVE ================= */

  const save = async () => {
    try {
      await fetch('https://ayahfoundation-backend.onrender.com/api/sections/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ content })
      });
      setDirty(false);
      alert('Team section saved successfully!');
    } catch (error) {
      alert('Failed to save team section');
      console.error(error);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky -top-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team & Volunteers</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Manage your team members and volunteers</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              {dirty && (
                <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={save}
                disabled={!dirty}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all ${
                  dirty 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save size={18} />
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Section Header</h2>
                <p className="text-blue-100 text-sm sm:text-base">Main title and description for the team section</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Section Title</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:bg-white focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                  placeholder="e.g., Meet Our Team"
                  value={content.title}
                  onChange={e => updateField('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Section Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:bg-white focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-all resize-none"
                  placeholder="Describe your team and their mission..."
                  value={content.subtitle}
                  onChange={e => updateField('subtitle', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team Members & Volunteers</h2>
              <p className="text-gray-600 text-sm sm:text-base">Add and manage your team members and volunteers</p>
            </div>
            <button
              onClick={addMember}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {content.members.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Yet</h3>
                <p className="text-gray-600 mb-6">Add your first team member or volunteer</p>
                <button
                  onClick={addMember}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={18} />
                  Add First Member
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {content.members.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Member Header */}
                  <div 
                    className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative">
                          {member.image ? (
                            <img
                              src={member.image}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow"
                              alt="Member"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="text-gray-400" size={20} />
                            </div>
                          )}
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            member.enabled ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {member.name || `Team Member ${index + 1}`}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              member.type === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {member.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {member.role || 'No role specified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(member.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        {expandedMember === member.id ? (
                          <ChevronUp className="text-gray-400" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedMember === member.id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6 border-t">
                      {/* Profile Image */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Profile Image</label>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="relative">
                            {member.image ? (
                              <div className="relative group">
                                <img
                                  src={member.image}
                                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                                  alt="Profile"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex items-center justify-center h-full">
                                    <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm">
                                      Change
                                      <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={async e => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const res = await uploadImage(file);
                                          updateMember(member.id, 'image', res.url);
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <label className="block cursor-pointer">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center hover:border-blue-400 transition-colors bg-gray-50">
                                  <Upload className="mb-2 text-gray-400" size={24} />
                                  <p className="text-sm text-gray-600 text-center px-2">Upload Photo</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const res = await uploadImage(file);
                                    updateMember(member.id, 'image', res.url);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-4 w-full">
                            {/* Basic Info */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Full Name</label>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                  placeholder="John Doe"
                                  value={member.name}
                                  onChange={e => updateMember(member.id, 'name', e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Role/Position</label>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                  placeholder="e.g., Project Manager"
                                  value={member.role}
                                  onChange={e => updateMember(member.id, 'role', e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Member Type & Status */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Member Type</label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateMember(member.id, 'type', 'team')}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                                      member.type === 'team'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    Team
                                  </button>
                                  <button
                                    onClick={() => updateMember(member.id, 'type', 'volunteer')}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                                      member.type === 'volunteer'
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    Volunteer
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Status</label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateMember(member.id, 'enabled', true)}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                      member.enabled
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    <Eye size={16} />
                                    Active
                                  </button>
                                  <button
                                    onClick={() => updateMember(member.id, 'enabled', false)}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                      !member.enabled
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    <EyeOff size={16} />
                                    Hidden
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Social Media Links */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Facebook className="text-blue-600" size={16} />
                              Facebook
                            </label>
                            <input
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              placeholder="https://facebook.com/username"
                              value={member.socials.facebook || ''}
                              onChange={e => updateSocial(member.id, 'facebook', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Twitter className="text-blue-400" size={16} />
                              Twitter
                            </label>
                            <input
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              placeholder="https://twitter.com/username"
                              value={member.socials.twitter || ''}
                              onChange={e => updateSocial(member.id, 'twitter', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Linkedin className="text-blue-700" size={16} />
                              LinkedIn
                            </label>
                            <input
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              placeholder="https://linkedin.com/in/username"
                              value={member.socials.linkedin || ''}
                              onChange={e => updateSocial(member.id, 'linkedin', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Preview Section */}
        {content.members.some(m => m.enabled) && (
          <section className="mt-12">
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Preview</h2>
                <p className="text-gray-600">How your team section will appear to users</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.members
                  .filter(m => m.enabled)
                  .slice(0, 3)
                  .map((member, _index) => (
                    <div
                      key={member.id}
                      className="group cursor-pointer transition-all duration-500 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl"
                    >
                      <div className="relative overflow-hidden">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <User className="text-blue-600" size={48} />
                          </div>
                        )}
                        
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${
                          member.type === 'team' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                        }`}>
                          {member.type}
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                          <div className="p-6 w-full">
                            <div className="flex gap-4 justify-center">
                              {member.socials.facebook && (
                                <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                                  <Facebook size={18} />
                                </a>
                              )}
                              {member.socials.twitter && (
                                <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-blue-400 hover:text-white transition-colors">
                                  <Twitter size={18} />
                                </a>
                              )}
                              {member.socials.linkedin && (
                                <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-blue-700 hover:text-white transition-colors">
                                  <Linkedin size={18} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {member.name || 'Team Member'}
                        </h3>
                        <p className="text-gray-600 mt-1">{member.role || 'Position'}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </div>

      
    </div>
  );
}