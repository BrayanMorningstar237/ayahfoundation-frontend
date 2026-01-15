import { useEffect, useState } from 'react';
import {
  Save,
  Trash2,
  Loader2,
  Upload,
  UserPlus
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
  formData.append('file', file);
  formData.append('folder', 'sections/team');

  const res = await fetch(
    'http://localhost:5000/api/dashboard/upload/single',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    }
  );

  if (!res.ok) throw new Error('Upload failed');
  return res.json(); // { url }
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

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        'http://localhost:5000/api/sections/team'
      );
      const data = await res.json();
      if (data?.content) setContent(data.content);
      setLoading(false);
    };
    load();
  }, []);

  /* ================= HELPERS ================= */

  const updateField = (key: keyof TeamContent, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const addMember = () => {
    setContent(prev => ({
      ...prev,
      members: [
        {
          id: crypto.randomUUID(),
          name: '',
          role: '',
          image: '',
          enabled: true,
          type: 'team',
          socials: {}
        },
        ...prev.members
      ]
    }));
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
  };

  /* ================= SAVE ================= */

  const save = async () => {
    await fetch('http://localhost:5000/api/sections/team', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ content })
    });
    setDirty(false);
    alert('Team section saved');
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 space-y-10">
      <h1 className="text-3xl font-bold">Team & Volunteers</h1>

      {/* SECTION HEADER */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <input
          className="w-full border rounded px-4 py-2"
          placeholder="Section Title"
          value={content.title}
          onChange={e => updateField('title', e.target.value)}
        />
        <textarea
          className="w-full border rounded px-4 py-2"
          placeholder="Subtitle"
          rows={3}
          value={content.subtitle}
          onChange={e => updateField('subtitle', e.target.value)}
        />
      </div>

      {/* MEMBERS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.members.map(member => (
          <div
            key={member.id}
            className="bg-white rounded-xl shadow p-6 space-y-4"
          >
            {member.image && (
              <img
                src={member.image}
                className="h-40 w-full object-cover rounded"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const res = await uploadImage(file);
                updateMember(member.id, 'image', res.url);
              }}
            />

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Name"
              value={member.name}
              onChange={e =>
                updateMember(member.id, 'name', e.target.value)
              }
            />

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Role"
              value={member.role}
              onChange={e =>
                updateMember(member.id, 'role', e.target.value)
              }
            />

            <select
              className="w-full border rounded px-3 py-2"
              value={member.type}
              onChange={e =>
                updateMember(member.id, 'type', e.target.value)
              }
            >
              <option value="team">Team</option>
              <option value="volunteer">Volunteer</option>
            </select>

            <div className="space-y-2">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Facebook"
                value={member.socials.facebook || ''}
                onChange={e =>
                  updateSocial(member.id, 'facebook', e.target.value)
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Twitter"
                value={member.socials.twitter || ''}
                onChange={e =>
                  updateSocial(member.id, 'twitter', e.target.value)
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="LinkedIn"
                value={member.socials.linkedin || ''}
                onChange={e =>
                  updateSocial(member.id, 'linkedin', e.target.value)
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={member.enabled}
                  onChange={() =>
                    updateMember(
                      member.id,
                      'enabled',
                      !member.enabled
                    )
                  }
                />
                Enabled
              </label>

              <button
                onClick={() => removeMember(member.id)}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addMember}
        className="flex items-center gap-2 text-blue-600 font-semibold"
      >
        <UserPlus size={18} /> Add Member
      </button>

      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end">
          <button
            onClick={save}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
