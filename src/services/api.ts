import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, phone?: string) => {
    const response = await api.post('/auth/register', { name, email, password, phone });
    return response.data;
  },
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const userService = {
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  addVehicle: async (vehicleNumber: string) => {
    const response = await api.post('/users/vehicle', { vehicleNumber });
    return response.data;
  },
  removeVehicle: async (vehicleNumber: string) => {
    const response = await api.delete(`/users/vehicle/${vehicleNumber}`);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const parkingService = {
  getAllSlots: async (params?: any) => {
    const response = await api.get('/parking', { params });
    return response.data;
  },
  getSlotsByFloor: async (floor: number, params?: any) => {
    const response = await api.get(`/parking/floor/${floor}`, { params });
    return response.data;
  },
  getSlotById: async (id: string) => {
    const response = await api.get(`/parking/${id}`);
    return response.data;
  },
  createSlot: async (slotData: any) => {
    const response = await api.post('/parking', slotData);
    return response.data;
  },
  updateSlot: async (id: string, slotData: any) => {
    const response = await api.put(`/parking/${id}`, slotData);
    return response.data;
  },
  deleteSlot: async (id: string) => {
    const response = await api.delete(`/parking/${id}`);
    return response.data;
  }
};

export const bookingService = {
  createBooking: async (bookingData: any) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getUserBookings: async (params?: any) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },
  getAllBookings: async (params?: any) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },
  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  completeBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/complete`);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  }
};

export default api;