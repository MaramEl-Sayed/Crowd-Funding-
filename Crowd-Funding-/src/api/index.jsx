import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle HTTP errors
      const { status, data } = error.response;
      
      if (status === 400 && data) {
        // Format validation errors
        if (typeof data === 'object') {
          const formattedErrors = Object.entries(data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`)
            .join('\n');
          error.message = formattedErrors || 'Invalid request data';
        } else {
          error.message = data;
        }
      } else if (status === 401) {
        error.message = data?.detail || 'Authentication failed';
      } else if (status === 403) {
        error.message = data?.detail || 'Permission denied';
      } else if (status === 404) {
        error.message = 'Resource not found';
      } else if (status >= 500) {
        error.message = 'Server error';
      }
    } else if (error.request) {
      error.message = 'No response from server';
    } else {
      error.message = error.message || 'Request failed';
    }
    
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/accounts/login/', credentials),
  register: (userData) => api.post('/accounts/register/', userData),
  logout: () => api.post('/accounts/logout/'),
  refreshToken: (refresh) => api.post('/accounts/token/refresh/', { refresh }),
  deleteAccount: () => api.delete('/accounts/delete/'),
};

// Projects API methods
export const projectsAPI = {
  getProjects: () => api.get('/projects/'),
  getProject: (id) => api.get(`/projects/${id}/`),
  createProject: (projectData) => api.post('/projects/', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}/`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
};

export default api;
