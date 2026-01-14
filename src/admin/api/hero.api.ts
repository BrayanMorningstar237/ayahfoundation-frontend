import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${BASE_URL}/api/dashboard/hero`
});

// ✅ Attach admin token to EVERY request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const HeroAPI = {
  getHero() {
    return API.get('/');
  },

  updateHero(data: any) {
    return API.put('/', data);
  },

  uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    return API.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteImage(publicId: string) {
    return API.delete('/images', {
      data: { publicId }
    });
  }
};
