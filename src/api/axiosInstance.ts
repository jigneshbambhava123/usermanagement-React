import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5086/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.error("Unauthorized");
      localStorage.removeItem('jwt_token');
    }
    return Promise.reject(err);
  }
);

export default api;