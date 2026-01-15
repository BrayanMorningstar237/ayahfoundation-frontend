import { useEffect, useState } from 'react';
import axios from 'axios';

type TeamMember = {
  name: string;
  role: string;
  image: string;
  socials: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
};

type TeamContent = {
  eyebrow: string;
  title: string;
  description: string;
  members: TeamMember[];
};

const uploadSingleFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    'http://localhost:5000/api/dashboard/upload/single',
    {
      method: 'POST',
      body: formData
    }
  );

  if (!res.ok) throw new Error('Upload failed');
  return res.json(); // { url }
};

export default function TeamVolunteers() {
  const [content, setContent] = useState<TeamContent>({
    eyebrow: '',
    title: '',
    description: '',
    members: []
  });

  const [loading, setLoading] = useState(false);

  /* ======================
     LOAD SECTION
  ====================== */
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/sections/team')
      .then(res => {
        if (res.data?.content) {
          setContent(res.data.content);
        }
      })
      .catch(() => {
        console.warn('Team section not found');
      });
  }, []);

  /* ======================
     SAVE SECTION
  ====================== */
  const saveSection = async () => {
    setLoading(true);
    await axios.put('http://localhost:5000/api/sections/team', {
      content
    });
    setLoading(false);
    alert('Team section saved');
  };

  /* ======================
     MEMBER HANDLERS
  ====================== */
  const addMember = () => {
    setContent(prev => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: '',
          role: '',
          image: '',
          socials: {}
        }
      ]
    }));
  };

  const updateMember = (
    index: number,
    field: keyof TeamMember,
    value: any
  ) => {
    const members = [...content.members];
    (members[index] as any)[field] = value;
    setContent({ ...content, members });
  };

  const uploadMemberImage = async (
    index: number,
    file: File
  ) => {
    const { url } = await uploadSingleFile(file);
    updateMember(index, 'image', url);
  };

  const removeMember = (index: number) => {
    const members = [...content.members];
    members.splice(index, 1);
    setContent({ ...content, members });
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Team Section</h1>

      {/* Titles */}
      <input
        className="input"
        placeholder="Eyebrow"
        value={content.eyebrow}
        onChange={e =>
          setContent({ ...content, eyebrow: e.target.value })
        }
      />

      <input
        className="input"
        placeholder="Title"
        value={content.title}
        onChange={e =>
          setContent({ ...content, title: e.target.value })
        }
      />

      <textarea
        className="input"
        placeholder="Description"
        value={content.description}
        onChange={e =>
          setContent({
            ...content,
            description: e.target.value
          })
        }
      />

      {/* Members */}
      <div className="space-y-6">
        {content.members.map((member, i) => (
          <div
            key={i}
            className="border p-4 rounded-xl space-y-3"
          >
            <input
              className="input"
              placeholder="Name"
              value={member.name}
              onChange={e =>
                updateMember(i, 'name', e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Role"
              value={member.role}
              onChange={e =>
                updateMember(i, 'role', e.target.value)
              }
            />

            {member.image && (
              <img
                src={member.image}
                className="h-40 rounded-lg object-cover"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={e =>
                e.target.files &&
                uploadMemberImage(i, e.target.files[0])
              }
            />

            <button
              className="text-red-600"
              onClick={() => removeMember(i)}
            >
              Remove Member
            </button>
          </div>
        ))}
      </div>

      <button onClick={addMember} className="btn">
        + Add Member
      </button>

      <button
        disabled={loading}
        onClick={saveSection}
        className="btn-primary"
      >
        {loading ? 'Saving...' : 'Save Section'}
      </button>
    </div>
  );
}
