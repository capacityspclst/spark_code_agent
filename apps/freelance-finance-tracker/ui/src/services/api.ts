import axios, { AxiosInstance } from 'axios';

// Determine API base URL. Prefer env var, else fallback to UI backend config.
const apiBase = import.meta.env.VITE_API_URL || '';

const instance: AxiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// Add Authorization header from localStorage if present
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  get: instance.get.bind(instance),
  post: instance.post.bind(instance),
  put: instance.put.bind(instance),
  delete: instance.delete.bind(instance),
};
