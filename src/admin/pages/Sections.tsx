import { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save, Upload, Loader2 } from 'lucide-react';

/* ================= TYPES ================= */

interface StatItem {
  id: string;
  number: string;
  label: string;
}

interface AboutBlock {
  id: string;
  type: 'image' | 'subtitle' | 'text';
  value: string;
  description?: string;
}

/* ================= IMAGE UPLOAD HELPER ================= */

const uploadImage = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  return res.json(); // { url, publicId }
};

/* ================= COMPONENT ================= */

const Sections = () => {
  const [dirty, setDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  /* ================= EMPTY INITIAL STATES ================= */
  
  // Stats (Top Section)
  const [stats, setStats] = useState<StatItem[]>([]);
  
  // About Header
  const [aboutLabel, setAboutLabel] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutIntro, setAboutIntro] = useState('');
  
  // About Main Image + Overlay Stat
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [mainImageDescription, setMainImageDescription] = useState('');
  const [overlayStat, setOverlayStat] = useState<StatItem>({
    id: 'overlay',
    number: '',
    label: ''
  });
  
  // About Flexible Blocks (ORDER PRESERVED)
  const [aboutBlocks, setAboutBlocks] = useState<AboutBlock[]>([]);
  
  // About Highlight Stats
  const [highlightStats, setHighlightStats] = useState<StatItem[]>([]);

  /* ================= FETCH REAL DATA FROM BACKEND ================= */
  
  useEffect(() => {
    const fetchSection = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('https://ayahfoundation-backend.onrender.com/api/sections/about');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        const content = data.content || {};
        // TOP STATS (Impact Stats at the top)
setStats(content.stats || []);

        // HEADER
        setAboutLabel(content.header?.label || '');
        setAboutTitle(content.header?.title || '');
        setAboutIntro(content.header?.intro || '');
        
        // MAIN IMAGE
        setMainImage(content.mainImage?.url || null);
        setMainImageDescription(content.mainImage?.description || '');
        setOverlayStat(content.mainImage?.overlayStat || {
          id: 'overlay',
          number: '',
          label: ''
        });
        
        // FLEXIBLE BLOCKS (ORDER PRESERVED FROM DB)
        setAboutBlocks(content.blocks || []);
        
        // HIGHLIGHT STATS
        setHighlightStats(content.highlightStats || []);
        
      } catch (err) {
        console.error('Failed to load section:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSection();
  }, []);

  /* ================= STATS HELPERS ================= */
  
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

  /* ================= IMAGE HANDLERS ================= */
  
  const handleMainImageUpload = async (file: File) => {
    const uploadId = 'main-image';
    try {
      setUploadingImages(prev => new Set(prev).add(uploadId));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setMainImage(previewUrl);
      
      // Upload to Cloudinary
      const uploaded = await uploadImage(file, 'sections/about');
      
      // Replace preview with Cloudinary URL
      setMainImage(uploaded.url);
      setDirty(true);
      
    } catch (error) {
      console.error('Failed to upload main image:', error);
      setMainImage(null);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
      
      // Clean up blob URL
      setTimeout(() => {
        if (file) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      }, 1000);
    }
  };

  const handleBlockImageUpload = async (blockId: string, file: File) => {
    const uploadId = `block-${blockId}`;
    try {
      setUploadingImages(prev => new Set(prev).add(uploadId));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      updateAboutBlock(blockId, { value: previewUrl });
      
      // Upload to Cloudinary
      const uploaded = await uploadImage(file, 'sections/about/blocks');
      
      // Replace preview with Cloudinary URL
      updateAboutBlock(blockId, { value: uploaded.url });
      setDirty(true);
      
    } catch (error) {
      console.error('Failed to upload block image:', error);
      updateAboutBlock(blockId, { value: '' });
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
      
      // Clean up blob URL
      setTimeout(() => {
        if (file) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      }, 1000);
    }
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

  /* ================= HIGHLIGHT STATS HELPERS ================= */
  
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

  /* ================= SAVE TO BACKEND WITH SAFETY CHECK ================= */
  
  const handleSave = async () => {
    // Safety check: Prevent saving blob URLs
    const hasBlobUrls = 
      mainImage?.startsWith('blob:') ||
      aboutBlocks.some(b => b.type === 'image' && b.value?.startsWith('blob:'));
    
    if (hasBlobUrls) {
      alert('Please wait for all images to finish uploading before saving.');
      return;
    }

    // Check if any uploads are still in progress
    if (uploadingImages.size > 0) {
      alert('Please wait for all images to finish uploading.');
      return;
    }

    try {
      const response = await fetch('https://ayahfoundation-backend.onrender.com/api/sections/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
  content: {
    stats, // ✅ FIXED — TOP STATS NOW SAVED
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
      
      if (response.ok) {
        setDirty(false);
        alert('Successfully saved!');
      } else {
        const errorText = await response.text();
        console.error('Failed to save:', errorText);
        alert(`Failed to save: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving. Please check your connection.');
    }
  };

  /* ================= LOADING STATE ================= */
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content from database...</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8 md:space-y-12 pb-24 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto">
      {/* HEADER WITH SAVE BUTTON */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Home Page Sections</h1>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={uploadingImages.size > 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-lg md:rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {uploadingImages.size > 0 ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="hidden md:inline">Uploading ({uploadingImages.size})...</span>
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

      {/* ================= STATS SECTION (TOP) ================= */}
      <section className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 md:space-y-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Impact Stats</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map(stat => (
            <div
              key={stat.id}
              className="relative bg-gray-50 p-4 rounded-lg md:rounded-xl border border-gray-200 space-y-2 md:space-y-3"
            >
              <button
                onClick={() => removeStat(stat.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                aria-label="Remove stat"
              >
                <Trash2 size={16} />
              </button>

              <input
                value={stat.number}
                onChange={e => updateStat(stat.id, 'number', e.target.value)}
                placeholder="150+"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold text-lg md:text-xl bg-white"
              />

              <input
                value={stat.label}
                onChange={e => updateStat(stat.id, 'label', e.target.value)}
                placeholder="Label"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addStat}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <Plus size={16} /> Add Stat
        </button>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-6 md:space-y-8">
        {/* HEADER */}
        <div className="space-y-3">
          <input
            value={aboutLabel}
            onChange={e => {
              setAboutLabel(e.target.value);
              setDirty(true);
            }}
            placeholder="Section Label (e.g., Who We Are)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm uppercase tracking-widest text-yellow-600 bg-white"
          />

          <input
            value={aboutTitle}
            onChange={e => {
              setAboutTitle(e.target.value);
              setDirty(true);
            }}
            placeholder="Section Title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xl md:text-2xl font-bold text-gray-900 bg-white"
          />

          <textarea
            value={aboutIntro}
            onChange={e => {
              setAboutIntro(e.target.value);
              setDirty(true);
            }}
            rows={2}
            placeholder="Section Introduction"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white resize-y min-h-[80px]"
          />
        </div>

        {/* ================= ABOUT MAIN IMAGE ================= */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon size={18} /> About Main Image
            </label>
            {uploadingImages.has('main-image') && (
              <span className="text-sm text-blue-600 flex items-center gap-1">
                <Loader2 className="animate-spin" size={14} /> Uploading...
              </span>
            )}
          </div>

          {/* IMAGE PREVIEW */}
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-gray-300 bg-gray-50">
            {mainImage ? (
              <>
                <div className="relative w-full">
                  <img
                    src={mainImage}
                    alt={mainImageDescription}
                    className="w-full h-48 md:h-80 object-contain bg-gray-100"
                    loading="lazy"
                  />
                  {mainImage.startsWith('blob:') && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="animate-spin mx-auto mb-2" size={28} />
                        <p className="text-sm font-medium">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* OVERLAY STAT - Responsive positioning */}
                {mainImage && !mainImage.startsWith('blob:') && (
                  <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-blue-600 text-white p-3 md:p-4 lg:p-6 rounded-xl md:rounded-2xl shadow-lg max-w-[160px] md:max-w-none">
                    <input
                      value={overlayStat.number}
                      onChange={e => {
                        setOverlayStat({ ...overlayStat, number: e.target.value });
                        setDirty(true);
                      }}
                      placeholder="8+"
                      className="bg-transparent text-2xl md:text-3xl lg:text-4xl font-bold w-16 md:w-24 outline-none placeholder-blue-300"
                    />
                    <input
                      value={overlayStat.label}
                      onChange={e => {
                        setOverlayStat({ ...overlayStat, label: e.target.value });
                        setDirty(true);
                      }}
                      placeholder="Years of Impact"
                      className="bg-transparent text-xs md:text-sm outline-none w-full placeholder-blue-300 mt-1"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="h-48 md:h-80 flex flex-col items-center justify-center text-gray-400 text-sm">
                <ImageIcon size={48} className="mb-3 text-gray-300" />
                <p>No image selected</p>
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
            placeholder="Image description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />

          {/* IMAGE ACTIONS - Mobile responsive */}
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="cursor-pointer flex-1">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleMainImageUpload(file);
                }}
                disabled={uploadingImages.has('main-image')}
              />
              <div className={`w-full px-4 py-3 rounded-lg text-white text-sm transition flex items-center justify-center gap-2 ${
                uploadingImages.has('main-image') 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                {uploadingImages.has('main-image') ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    {mainImage ? 'Replace Image' : 'Upload Image'}
                  </>
                )}
              </div>
            </label>

            {mainImage && !uploadingImages.has('main-image') && (
              <button
                onClick={() => {
                  setMainImage(null);
                  setDirty(true);
                }}
                className="px-4 py-3 rounded-lg border border-gray-300 text-sm text-red-600 hover:bg-red-50 hover:border-red-300 transition flex-1 sm:flex-none"
              >
                Remove Image
              </button>
            )}
          </div>
        </div>

        {/* ================= FLEXIBLE CONTENT BLOCKS (ORDER PRESERVED) ================= */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="font-medium text-lg text-gray-900">Content Blocks</h3>
          
          {aboutBlocks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 bg-gray-50">
              <ImageIcon size={32} className="mx-auto mb-3 text-gray-400" />
              <p>No content blocks yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first block below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aboutBlocks.map((block, index) => (
                <div key={block.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3 relative">
                  <div className="absolute top-3 left-3 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                    {index + 1}
                  </div>
                  
                  <button
                    onClick={() => removeAboutBlock(block.id)}
                    className="absolute z-50 p-2 rounded-bl-xl bg-blue-600 top-3 right-3 text-white hover:text-red-500"
                    disabled={uploadingImages.has(`block-${block.id}`)}
                    aria-label="Remove block"
                  >
                    <Trash2 size={16} />
                  </button>

                  {block.type === 'image' && (
                    <>
                      <div className="rounded-lg overflow-hidden border border-gray-300 bg-white relative">
                        {block.value ? (
                          <>
                            <div className="w-full aspect-video flex items-center justify-center bg-gray-100">
                              <img
                                src={block.value}
                                alt={block.description}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            {block.value.startsWith('blob:') && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                  <p className="text-sm font-medium">Uploading...</p>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm">
                            <ImageIcon size={32} className="mb-2 text-gray-300" />
                            <p>No image selected</p>
                          </div>
                        )}
                      </div>
                      
                      <input
                        value={block.description || ''}
                        onChange={e => updateAboutBlock(block.id, { description: e.target.value })}
                        placeholder="Image description"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        disabled={uploadingImages.has(`block-${block.id}`)}
                      />
                      
                      <div className="flex gap-2">
                        <label className="cursor-pointer flex-1">
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              await handleBlockImageUpload(block.id, file);
                            }}
                            disabled={uploadingImages.has(`block-${block.id}`)}
                          />
                          <div className={`w-full px-4 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 ${
                            uploadingImages.has(`block-${block.id}`)
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}>
                            {uploadingImages.has(`block-${block.id}`) ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                Uploading...
                              </>
                            ) : (
                              'Replace Image'
                            )}
                          </div>
                        </label>
                      </div>
                    </>
                  )}

                  {block.type === 'subtitle' && (
                    <input
                      value={block.value}
                      onChange={e => updateAboutBlock(block.id, { value: e.target.value })}
                      placeholder="Subtitle"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base md:text-lg font-semibold text-gray-900 bg-white"
                    />
                  )}

                  {block.type === 'text' && (
                    <textarea
                      value={block.value}
                      onChange={e => updateAboutBlock(block.id, { value: e.target.value })}
                      rows={3}
                      placeholder="Text content"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white resize-y min-h-[100px]"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ADD BLOCK BUTTONS - Responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => addAboutBlock('image')}
              className="flex-1 text-center px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ImageIcon size={16} />
              <span>Add image</span>
            </button>
            <button
              onClick={() => addAboutBlock('subtitle')}
              className="flex-1 text-center px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span className="font-bold">T</span>
              <span>Add subtitle</span>
            </button>
            <button
              onClick={() => addAboutBlock('text')}
              className="flex-1 text-center px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span className="text-lg">¶</span>
              <span>Add text</span>
            </button>
          </div>
        </div>

        {/* HIGHLIGHT STATS */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-gray-900">Highlight Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {highlightStats.map(stat => (
              <div
                key={stat.id}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2"
              >
                <input
                  value={stat.number}
                  onChange={e => updateHighlightStat(stat.id, 'number', e.target.value)}
                  placeholder="Stat number"
                  className="w-full text-xl md:text-2xl font-bold border border-gray-300 rounded-lg px-3 py-2 bg-white"
                />
                <input
                  value={stat.label}
                  onChange={e => updateHighlightStat(stat.id, 'label', e.target.value)}
                  placeholder="Stat label"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE SAVE BAR */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 md:hidden">
          <button
            onClick={handleSave}
            disabled={uploadingImages.size > 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {uploadingImages.size > 0 ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading ({uploadingImages.size})...
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
        <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex justify-end">
            <button
              onClick={handleSave}
              disabled={uploadingImages.size > 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImages.size > 0 ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading ({uploadingImages.size})...
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

export default Sections;