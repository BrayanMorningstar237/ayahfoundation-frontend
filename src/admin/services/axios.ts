import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://ayahfoundation-backend.onrender.com/api',
  withCredentials: false // IMPORTANT: no cookies
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized – invalid or missing token');
      // optional hard logout
      // localStorage.removeItem('admin_token');
      // window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
