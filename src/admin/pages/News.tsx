import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  Star,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  Replace
} from 'lucide-react';

/* ================= TYPES ================= */
type BlockType = 'subtitle' | 'text' | 'image' | 'video';

interface ContentBlock {
  id: string;
  type: BlockType;
  value: string;
}

interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  featured: boolean;
  status: 'draft' | 'published';
  heroImage: string;
  gallery: string[];
  blocks: ContentBlock[];
}

interface NewsContent {
  header: {
    label: string;
    title: string;
    description: string;
  };
  news: NewsItem[];
}

/* ================= IMAGE UPLOAD ================= */
const uploadImage = async (file: File, folder: string = 'sections/news') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await fetch('https://ayahfoundation-backend.onrender.com//api/dashboard/upload/single', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    },
    body: formData
  });

  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

/* ================= COMPONENT ================= */
const News = () => {
  const [content, setContent] = useState<NewsContent>({
    header: {
      label: '',
      title: '',
      description: ''
    },
    news: []
  });

  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  /* ================= FETCH WITH MIGRATION ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://ayahfoundation-backend.onrender.com//api/sections/news');
        const data = await res.json();

        const news = (data.content?.news || []).map((n: any) => ({
          ...n,
          blocks: n.blocks 
            ? n.blocks 
            : n.body 
              ? [{ id: crypto.randomUUID(), type: 'text', value: n.body }] 
              : []
        }));

        setContent({
          header: data.content?.header || {
            label: '',
            title: '',
            description: ''
          },
          news
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= HELPERS ================= */
  const updateNews = (id: string, updates: Partial<NewsItem>) => {
    setContent(prev => ({
      ...prev,
      news: prev.news.map(n => (n.id === id ? { ...n, ...updates } : n))
    }));
    setDirty(true);
  };

  const addNews = () => {
    const newNews: NewsItem = {
      id: crypto.randomUUID(),
      title: '',
      subtitle: '',
      excerpt: '',
      heroImage: '',
      gallery: [],
      date: new Date().toISOString().slice(0, 10),
      featured: false,
      status: 'draft',
      blocks: []
    };
    
    setContent(prev => ({
      ...prev,
      news: [newNews, ...prev.news]
    }));
    setExpandedNews(newNews.id);
    setDirty(true);
  };

  const removeNews = (id: string) => {
    setContent(prev => ({
      ...prev,
      news: prev.news.filter(n => n.id !== id)
    }));
    if (expandedNews === id) setExpandedNews(null);
    setDirty(true);
  };

  /* ================= BLOCK HELPERS ================= */
  const addBlock = (newsId: string, type: BlockType) => {
    setContent(prev => ({
      ...prev,
      news: prev.news.map(n =>
        n.id === newsId
          ? {
              ...n,
              blocks: [
                ...n.blocks,
                { id: crypto.randomUUID(), type, value: '' }
              ]
            }
          : n
      )
    }));
    setDirty(true);
  };

  const updateBlock = (newsId: string, blockId: string, value: string) => {
    setContent(prev => ({
      ...prev,
      news: prev.news.map(n =>
        n.id === newsId
          ? {
              ...n,
              blocks: n.blocks.map(b =>
                b.id === blockId ? { ...b, value } : b
              )
            }
          : n
      )
    }));
    setDirty(true);
  };

  const removeBlock = (newsId: string, blockId: string) => {
    setContent(prev => ({
      ...prev,
      news: prev.news.map(n =>
        n.id === newsId
          ? { ...n, blocks: n.blocks.filter(b => b.id !== blockId) }
          : n
      )
    }));
    setDirty(true);
  };

  /* ================= NEW: REORDER BLOCKS ================= */
  const moveBlock = (newsId: string, blockId: string, direction: 'up' | 'down') => {
    setContent(prev => {
      const updatedNews = prev.news.map(news => {
        if (news.id !== newsId) return news;

        const blockIndex = news.blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return news;

        const newBlocks = [...news.blocks];
        
        if (direction === 'up' && blockIndex > 0) {
          // Move block up
          [newBlocks[blockIndex], newBlocks[blockIndex - 1]] = 
          [newBlocks[blockIndex - 1], newBlocks[blockIndex]];
        } 
        else if (direction === 'down' && blockIndex < newBlocks.length - 1) {
          // Move block down
          [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = 
          [newBlocks[blockIndex + 1], newBlocks[blockIndex]];
        }
        
        return { ...news, blocks: newBlocks };
      });
      
      return { ...prev, news: updatedNews };
    });
    setDirty(true);
  };

  const uploadAndSet = async (
    key: string,
    file: File,
    cb: (url: string) => void,
    folder: string = 'sections/news'
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
      
      setTimeout(() => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }, 1000);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    const hasBlobUrls = content.news.some(item =>
      item.heroImage?.startsWith('blob:') ||
      item.gallery.some(img => img?.startsWith?.('blob:')) ||
      item.blocks.some(block => 
        block.type === 'image' && 
        block.value?.startsWith?.('blob:')
      )
    );

    if (hasBlobUrls) {
      alert('Please wait for all images to finish uploading before saving.');
      return;
    }

    if (uploading.size > 0) {
      alert('Please wait for all uploads to finish.');
      return;
    }

    try {
      const response = await fetch('https://ayahfoundation-backend.onrender.com//api/sections/news', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ content })
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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-8 md:space-y-12 pb-24 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto">
      {/* HEADER WITH CONTROLS */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">News & Updates</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Manage news articles. Featured articles appear larger on the main page.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
          
          {dirty && (
            <button
              onClick={handleSave}
              disabled={uploading.size > 0}
              className="px-4 md:px-6 py-2 rounded-lg md:rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2"
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
      </div>

      {/* SECTION HEADER EDITOR */}
      <section className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
        <input
          value={content.header.label}
          onChange={e => {
            setContent({
              ...content,
              header: { ...content.header, label: e.target.value }
            });
            setDirty(true);
          }}
          placeholder="News & Updates"
          className="w-full text-center text-sm font-semibold text-yellow-600 tracking-widest uppercase mb-4 border-b-2 border-transparent focus:border-yellow-600 focus:outline-none py-2 bg-transparent"
        />

        <input
          value={content.header.title}
          onChange={e => {
            setContent({
              ...content,
              header: { ...content.header, title: e.target.value }
            });
            setDirty(true);
          }}
          placeholder="Latest From the Field"
          className="w-full text-center text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 border-b-2 border-transparent focus:border-gray-900 focus:outline-none py-2 bg-transparent"
        />

        <textarea
          value={content.header.description}
          onChange={e => {
            setContent({
              ...content,
              header: { ...content.header, description: e.target.value }
            });
            setDirty(true);
          }}
          placeholder="Real-time updates from our ongoing projects and community impact initiatives."
          rows={2}
          className="w-full text-center text-gray-600 mt-4 max-w-2xl mx-auto border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-y"
        />
      </section>

      {/* ADD NEW NEWS BUTTON */}
      <div className="text-center">
        <button
          onClick={addNews}
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-semibold rounded-full hover:bg-yellow-700 transition-colors"
        >
          <Plus size={20} />
          Add New Article
        </button>
      </div>

      {/* NEWS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* FEATURED NEWS SECTION (Left 2/3) */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.news.filter(item => item.featured).map(item => (
              <NewsCard
                key={item.id}
                item={item}
                featured={true}
                expanded={expandedNews === item.id}
                onToggleExpand={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                onUpdate={updateNews}
                onRemove={removeNews}
                onUpload={uploadAndSet}
                uploading={uploading}
                previewMode={previewMode}
                addBlock={addBlock}
                updateBlock={updateBlock}
                removeBlock={removeBlock}
                moveBlock={moveBlock}
              />
            ))}
          </div>
          
          {/* REGULAR NEWS SECTION */}
          <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">All Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {content.news.filter(item => !item.featured).map(item => (
              <NewsCard
                key={item.id}
                item={item}
                featured={false}
                expanded={expandedNews === item.id}
                onToggleExpand={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                onUpdate={updateNews}
                onRemove={removeNews}
                onUpload={uploadAndSet}
                uploading={uploading}
                previewMode={previewMode}
                addBlock={addBlock}
                updateBlock={updateBlock}
                removeBlock={removeBlock}
                moveBlock={moveBlock}
              />
            ))}
          </div>
        </div>

        {/* SIDEBAR - STATS & QUICK ACTIONS */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">News Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Articles</span>
                <span className="font-bold text-gray-900">{content.news.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Published</span>
                <span className="font-bold text-green-600">
                  {content.news.filter(n => n.status === 'published').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Featured</span>
                <span className="font-bold text-yellow-600">
                  {content.news.filter(n => n.featured).length}
                </span>
              </div>
            </div>
          </div>

          {/* QUICK FILTERS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  addNews();
                  const newId = content.news[0]?.id;
                  if (newId) updateNews(newId, { featured: true });
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-50 text-yellow-700 border border-yellow-200"
              >
                + Add Featured Article
              </button>
              <button
                onClick={() => {
                  addNews();
                  const newId = content.news[0]?.id;
                  if (newId) updateNews(newId, { status: 'published' });
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-green-700 border border-green-200"
              >
                + Add & Publish Now
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

/* ================= NEWS CARD COMPONENT ================= */
interface NewsCardProps {
  item: NewsItem;
  featured: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, updates: Partial<NewsItem>) => void;
  onRemove: (id: string) => void;
  onUpload: (key: string, file: File, cb: (url: string) => void, folder?: string) => Promise<void>;
  uploading: Set<string>;
  previewMode: boolean;
  addBlock: (newsId: string, type: BlockType) => void;
  updateBlock: (newsId: string, blockId: string, value: string) => void;
  removeBlock: (newsId: string, blockId: string) => void;
  moveBlock: (newsId: string, blockId: string, direction: 'up' | 'down') => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  item,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onUpload,
  uploading,
  previewMode,
  addBlock,
  updateBlock,
  removeBlock,
  moveBlock
}) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      expanded ? 'ring-2 ring-blue-500' : ''
    }`}>
      
      {/* CARD HEADER */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <div className="flex items-center gap-2">
          {previewMode ? (
            <span className="text-xs uppercase tracking-widest text-yellow-400 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
              {item.date}
            </span>
          ) : (
            <input
              type="date"
              value={item.date}
              onChange={e => onUpdate(item.id, { date: e.target.value })}
              className="text-xs uppercase tracking-widest text-white bg-black/70 backdrop-blur-sm px-2 py-1 rounded border-none focus:ring-0 focus:bg-black/80"
            />
          )}
          
          {item.featured && (
            <span className="text-xs uppercase bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
              <Star size={10} />
              Featured
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onToggleExpand}
            className="bg-black/70 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-black/90"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {!previewMode && (
            <button
              onClick={() => onRemove(item.id)}
              className="bg-black/70 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-red-600"
              aria-label="Remove article"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* HERO IMAGE */}
      <div className="relative h-48 overflow-hidden group">
        {item.heroImage ? (
          <div className="relative w-full h-full">
            <img
              src={item.heroImage}
              alt={item.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            {item.heroImage.startsWith('blob:') && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-100">
            <ImageIcon size={32} className="mb-2 text-gray-300" />
            <p>No image selected</p>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* IMAGE UPLOAD BUTTON */}
        {!previewMode && (
          <div className="absolute bottom-2 right-2">
            <label className="cursor-pointer">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await onUpload(
                    `${item.id}-hero`,
                    file,
                    (url) => onUpdate(item.id, { heroImage: url })
                  );
                }}
                disabled={uploading.has(`${item.id}-hero`)}
              />
              <div className={`bg-black/70 text-white px-3 py-1 text-xs rounded flex items-center gap-1 ${
                uploading.has(`${item.id}-hero`) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-black/90'
              }`}>
                {uploading.has(`${item.id}-hero`) ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <Upload size={12} />
                )}
                {item.heroImage ? 'Replace' : 'Upload'}
              </div>
            </label>
          </div>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="p-4 bg-white">
        {previewMode ? (
          <>
            <h3 className={`text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-1`}>
              {item.title || 'Untitled Article'}
            </h3>
            {item.subtitle && (
              <p className="text-sm text-gray-600 line-clamp-2">{item.subtitle}</p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {item.date} • {item.status === 'published' ? 'Published' : 'Draft'}
            </div>
          </>
        ) : (
          <>
            <input
              value={item.title}
              onChange={e => onUpdate(item.id, { title: e.target.value })}
              placeholder="News title"
              className="w-full bg-transparent border-none focus:outline-none font-bold text-gray-900 text-lg leading-tight placeholder-gray-500 mb-1"
            />
            <input
              value={item.subtitle}
              onChange={e => onUpdate(item.id, { subtitle: e.target.value })}
              placeholder="Subtitle (optional)"
              className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-600 placeholder-gray-400"
            />
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <span>{item.date}</span>
              <span className="px-2 py-0.5 rounded bg-gray-100">
                {item.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* EXPANDED CONTENT EDITOR */}
      {expanded && !previewMode && (
        <div className="border-t border-gray-200 p-4 md:p-6 space-y-6 bg-white text-gray-900 max-h-[500px] overflow-y-auto">
          {/* STATUS CONTROLS */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onUpdate(item.id, { featured: !item.featured })}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                item.featured
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              <Star size={14} className={item.featured ? 'text-yellow-600' : 'text-gray-500'} />
              {item.featured ? 'Featured' : 'Mark as Featured'}
            </button>

            <select
              value={item.status}
              onChange={e => onUpdate(item.id, { status: e.target.value as 'draft' | 'published' })}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* EXCERPT */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Short Excerpt</label>
            <textarea
              value={item.excerpt}
              onChange={e => onUpdate(item.id, { excerpt: e.target.value })}
              placeholder="Brief summary for cards and listings"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-y text-gray-900"
            />
          </div>

          {/* CONTENT BLOCKS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Article Content</h4>
              <div className="overflow-x-auto">
                <div className="flex gap-2 whitespace-nowrap pb-2">
                  <button
                    onClick={() => addBlock(item.id, 'subtitle')}
                    className="shrink-0 px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus size={14} /> Subtitle
                  </button>
                  <button
                    onClick={() => addBlock(item.id, 'text')}
                    className="shrink-0 px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus size={14} /> Text
                  </button>
                  <button
                    onClick={() => addBlock(item.id, 'image')}
                    className="shrink-0 px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus size={14} /> Image
                  </button>
                  <button
                    onClick={() => addBlock(item.id, 'video')}
                    className="shrink-0 px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus size={14} /> Video
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {item.blocks.map((block, index) => (
                <div key={block.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3 relative">
                  {/* BLOCK CONTROLS */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                      {block.type}
                    </span>
                    
                    {/* REORDER BUTTONS */}
                    {item.blocks.length > 1 && (
                      <div className="flex bg-white border rounded-md overflow-hidden">
                        <button
                          onClick={() => moveBlock(item.id, block.id, 'up')}
                          disabled={index === 0}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move up"
                        >
                          <MoveUp size={12} />
                        </button>
                        <div className="w-px bg-gray-300" />
                        <button
                          onClick={() => moveBlock(item.id, block.id, 'down')}
                          disabled={index === item.blocks.length - 1}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move down"
                        >
                          <MoveDown size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {(block.type === 'image' || block.type === 'video') && block.value && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          hidden
                          accept={block.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const folder = block.type === 'image' 
                              ? 'sections/news/blocks' 
                              : 'sections/news/videos';
                            await onUpload(
                              block.id,
                              file,
                              (url) => updateBlock(item.id, block.id, url),
                              folder
                            );
                          }}
                          disabled={uploading.has(block.id)}
                        />
                        <div className={`bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 ${
                          uploading.has(block.id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`} title="Replace">
                          <Replace size={12} />
                        </div>
                      </label>
                    )}
                    
                    <button
                      onClick={() => removeBlock(item.id, block.id)}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      aria-label="Remove block"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* BLOCK CONTENT */}
                  {block.type === 'subtitle' && (
                    <input
                      value={block.value}
                      onChange={e => updateBlock(item.id, block.id, e.target.value)}
                      placeholder="Subtitle"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold text-gray-900 bg-white mt-8"
                    />
                  )}

                  {block.type === 'text' && (
                    <textarea
                      value={block.value}
                      onChange={e => updateBlock(item.id, block.id, e.target.value)}
                      placeholder="Text content"
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white mt-8 resize-y text-gray-900"
                    />
                  )}

                  {block.type === 'image' && (
                    <div className="space-y-2 mt-8">
                      {block.value ? (
                        <div className="relative">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={block.value}
                              alt="Content"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {block.value.startsWith('blob:') && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="animate-spin text-white" size={24} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              await onUpload(
                                block.id,
                                file,
                                (url) => updateBlock(item.id, block.id, url),
                                'sections/news/blocks'
                              );
                            }}
                            disabled={uploading.has(block.id)}
                          />
                          <div className={`aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition ${
                            uploading.has(block.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}>
                            {uploading.has(block.id) ? (
                              <Loader2 className="animate-spin" size={24} />
                            ) : (
                              <>
                                <ImageIcon size={24} />
                                <span className="text-sm mt-2">Add Image</span>
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-2 mt-8">
                      {block.value ? (
                        <div className="relative">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              src={block.value}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {block.value.startsWith('blob:') && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="animate-spin text-white" size={24} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            hidden
                            accept="video/*"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              await onUpload(
                                block.id,
                                file,
                                (url) => updateBlock(item.id, block.id, url),
                                'sections/news/videos'
                              );
                            }}
                            disabled={uploading.has(block.id)}
                          />
                          <div className={`aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition ${
                            uploading.has(block.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}>
                            {uploading.has(block.id) ? (
                              <Loader2 className="animate-spin" size={24} />
                            ) : (
                              <>
                                <Upload size={24} />
                                <span className="text-sm mt-2">Upload Video</span>
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {item.blocks.length === 0 && (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <p>No content blocks added yet.</p>
                  <p className="text-sm mt-1">Use the buttons above to add content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;