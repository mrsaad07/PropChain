import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to home
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  getMe: () => api.get('/auth/me'),
  addWallet: (walletData) => api.post('/auth/add-wallet', walletData),
  setActiveWallet: (address) => api.put('/auth/set-active-wallet', { address }),
  updateWalletAlias: (address, alias) => api.put('/auth/wallet-alias', { address, alias }),
  deleteWallet: (address) => api.delete(`/auth/wallet/${address}`),
};

export const propertyAPI = {
  getAll: (params) => api.get('/properties/search', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/my/all'),
  getMyRentals: () => api.get('/properties/my/rentals'), // New
  create: (data) => api.post('/properties/register', data),
  transferOwnership: (id, data) => api.put(`/properties/${id}/transfer`, data), // New
};

export const depositAPI = {
  submit: (data) => api.post('/deposits/submit', data),
  getQueue: (propertyId) => api.get(`/deposits/queue/${propertyId}`),
  getMyDeposits: () => api.get('/deposits/my'),
  getReceivedDeposits: () => api.get('/deposits/received'),
  updateStatus: (id, status, txHash) => api.put(`/deposits/${id}/status`, { status, txHash }),
};

export const extrasAPI = {
  getLogs: () => api.get('/extras/logs'),
  createLog: (data) => api.post('/extras/logs', data),
  getMessages: (contact) => api.get('/extras/messages', { params: { contact } }),
  sendMessage: (data) => api.post('/extras/messages', data),
  respondToOffer: (data) => api.put('/extras/messages/offer', data),
  getNotifications: () => api.get('/extras/notifications'),
  saveContract: (data) => api.post('/extras/contracts', data),
  getMyContracts: () => api.get('/extras/contracts'),
  updateContractStatus: (data) => api.put('/extras/contracts/status', data),
  createTicket: (data) => api.post('/extras/tickets', data),
  getMyTickets: () => api.get('/extras/tickets'),
  createReview: (data) => api.post('/extras/reviews', data),
  getReviews: (propertyId) => api.get(`/extras/reviews/${propertyId}`),
};

export const paymentAPI = {
  payMaintenance: (data) => api.post('/maintenance/pay', data),
  payRent: (data) => api.post('/rent/pay', data),
  getTenantHistory: (wallet, params) => api.get(`/rent/tenant-history/${wallet}`, { params }),
  getMaintenanceHistory: (wallet, params) => api.get(`/maintenance/tenant-history/${wallet}`, { params }),
  getBuildingReport: (buildingId, month) => api.get(`/maintenance/building-report/${buildingId}/${month}`),
};

export default api;
