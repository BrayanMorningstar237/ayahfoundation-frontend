import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  ArrowRight
} from 'lucide-react';

/* ================= TYPES ================= */

type ItemType = 'program' | 'project';
type BlockType = 'subtitle' | 'text' | 'image';

interface ContentBlock {
  id: string;
  type: BlockType;
  value: string;
}

interface ProgramItem {
  id: string;
  type: ItemType;
  mainImage: string;
  stats: string;
  title: string;
  description: string;
  gallery: string[];
  blocks: ContentBlock[];
}

/* ================= IMAGE UPLOAD ================= */

const uploadImage = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await fetch(
    'https://ayahfoundation-backend.onrender.com//api/dashboard/upload/single',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    }
  );

  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { url }
};

/* ================= COMPONENT ================= */

const Programs = () => {
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeGalleryItem, setActiveGalleryItem] = useState<{itemId: string, index: number} | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://ayahfoundation-backend.onrender.com//api/sections/programs');
        const data = await res.json();
        setItems(data.content?.programs || []);
      } catch (error) {
        console.error('Failed to load programs:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= HELPERS ================= */

  const updateItem = (id: string, patch: Partial<ProgramItem>) => {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, ...patch } : i))
    );
    setDirty(true);
  };

  const addItem = (type: ItemType) => {
    const newItem: ProgramItem = {
      id: crypto.randomUUID(),
      type,
      mainImage: '',
      stats: '',
      title: '',
      description: '',
      gallery: [],
      blocks: []
    };
    setItems(prev => [...prev, newItem]);
    setExpandedItem(newItem.id);
    setDirty(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setExpandedItem(null);
    setDirty(true);
  };

  /* ================= IMAGE HANDLERS ================= */

  const uploadAndSet = async (
    key: string,
    file: File,
    cb: (url: string) => void,
    folder: string = 'sections/programs'
  ) => {
    try {
      setUploading(s => new Set(s).add(key));
      const preview = URL.createObjectURL(file);
      cb(preview);

      const uploaded = await uploadImage(file, folder);
      cb(uploaded.url);
      setDirty(true);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(s => {
        const n = new Set(s);
        n.delete(key);
        return n;
      });
      
      // Clean up blob URL
      setTimeout(() => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }, 1000);
    }
  };

  /* ================= GALLERY HANDLERS ================= */

  const addToGallery = async (itemId: string, file: File) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const key = `${itemId}-gallery-${item.gallery.length}`;
    await uploadAndSet(key, file, (url) => {
      updateItem(itemId, {
        gallery: [...item.gallery, url]
      });
    }, 'sections/programs/gallery');
  };

  const removeFromGallery = (itemId: string, index: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newGallery = [...item.gallery];
    newGallery.splice(index, 1);
    updateItem(itemId, { gallery: newGallery });
  };

  /* ================= BLOCKS ================= */

  const addBlock = (itemId: string, type: BlockType) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      value: ''
    };
    
    updateItem(itemId, {
      blocks: [...item.blocks, newBlock]
    });
  };

  const updateBlock = (itemId: string, blockId: string, value: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      blocks: item.blocks.map(b => 
        b.id === blockId ? { ...b, value } : b
      )
    });
  };

  const removeBlock = (itemId: string, blockId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      blocks: item.blocks.filter(b => b.id !== blockId)
    });
  };

  const moveBlock = (itemId: string, blockId: string, direction: 'up' | 'down') => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const index = item.blocks.findIndex(b => b.id === blockId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === item.blocks.length - 1)
    ) return;

    const newBlocks = [...item.blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    updateItem(itemId, { blocks: newBlocks });
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (uploading.size > 0) {
      alert('Please wait for all uploads to finish');
      return;
    }

    // Check for blob URLs
    const hasBlobUrls = items.some(item =>
      item.mainImage?.startsWith('blob:') ||
      item.gallery.some(img => img.startsWith('blob:')) ||
      item.blocks.some(block => block.type === 'image' && block.value?.startsWith('blob:'))
    );

    if (hasBlobUrls) {
      alert('Please wait for all images to finish uploading before saving.');
      return;
    }

    try {
      const response = await fetch('https://ayahfoundation-backend.onrender.com//api/sections/programs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ content: { programs: items } })
      });

      if (response.ok) {
        setDirty(false);
        alert('Successfully saved!');
      } else {
        const errorText = await response.text();
        alert(`Failed to save: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving. Please check your connection.');
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8 md:space-y-12 pb-24 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto">
      {/* HEADER WITH SAVE BUTTON */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Programs & Projects</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Manage your programs and projects. Each item appears as a card on the main page.
          </p>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={uploading.size > 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-lg md:rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {uploading.size > 0 ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="hidden md:inline">Uploading ({uploading.size})...</span>
                <span className="md:hidden">Uploading...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span className="hidden md:inline">Save Changes</span>
                <span className="md:hidden">Save</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* SECTION HEADER */}
      <div className="text-center bg-white border border-gray-200 rounded-xl md:rounded-2xl p-6 md:p-8">
        <span className="text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 block">
          What We Do
        </span>
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900">
          Current Programs & Projects
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Our comprehensive programs address the root causes of inequality through education, healthcare, and community development.
        </p>
      </div>

      {/* PROGRAM/PROJECT CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {items.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              expandedItem === item.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* CARD HEADER */}
            <div className="flex justify-between items-start p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${
                  item.type === 'program' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.type}
                </span>
                {uploading.has(`${item.id}-main`) && (
                  <span className="text-sm text-blue-600 flex items-center gap-1">
                    <Loader2 className="animate-spin" size={14} /> Uploading...
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={expandedItem === item.id ? "Collapse" : "Expand"}
                >
                  {expandedItem === item.id ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* CARD CONTENT (MIMICS FRONTEND DESIGN) */}
            {/* Main image area */}
<div className="relative h-48 md:h-64 overflow-hidden bg-gray-100">
  {item.mainImage ? (
    <div className="relative w-full h-full">
      <img 
        src={item.mainImage}
        alt="Program"
        className="w-full h-full object-contain bg-gray-100"
        loading="lazy"
      />
      {item.mainImage.startsWith('blob:') && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-sm font-medium">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
      <ImageIcon size={48} className="mb-3 text-gray-300" />
      <p>No image selected</p>
    </div>
  )}
  
  {/* STATS BADGE - Always show it, even when empty */}
  <div className="z-50 absolute bottom-8 left-[5px]">
    <input
      value={item.stats}
      onChange={e => updateItem(item.id, { stats: e.target.value })}
      placeholder="Stats badge"
      className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 border border-white/50 shadow-sm"
    />
  </div>
</div>

            {/* IMAGE UPLOAD BUTTON */}
            <div className="p-4 border-b border-gray-100">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadAndSet(
                      `${item.id}-main`,
                      file,
                      (url) => updateItem(item.id, { mainImage: url })
                    );
                  }}
                  disabled={uploading.has(`${item.id}-main`)}
                />
                <div className={`w-full px-4 py-2 rounded-lg text-white text-sm transition flex items-center justify-center gap-2 ${
                  uploading.has(`${item.id}-main`) 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}>
                  {uploading.has(`${item.id}-main`) ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      {item.mainImage ? 'Replace Image' : 'Upload Image'}
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* TITLE & DESCRIPTION */}
            <div className="p-4 md:p-6 space-y-4">
              <input
                value={item.title}
                onChange={e => updateItem(item.id, { title: e.target.value })}
                placeholder="Program Title"
                className="w-full text-xl md:text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 bg-white"
              />

              <textarea
                value={item.description}
                onChange={e => updateItem(item.id, { description: e.target.value })}
                placeholder="Program description"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white resize-y"
              />

              {/* LEARN MORE BUTTON (Read-only) */}
              <div className="pt-2">
                <div className="text-blue-600 font-semibold inline-flex items-center group">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This button is shown on the frontend card
                </p>
              </div>
            </div>

            {/* EXPANDED CONTENT */}
            {expandedItem === item.id && (
              <div className="border-t border-gray-200 p-4 md:p-6 space-y-6">
                {/* GALLERY */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <ImageIcon size={18} /> Gallery Images
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {item.gallery.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-contain"
                            onClick={() => setActiveGalleryItem({ itemId: item.id, index })}
                          />
                        </div>
                        <button
                          onClick={() => removeFromGallery(item.id, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          addToGallery(item.id, file);
                        }}
                        disabled={uploading.has(`${item.id}-gallery`)}
                      />
                      <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition">
                        <Plus size={20} />
                        <span className="text-xs mt-1">Add</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* CONTENT BLOCKS */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Content Blocks</h3>
                  
                  <div className="space-y-3">
                    {item.blocks.map((block) => (
                      <div key={block.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3 relative">
                        <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                          {block.type}
                        </div>
                        
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => moveBlock(item.id, block.id, 'up')}
                            className="text-gray-400 hover:text-blue-600"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveBlock(item.id, block.id, 'down')}
                            className="text-gray-400 hover:text-blue-600"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeBlock(item.id, block.id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Remove block"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {block.type === 'subtitle' && (
                          <input
                            value={block.value}
                            onChange={e => updateBlock(item.id, block.id, e.target.value)}
                            placeholder="Subtitle"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 bg-white mt-6"
                          />
                        )}

                        {block.type === 'text' && (
                          <textarea
                            value={block.value}
                            onChange={e => updateBlock(item.id, block.id, e.target.value)}
                            placeholder="Text content"
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white mt-6 resize-y"
                          />
                        )}

                        {block.type === 'image' && (
                          <div className="space-y-2 mt-6">
                            {block.value ? (
                              <div className="relative">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={block.value}
                                    alt="Content"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <button
                                  onClick={() => updateBlock(item.id, block.id, '')}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                  aria-label="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer block">
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    uploadAndSet(
                                      block.id,
                                      file,
                                      (url) => updateBlock(item.id, block.id, url),
                                      'sections/programs/blocks'
                                    );
                                  }}
                                />
                                <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition">
                                  <ImageIcon size={24} />
                                  <span className="text-sm mt-2">Add Image</span>
                                </div>
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addBlock(item.id, 'subtitle')}
                      className="px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Subtitle
                    </button>
                    <button
                      onClick={() => addBlock(item.id, 'text')}
                      className="px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Text
                    </button>
                    <button
                      onClick={() => addBlock(item.id, 'image')}
                      className="px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ADD NEW CARD BUTTONS */}
        <div className="flex flex-col md:flex-row gap-3 md:col-span-2 lg:col-span-3">
          <button
            onClick={() => addItem('program')}
            className="flex-1 px-4 py-4 md:py-6 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-xl md:rounded-2xl transition flex flex-col items-center justify-center gap-2"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <Plus size={24} className="text-blue-600" />
            </div>
            <span className="font-semibold">Add New Program</span>
            <span className="text-sm text-gray-500">Appears as a card on main page</span>
          </button>
          
          <button
            onClick={() => addItem('project')}
            className="flex-1 px-4 py-4 md:py-6 border-2 border-dashed border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 rounded-xl md:rounded-2xl transition flex flex-col items-center justify-center gap-2"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <Plus size={24} className="text-green-600" />
            </div>
            <span className="font-semibold">Add New Project</span>
            <span className="text-sm text-gray-500">Appears as a card on main page</span>
          </button>
        </div>
      </div>

      {/* MODAL FOR GALLERY IMAGE VIEW */}
      {activeGalleryItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setActiveGalleryItem(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActiveGalleryItem(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-2 z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <img
              src={items.find(i => i.id === activeGalleryItem.itemId)?.gallery[activeGalleryItem.index]}
              alt="Gallery preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* MOBILE SAVE BAR */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 md:hidden">
          <button
            onClick={handleSave}
            disabled={uploading.size > 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {uploading.size > 0 ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading ({uploading.size})...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {/* DESKTOP SAVE BAR */}
      {dirty && (
        <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
          <div className="max-w-7xl mx-auto flex justify-end">
            <button
              onClick={handleSave}
              disabled={uploading.size > 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading.size > 0 ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading ({uploading.size})...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes to Database
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;