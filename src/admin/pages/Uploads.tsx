import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Trash2,
  FolderPlus,
  Copy
} from 'lucide-react';
import axios from 'axios';


interface UploadedFile {
  id: string;
  url: string;
  publicId: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: Date;
}

const Uploads: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState('sections');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('images', file);
    });
    formData.append('folder', selectedFolder);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        }
      });

      const newFiles = response.data.images.map((img: any, index: number) => ({
        id: Date.now() + index,
        url: img.url,
        publicId: img.publicId,
        name: `image_${Date.now()}_${index}`,
        size: 'Unknown',
        type: 'image',
        uploadedAt: new Date()
      }));

      setFiles(prev => [...newFiles, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleDelete = async (publicId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/upload/${publicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(prev => prev.filter(file => file.publicId !== publicId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const folders = [
    { name: 'sections', label: 'Sections', color: 'bg-blue-100 text-blue-800' },
    { name: 'news', label: 'News', color: 'bg-green-100 text-green-800' },
    { name: 'team', label: 'Team', color: 'bg-purple-100 text-purple-800' },
    { name: 'campaigns', label: 'Campaigns', color: 'bg-orange-100 text-orange-800' },
    { name: 'uploads', label: 'Uploads', color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-2">Upload and manage images</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8">
        <div
          {...getRootProps()}
          className={`text-center p-12 rounded-lg cursor-pointer transition-all ${
            isDragActive ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-gray-500 mb-4">or click to browse files</p>
          <p className="text-sm text-gray-400">Supports JPG, PNG, GIF, WEBP • Max 5MB per file</p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Folder Selection */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Select Folder</h3>
            <button
              onClick={() => setShowFolderModal(true)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FolderPlus size={16} className="mr-1" />
              New Folder
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {folders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => setSelectedFolder(folder.name)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedFolder === folder.name
                    ? `${folder.color} border-transparent`
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {folder.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            Recent Uploads ({files.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.id} className="group relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Copy URL"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(file.publicId)}
                        className="p-2 bg-white rounded-full hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Folder</h3>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    // Add folder logic here
                    setShowFolderModal(false);
                    setNewFolderName('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Uploads;