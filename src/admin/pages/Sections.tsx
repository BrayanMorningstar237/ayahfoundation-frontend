import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save } from 'lucide-react';

/* ================= TYPES ================= */

interface StatItem {
  id: string;
  number: string;
  label: string;
}

interface TextBlock {
  id: string;
  value: string;
}

interface AboutBlock {
  id: string;
  type: 'image' | 'subtitle' | 'text';
  value: string;
  description?: string;
}

/* ================= COMPONENT ================= */

const Sections = () => {
  const [dirty, setDirty] = useState(false);

  /* ================= STATS (TOP SECTION) ================= */
  const [stats, setStats] = useState<StatItem[]>([
    { id: '1', number: '5,000+', label: 'Lives Touched' },
    { id: '2', number: '150+', label: 'Families Supported' },
    { id: '3', number: '20+', label: 'Community Projects' },
    { id: '4', number: '50+', label: 'Volunteers Active' }
  ]);

  const updateStat = (id: string, key: keyof StatItem, value: string) => {
    setStats(prev =>
      prev.map(s => (s.id === id ? { ...s, [key]: value } : s))
    );
    setDirty(true);
  };

  const addStat = () => {
    setStats(prev => [
      ...prev,
      { id: crypto.randomUUID(), number: '', label: '' }
    ]);
    setDirty(true);
  };

  const removeStat = (id: string) => {
    setStats(prev => prev.filter(s => s.id !== id));
    setDirty(true);
  };

  /* ================= ABOUT HEADER ================= */
  const [aboutLabel, setAboutLabel] = useState('Who We Are');
  const [aboutTitle, setAboutTitle] = useState('About Ayah Foundation');
  const [aboutIntro, setAboutIntro] = useState(
    'Founded in the heart of Cameroon, Ayah Foundation is a beacon of hope dedicated to transforming lives.'
  );

  /* ================= ABOUT IMAGE + OVERLAY STAT ================= */
  const [mainImage, setMainImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800'
  );
  const [mainImageDescription, setMainImageDescription] = useState(
    'Ayah Foundation headquarters'
  );
  const [endImage, setEndImage] = useState<string | null>(null);
  const [endImageDescription, setEndImageDescription] = useState(
    'Ayah Foundation community impact'
  );

  const [overlayStat, setOverlayStat] = useState<StatItem>({
    id: 'overlay',
    number: '8+',
    label: 'Years of Impact'
  });

  /* ================= ABOUT TEXT ================= */
  const [storyTitle, setStoryTitle] = useState('Our Story');

  const [storyParagraphs, setStoryParagraphs] = useState<TextBlock[]>([
    {
      id: 'p1',
      value:
        'What began as a small grassroots initiative in 2018 has blossomed into a comprehensive organization.'
    },
    {
      id: 'p2',
      value:
        'Today, we work hand-in-hand with communities, ensuring sustainable impact.'
    }
  ]);

  /* ================= ABOUT BLOCKS (New section for flexible content) ================= */
  const [aboutBlocks, setAboutBlocks] = useState<AboutBlock[]>([
    {
      id: 'b1',
      type: 'subtitle',
      value: 'Our Mission'
    },
    {
      id: 'b2',
      type: 'text',
      value: 'To empower communities through sustainable initiatives.'
    },
    {
      id: 'b3',
      type: 'image',
      value: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      description: 'Community outreach program'
    }
  ]);

  /* ================= HIGHLIGHT STATS (ABOUT) ================= */
  const [highlightStats, setHighlightStats] = useState<StatItem[]>([
    { id: 'h1', number: '150+', label: 'Partner Organizations' },
    { id: 'h2', number: '25+', label: 'Awards Received' }
  ]);

  /* ================= HELPERS ================= */

  const updateParagraph = (id: string, value: string) => {
    setStoryParagraphs(prev =>
      prev.map(p => (p.id === id ? { ...p, value } : p))
    );
    setDirty(true);
  };

  const addParagraph = () => {
    setStoryParagraphs(prev => [
      ...prev,
      { id: crypto.randomUUID(), value: '' }
    ]);
    setDirty(true);
  };

  const removeParagraph = (id: string) => {
    setStoryParagraphs(prev => prev.filter(p => p.id !== id));
    setDirty(true);
  };

  const updateHighlightStat = (
    id: string,
    key: keyof StatItem,
    value: string
  ) => {
    setHighlightStats(prev =>
      prev.map(s => (s.id === id ? { ...s, [key]: value } : s))
    );
    setDirty(true);
  };

  /* ================= ABOUT BLOCKS HELPERS ================= */
  const addAboutBlock = (type: AboutBlock['type']) => {
    const newBlock: AboutBlock = {
      id: crypto.randomUUID(),
      type,
      value: '',
      description: type === 'image' ? '' : undefined
    };
    setAboutBlocks(prev => [...prev, newBlock]);
    setDirty(true);
  };

  const updateAboutBlock = (id: string, updates: Partial<AboutBlock>) => {
    setAboutBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
    setDirty(true);
  };

  const removeAboutBlock = (id: string) => {
    setAboutBlocks(prev => prev.filter(b => b.id !== id));
    setDirty(true);
  };

  const handleSave = async () => {
  await fetch("/api/sections/about", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content: {
        header: {
          label: aboutLabel,
          title: aboutTitle,
          intro: aboutIntro
        },
        mainImage: {
          url: mainImage,
          description: mainImageDescription,
          overlayStat
        },
        blocks: aboutBlocks,
        highlightStats
      }
    })
  });

  setDirty(false);
};


  /* ================= UI ================= */

  return (
    <div className="space-y-16 pb-28">

      <h1 className="text-3xl font-bold">Home Page Sections</h1>

      {/* ================= STATS SECTION (TOP) ================= */}
      <section className="bg-white border rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Impact Stats</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div
              key={stat.id}
              className="relative bg-gray-50 p-4 rounded-xl border space-y-3"
            >
              <button
                onClick={() => removeStat(stat.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>

              <input
                value={stat.number}
                onChange={e =>
                  updateStat(stat.id, 'number', e.target.value)
                }
                placeholder="150+"
                className="w-full border rounded-lg px-3 py-2 font-bold text-lg"
              />

              <input
                value={stat.label}
                onChange={e =>
                  updateStat(stat.id, 'label', e.target.value)
                }
                placeholder="Label"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addStat}
          className="text-sm text-blue-600 flex items-center gap-2"
        >
          <Plus size={16} /> Add Stat
        </button>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="bg-white border rounded-2xl p-6 space-y-8">

        {/* HEADER */}
        <div className="space-y-3">
          <input
            value={aboutLabel}
            onChange={e => {
              setAboutLabel(e.target.value);
              setDirty(true);
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm uppercase tracking-widest text-yellow-600"
          />

          <input
            value={aboutTitle}
            onChange={e => {
              setAboutTitle(e.target.value);
              setDirty(true);
            }}
            className="w-full border rounded-lg px-3 py-2 text-2xl font-bold"
          />

          <textarea
            value={aboutIntro}
            onChange={e => {
              setAboutIntro(e.target.value);
              setDirty(true);
            }}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* ================= ABOUT MAIN IMAGE ================= */}
        <div className="space-y-4">
          <label className="font-medium flex items-center gap-2">
            <ImageIcon size={16} /> About Main Image
          </label>

          {/* IMAGE PREVIEW */}
          <div className="relative rounded-2xl overflow-hidden border bg-gray-50">
            {mainImage ? (
              <img
                src={mainImage}
                alt={mainImageDescription}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                No image selected
              </div>
            )}

            {/* OVERLAY STAT (same as frontend) */}
            {mainImage && (
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                <input
                  value={overlayStat.number}
                  onChange={e => {
                    setOverlayStat({ ...overlayStat, number: e.target.value });
                    setDirty(true);
                  }}
                  className="bg-transparent text-4xl font-bold w-24 outline-none"
                />
                <input
                  value={overlayStat.label}
                  onChange={e => {
                    setOverlayStat({ ...overlayStat, label: e.target.value });
                    setDirty(true);
                  }}
                  className="bg-transparent text-sm outline-none w-40"
                />
              </div>
            )}
          </div>

          {/* IMAGE CAPTION / DESCRIPTION */}
          <input
            value={mainImageDescription}
            onChange={e => {
              setMainImageDescription(e.target.value);
              setDirty(true);
            }}
            placeholder="Image description (e.g. Ayah Foundation headquarters)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          {/* IMAGE ACTIONS */}
          <div className="flex gap-3">
            {/* REPLACE */}
            <label className="cursor-pointer">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setMainImage(URL.createObjectURL(file));
                  setDirty(true);
                }}
              />
              <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
                Replace Image
              </div>
            </label>

            {/* REMOVE */}
            <button
              onClick={() => {
                setMainImage(null);
                setDirty(true);
              }}
              className="px-4 py-2 rounded-xl border text-sm text-red-600 hover:bg-red-50"
            >
              Remove Image
            </button>
          </div>
        </div>

        {/* STORY */}
        <div className="space-y-4">
          <input
            value={storyTitle}
            onChange={e => {
              setStoryTitle(e.target.value);
              setDirty(true);
            }}
            className="w-full border rounded-lg px-3 py-2 text-xl font-bold"
          />

          {storyParagraphs.map(p => (
            <div key={p.id} className="relative">
              <textarea
                value={p.value}
                onChange={e => updateParagraph(p.id, e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2"
              />
              <button
                onClick={() => removeParagraph(p.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={addParagraph}
            className="text-sm text-blue-600"
          >
            + Add Paragraph
          </button>
        </div>

        {/* ================= END IMAGE (AFTER LAST PARAGRAPH) ================= */}
        <div className="space-y-4 border rounded-2xl p-4 bg-gray-50">
          <label className="font-medium flex items-center gap-2">
            <ImageIcon size={16} /> Another image (can be in between text)
          </label>

          {/* IMAGE PREVIEW */}
          <div className="rounded-2xl overflow-hidden border bg-white">
            {endImage ? (
              <img
                src={endImage}
                alt={endImageDescription}
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                No image selected
              </div>
            )}
          </div>

          {/* IMAGE DESCRIPTION */}
          <input
            value={endImageDescription}
            onChange={e => {
              setEndImageDescription(e.target.value);
              setDirty(true);
            }}
            placeholder="Image description (e.g. Community development project)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          {/* IMAGE ACTIONS */}
          <div className="flex gap-3">
            {/* REPLACE */}
            <label className="cursor-pointer">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setEndImage(URL.createObjectURL(file));
                  setDirty(true);
                }}
              />
              <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
                Replace Image
              </div>
            </label>

            {/* REMOVE */}
            <button
              onClick={() => {
                setEndImage(null);
                setDirty(true);
              }}
              className="px-4 py-2 rounded-xl border text-sm text-red-600 hover:bg-red-50"
            >
              Remove Image
            </button>
          </div>
        </div>

        {/* ================= FLEXIBLE CONTENT BLOCKS ================= */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Additional Content</h3>
          
          {aboutBlocks.map(block => (
            <div key={block.id} className="border rounded-2xl p-4 bg-gray-50 space-y-3 relative">
              <button
                onClick={() => removeAboutBlock(block.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>

              {block.type === 'image' && (
                <>
                  <div className="rounded-xl overflow-hidden border bg-white">
                    {block.value ? (
                      <img
                        src={block.value}
                        alt={block.description}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                        No image selected
                      </div>
                    )}
                  </div>
                  
                  <input
                    value={block.description || ''}
                    onChange={e => updateAboutBlock(block.id, { description: e.target.value })}
                    placeholder="Image description"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        updateAboutBlock(block.id, {
                          value: URL.createObjectURL(file)
                        });
                      }}
                    />
                    <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">
                      Replace Image
                    </div>
                  </label>
                </>
              )}

              {block.type === 'subtitle' && (
                <input
                  value={block.value}
                  onChange={e => updateAboutBlock(block.id, { value: e.target.value })}
                  placeholder="Subtitle"
                  className="w-full border rounded-lg px-3 py-2 text-lg font-semibold"
                />
              )}

              {block.type === 'text' && (
                <textarea
                  value={block.value}
                  onChange={e => updateAboutBlock(block.id, { value: e.target.value })}
                  rows={3}
                  placeholder="Text content"
                  className="w-full border rounded-lg px-3 py-2"
                />
              )}
            </div>
          ))}

          {/* ================= THE THREE BUTTONS ================= */}
          <div className="flex gap-4">
            <button
              onClick={() => addAboutBlock('image')}
              className="text-sm text-blue-600 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              + Add image
            </button>
            <button
              onClick={() => addAboutBlock('subtitle')}
              className="text-sm text-blue-600 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              + Add subtitle
            </button>
            <button
              onClick={() => addAboutBlock('text')}
              className="text-sm text-blue-600 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              + Add text
            </button>
          </div>
        </div>

        {/* HIGHLIGHT STATS */}
        <div className="grid sm:grid-cols-2 gap-4">
          {highlightStats.map(stat => (
            <div
              key={stat.id}
              className="bg-gray-50 p-4 rounded-xl space-y-2"
            >
              <input
                value={stat.number}
                onChange={e =>
                  updateHighlightStat(stat.id, 'number', e.target.value)
                }
                className="w-full text-2xl font-bold border rounded-lg px-3 py-2"
              />
              <input
                value={stat.label}
                onChange={e =>
                  updateHighlightStat(stat.id, 'label', e.target.value)
                }
                className="w-full text-sm border rounded-lg px-3 py-2"
              />
            </div>
          ))}
        </div>
      </section>

      {/* SAVE BAR */}
      {dirty && (
        <div className="  bg-white border-t p-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Sections;