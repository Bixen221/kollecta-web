import axios from 'axios';

const API_URL = 'https://kollecta-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kollecta_token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Une erreur est survenue.';
    return Promise.reject(new Error(message));
  }
);

export default api;
