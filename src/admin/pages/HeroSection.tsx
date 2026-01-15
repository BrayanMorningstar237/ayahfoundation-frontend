import React, { useEffect, useState } from 'react';
import { Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { HeroAPI } from '../services/hero.api';
import Toast from '../components/Toast';

interface WallImage {
  url: string;
  publicId: string;
}

const HeroSection = () => {
  const [heroData, setHeroData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
  HeroAPI.getHero()
    .then(data => {
      console.log('Hero data:', data);
      setHeroData(data);
    })
    .catch(err => {
      console.error('Failed to load hero:', err);
    });
}, []);


  const handleSave = async () => {
    try {
      setSaving(true);
      await HeroAPI.updateHero(heroData);

      setToast({
        message: 'Hero section updated successfully',
        type: 'success'
      });

      setDirty(false);
    } catch {
      setToast({
        message: 'Failed to save changes',
        type: 'error'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  try {
    setUploading(true);
    const files = Array.from(e.target.files);

    const updatedHero = await HeroAPI.uploadImages(files);

    setHeroData(updatedHero); // ✅ FIX
    setDirty(true);
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    setToast({
      message: 'Image upload failed',
      type: 'error'
    });
    setTimeout(() => setToast(null), 3000);
  } finally {
    setUploading(false);
    e.target.value = '';
  }
};


  const handleDeleteImage = async (publicId: string) => {
    if (!confirm('Remove this image?')) return;

    await HeroAPI.deleteImage(publicId);

    setHeroData({
      ...heroData,
      wallImages: heroData.wallImages.filter(
        (img: WallImage) => img.publicId !== publicId
      )
    });

    setDirty(true);
  };

  if (!heroData) {
    return <p className="p-4">Loading Wall Frame Settings…</p>;
  }

  return (
    <div className="space-y-8 px-4">

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Hero Section
        </h1>
        <p className="text-gray-600 text-sm">
          First impression visitors see on your website
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* TEXT SETTINGS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6 space-y-5">
          {[
            ['tagline', 'Tagline'],
            ['titleLine1', 'Title line 1'],
            ['titleLine2', 'Title line 2'],
            ['donateButtonText', 'Donate button'],
            ['watchButtonText', 'Watch button']
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <input
                value={heroData[key] || ''}
                onChange={e => {
                  setHeroData({ ...heroData, [key]: e.target.value });
                  setDirty(true);
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={heroData.description || ''}
              onChange={e => {
                setHeroData({ ...heroData, description: e.target.value });
                setDirty(true);
              }}
              rows={4}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!heroData.enabled}
              onChange={e => {
                setHeroData({ ...heroData, enabled: e.target.checked });
                setDirty(true);
              }}
            />
            Enable hero section
          </label>
        </div>

        {/* IMAGES */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ImageIcon size={18} /> Wall Images
            </h2>

            <label className="cursor-pointer flex items-center gap-2 text-sm text-blue-600">
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Add images'}
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>

          {heroData.wallImages?.length === 0 && (
            <p className="text-sm text-gray-500">
              No images uploaded yet
            </p>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {heroData.wallImages?.map((img: WallImage) => (
              <div
                key={img.publicId}
                className="group relative aspect-square rounded-xl overflow-hidden border"
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />

                <button
                  onClick={() => handleDeleteImage(img.publicId)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/60 text-white p-1 rounded-full"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dirty && (
        <div className="mt-12 border-t bg-white/80 backdrop-blur rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-600">
            You have unsaved changes
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
