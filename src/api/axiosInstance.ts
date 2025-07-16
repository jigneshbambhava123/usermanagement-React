import axios from 'axios';
import { getValidToken } from '../helpers/authHelpers';

const api = axios.create({
  baseURL: 'http://localhost:5086/api',
});

api.interceptors.request.use((config) => {
  const token = getValidToken();
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

      sessionStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_token');
    }
    return Promise.reject(err);
  }
);

export default api;