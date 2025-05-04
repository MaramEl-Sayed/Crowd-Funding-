import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/accounts/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw error;

        const response = await axios.post(`${api.defaults.baseURL}token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh || refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/register/', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/login/', credentials);
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      window.dispatchEvent(new Event('storage'));
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  activate: async (uidb64, token) => {
    try {
      const response = await api.get(`/activate/${uidb64}/${token}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Activation failed' };
    }
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('storage')); // Added storage event
  },

  getProtectedData: async () => {
    try {
      const response = await api.get('/protected-endpoint/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch protected data' };
    }
  },

  facebookLogin: async (data) => {
    try {
      const response = await api.post('/login/facebook/', data);
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Facebook login failed' };
    }
  },

  googleLogin: async (data) => {
    try {
      const response = await api.post('/login/google/', data);
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      window.dispatchEvent(new Event('storage'));
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Google login failed' };
    }
  },

  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await api.post('/token/refresh/', { refresh: refreshToken });
      localStorage.setItem('accessToken', response.data.access);
      return response.data.access;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to refresh access token' };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/password/reset/request/', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to request password reset' };
    }
  },

  confirmPasswordReset: async (uid, token, new_password) => {
    try {
      const response = await api.post('/password/reset/confirm/', {
        uid,
        token,
        new_password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reset password' };
    }
  },
};

export const handleSessionExpired = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

export default api;