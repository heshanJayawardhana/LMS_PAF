import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};

// Facilities API
export const facilitiesAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/facilities', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get facilities error:', error);
      throw error;
    }
  },

  downloadReport: async () => {
    try {
      const response = await api.get('/facilities/report', {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('Download facilities report error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/facilities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get facility error:', error);
      throw error;
    }
  },

  create: async (facilityData) => {
    try {
      const response = await api.post('/facilities', facilityData);
      return response.data;
    } catch (error) {
      console.error('Create facility error:', error);
      throw error;
    }
  },

  update: async (id, facilityData) => {
    try {
      const response = await api.put(`/facilities/${id}`, facilityData);
      return response.data;
    } catch (error) {
      console.error('Update facility error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/facilities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete facility error:', error);
      throw error;
    }
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/bookings', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get booking error:', error);
      throw error;
    }
  },

  create: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  },

  update: async (id, bookingData) => {
    try {
      const response = await api.put(`/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Update booking error:', error);
      throw error;
    }
  },

  approve: async (id) => {
    try {
      const response = await api.post(`/bookings/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve booking error:', error);
      throw error;
    }
  },

  reject: async (id, reason) => {
    try {
      const response = await api.post(`/bookings/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject booking error:', error);
      throw error;
    }
  },

  cancel: async (id) => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  },
};

// Tickets API
export const ticketsAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/tickets', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get tickets error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket error:', error);
      throw error;
    }
  },

  create: async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  },

  update: async (id, ticketData) => {
    try {
      const response = await api.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      console.error('Update ticket error:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.post(`/tickets/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update ticket status error:', error);
      throw error;
    }
  },

  assign: async (id, assignedTo) => {
    try {
      const response = await api.post(`/tickets/${id}/assign`, { assignedTo });
      return response.data;
    } catch (error) {
      console.error('Assign ticket error:', error);
      throw error;
    }
  },

  addComment: async (id, comment) => {
    try {
      const response = await api.post(`/tickets/${id}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  uploadAttachment: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/tickets/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload attachment error:', error);
      throw error;
    }
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/notifications', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.post(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  toggleStatus: async (id) => {
    try {
      const response = await api.post(`/admin/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  },
};

// Admin Dashboard API
export const adminAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Get admin stats error:', error);
      throw error;
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get('/admin/activity');
      return response.data;
    } catch (error) {
      console.error('Get recent activity error:', error);
      throw error;
    }
  },

  getTopFacilities: async () => {
    try {
      const response = await api.get('/admin/facilities/top');
      return response.data;
    } catch (error) {
      console.error('Get top facilities error:', error);
      throw error;
    }
  },

  getDepartmentStats: async () => {
    try {
      const response = await api.get('/admin/departments/stats');
      return response.data;
    } catch (error) {
      console.error('Get department stats error:', error);
      throw error;
    }
  },
};

// Export all APIs
export default api;
