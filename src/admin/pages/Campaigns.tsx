import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Save, Loader2, Plus, Image as ImageIcon, Type, Film, Upload, ChevronDown, ChevronUp, X } from 'lucide-react';

/* ================= TYPES ================= */

type StoryBlock =
  | { id: string; type: 'image'; image: string }
  | { id: string; type: 'subtitle'; text: string }
  | { id: string; type: 'text'; text: string };

interface CampaignVideo {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  thumbnail: string;
  videoUrl: string;
}

interface SuccessStory {
  id: string;
  mainImage: string;
  title: string;
  description: string;
  badge: string;
  blocks: StoryBlock[];
}

interface CampaignContent {
  video: CampaignVideo;
  successStories: SuccessStory[];
}

/* ================= UPLOAD ================= */

const uploadFile = async (
  file: File,
  onProgress?: (p: number) => void
): Promise<{ url: string; publicId: string; resourceType: 'image' | 'video' }> => {
  const formData = new FormData();

  // ✅ MUST be "file" (matches multer.single('file'))
  formData.append('image', file);

  formData.append('folder', 'sections/campaigns');

  const res = await axios.post(
    'https://ayahfoundation-backend.onrender.com//api/dashboard/upload/single',
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      onUploadProgress: e => {
        if (!e.total || !onProgress) return;
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    }
  );

  return res.data;
};


/* ================= COMPONENT ================= */

export default function Campaigns() {
  const [content, setContent] = useState<CampaignContent>({
    video: {
      eyebrow: '',
      title: '',
      description: '',
      ctaText: '',
      thumbnail: '',
      videoUrl: ''
    },
    successStories: []
  });

  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://ayahfoundation-backend.onrender.com//api/sections/campaigns');
        const data = await res.json();
        if (data?.content) setContent(data.content);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= HELPERS ================= */

  const updateVideo = (key: keyof CampaignVideo, value: string) => {
    setContent(p => ({ ...p, video: { ...p.video, [key]: value } }));
    setDirty(true);
  };

  const addStory = () => {
    const newStory: SuccessStory = {
      id: crypto.randomUUID(),
      mainImage: '',
      title: '',
      description: '',
      badge: '',
      blocks: []
    };
    
    setContent(p => ({
      ...p,
      successStories: [newStory, ...p.successStories]
    }));
    setExpandedStory(newStory.id);
    setDirty(true);
  };

  const updateStory = (
    id: string,
    key: keyof SuccessStory,
    value: any
  ) => {
    setContent(p => ({
      ...p,
      successStories: p.successStories.map(s =>
        s.id === id ? { ...s, [key]: value } : s
      )
    }));
    setDirty(true);
  };

  const addBlock = (storyId: string, type: StoryBlock['type']) => {
    const block: StoryBlock =
      type === 'image'
        ? { id: crypto.randomUUID(), type, image: '' }
        : { id: crypto.randomUUID(), type, text: '' };

    setContent(p => ({
      ...p,
      successStories: p.successStories.map(s =>
        s.id === storyId
          ? { ...s, blocks: [...s.blocks, block] }
          : s
      )
    }));
    setDirty(true);
  };

  const updateBlock = (
    storyId: string,
    blockId: string,
    key: 'image' | 'text',
    value: string
  ) => {
    setContent(p => ({
      ...p,
      successStories: p.successStories.map(s =>
        s.id === storyId
          ? {
              ...s,
              blocks: s.blocks.map(b =>
                b.id === blockId ? { ...b, [key]: value } : b
              )
            }
          : s
      )
    }));
    setDirty(true);
  };

  const removeBlock = (storyId: string, blockId: string) => {
    setContent(p => ({
      ...p,
      successStories: p.successStories.map(s =>
        s.id === storyId
          ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) }
          : s
      )
    }));
    setDirty(true);
  };

  const removeStory = (id: string) => {
    setContent(p => ({
      ...p,
      successStories: p.successStories.filter(s => s.id !== id)
    }));
    setDirty(true);
  };

  /* ================= SAVE ================= */

  const save = async () => {
    const video = content.video;
    const sanitizedVideo: Partial<typeof video> = {
      eyebrow: video.eyebrow,
      title: video.title,
      description: video.description,
      ctaText: video.ctaText
    };

    if (video.thumbnail) sanitizedVideo.thumbnail = video.thumbnail;
    if (video.videoUrl) sanitizedVideo.videoUrl = video.videoUrl;

    const cleanedContent = {
      ...content,
      video: sanitizedVideo
    };

    try {
      await fetch('https://ayahfoundation-backend.onrender.com//api/sections/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ content: cleanedContent })
      });
      setDirty(false);
      alert('Campaigns saved successfully!');
    } catch (error) {
      alert('Failed to save campaigns');
      console.error(error);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white border-b sticky -top-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campaigns Editor</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Manage video and success stories</p>
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
        {/* ================= VIDEO SECTION ================= */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Film size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Campaign Video</h2>
                <p className="text-blue-100 text-sm sm:text-base">Main promotional video and details</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-100">Eyebrow Text</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:bg-white focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                    placeholder="e.g., Watch Our Story"
                    value={content.video.eyebrow}
                    onChange={e => updateVideo('eyebrow', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-100">Title</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:bg-white focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                    placeholder="Video title"
                    value={content.video.title}
                    onChange={e => updateVideo('title', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:bg-white focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-all resize-none"
                  placeholder="Video description..."
                  value={content.video.description}
                  onChange={e => updateVideo('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Call-to-Action Text</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:bg-white focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                  placeholder="e.g., Watch Now"
                  value={content.video.ctaText}
                  onChange={e => updateVideo('ctaText', e.target.value)}
                />
              </div>

              {/* Media Uploads */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Thumbnail Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-blue-100">Video Thumbnail</label>
                  <div className="relative group">
                    {content.video.thumbnail ? (
                      <>
                        <img
                          src={content.video.thumbnail}
                          className="w-full h-48 object-cover rounded-xl border-2 border-white/20"
                          alt="Thumbnail"
                        />
                        <button
                          onClick={() => updateVideo('thumbnail', '')}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-white/50 transition-colors bg-white/5">
                        <Upload className="mb-2" size={24} />
                        <span className="text-sm">Upload Thumbnail</span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const res = await uploadFile(file);
                            updateVideo('thumbnail', res.url);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-blue-100">Video File</label>
                  <div className="relative">
                    {content.video.videoUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden">
                          <video
  key={content.video.videoUrl}
  src={content.video.videoUrl ? `${content.video.videoUrl}#t=0.1` : undefined}
  className="w-full h-40 object-cover"
  controls
  preload="metadata"
/>

                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3">
                            <span className="text-white text-sm font-medium">Current Video</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="video/*"
                              hidden
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setVideoProgress(0);
                                const res = await uploadFile(file, setVideoProgress);
                                updateVideo('videoUrl', res.url);
                                setVideoProgress(null);
                              }}
                            />
                            <div className="bg-white/20 text-white text-center py-2 rounded-lg hover:bg-white/30 transition-colors cursor-pointer text-sm">
                              Replace
                            </div>
                          </label>
                          <button
                            onClick={() => updateVideo('videoUrl', '')}
                            className="flex-1 bg-red-500/20 text-red-200 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-white/50 transition-colors bg-white/5">
                        <Film className="mb-2" size={24} />
                        <span className="text-sm">Upload Video</span>
                        <span className="text-xs text-blue-200 mt-1">MP4, MOV, etc.</span>
                        <input
                          type="file"
                          accept="video/*"
                          hidden
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setVideoProgress(0);
                            const res = await uploadFile(file, setVideoProgress);
                            updateVideo('videoUrl', res.url);
                            setVideoProgress(null);
                          }}
                        />
                      </label>
                    )}

                    {videoProgress !== null && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Uploading...</span>
                          <span>{videoProgress}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full transition-all"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SUCCESS STORIES ================= */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Success Stories</h2>
              <p className="text-gray-600 text-sm sm:text-base">Showcase impact stories and testimonials</p>
            </div>
            <button
              onClick={addStory}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Story</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {content.successStories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Type className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Success Stories Yet</h3>
                <p className="text-gray-600 mb-6">Add your first success story to showcase your impact</p>
                <button
                  onClick={addStory}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Create First Story
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {content.successStories.map((story, index) => (
                <div
                  key={story.id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Story Header */}
                  <div 
                    className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm sm:text-base">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {story.title || `Success Story ${index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {story.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStory(story.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        {expandedStory === story.id ? (
                          <ChevronUp className="text-gray-400" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedStory === story.id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6 border-t">
                      {/* Main Image Upload */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Main Story Image</label>
                        {story.mainImage ? (
                          <div className="relative group">
                            <img
                              src={story.mainImage}
                              className="w-full h-48 sm:h-56 object-cover rounded-xl"
                              alt="Story"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <div className="flex items-center justify-center h-full">
                                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                  Replace Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={async e => {
                                      const f = e.target.files?.[0];
                                      if (!f) return;
                                      const r = await uploadFile(f);
                                      updateStory(story.id, 'mainImage', r.url);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="block">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                              <Upload className="mx-auto mb-3 text-gray-400" size={24} />
                              <p className="text-gray-600">Click to upload main story image</p>
                              <p className="text-sm text-gray-500 mt-1">Recommended: 1200x800px</p>
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={async e => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const r = await uploadFile(f);
                                  updateStory(story.id, 'mainImage', r.url);
                                }}
                              />
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Basic Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Title</label>
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Story title"
                            value={story.title}
                            onChange={e => updateStory(story.id, 'title', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Badge</label>
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="e.g., Featured, New, Success"
                            value={story.badge}
                            onChange={e => updateStory(story.id, 'badge', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Description</label>
                        <textarea
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                          rows={3}
                          placeholder="Story description..."
                          value={story.description}
                          onChange={e => updateStory(story.id, 'description', e.target.value)}
                        />
                      </div>

                      {/* Content Blocks */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-900">Content Blocks</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addBlock(story.id, 'image')}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <ImageIcon size={14} />
                              Image
                            </button>
                            <button
                              onClick={() => addBlock(story.id, 'subtitle')}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              <Type size={14} />
                              Subtitle
                            </button>
                            <button
                              onClick={() => addBlock(story.id, 'text')}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <Type size={14} />
                              Text
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {story.blocks.map((block) => (
                            <div key={block.id} className="group relative border rounded-lg p-4 hover:border-blue-300 transition-colors">
                              <button
                                onClick={() => removeBlock(story.id, block.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              >
                                <X size={14} />
                              </button>

                              <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  block.type === 'image' ? 'bg-blue-100 text-blue-700' :
                                  block.type === 'subtitle' ? 'bg-purple-100 text-purple-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                                </span>
                              </div>

                              {block.type === 'image' ? (
                                <div>
                                  {block.image ? (
                                    <div className="relative">
                                      <img
  src={block.image}
  className="w-full h-auto rounded-lg"
/>

                                      <label className="absolute bottom-3 right-3">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          hidden
                                          onChange={async e => {
                                            const f = e.target.files?.[0];
                                            if (!f) return;
                                            const r = await uploadFile(f);
                                            updateBlock(story.id, block.id, 'image', r.url);
                                          }}
                                        />
                                        <span className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black transition-colors cursor-pointer">
                                          Replace
                                        </span>
                                      </label>
                                    </div>
                                  ) : (
                                    <label className="block">
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                        <ImageIcon className="mx-auto mb-2 text-gray-400" size={20} />
                                        <p className="text-gray-600 text-sm">Upload image</p>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          hidden
                                          onChange={async e => {
                                            const f = e.target.files?.[0];
                                            if (!f) return;
                                            const r = await uploadFile(f);
                                            updateBlock(story.id, block.id, 'image', r.url);
                                          }}
                                        />
                                      </div>
                                    </label>
                                  )}
                                </div>
                              ) : (
                                <textarea
                                  rows={block.type === 'subtitle' ? 2 : 4}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                  placeholder={block.type === 'subtitle' ? 'Enter subtitle...' : 'Enter text content...'}
                                  value={block.text}
                                  onChange={e => updateBlock(story.id, block.id, 'text', e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Save Button */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg sm:hidden z-50">
          <div className="p-4">
            <button
              onClick={save}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Save size={18} />
              Save All Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}