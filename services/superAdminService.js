import axios from 'axios';
import { useSuperAdminStore } from '@/store/useSuperAdminStore';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname) {
      return `http://${hostname}:5000/api/super-admin`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/super-admin` 
    : 'http://localhost:5000/api/super-admin';
};

const superAdminClient = axios.create({
  baseURL: 'http://localhost:5000/api/super-admin',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

superAdminClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('vexa_super_admin_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

superAdminClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Error executing platform admin request';
    
    // Automatically redirect to /admin/login on 401 or 403
    if ((status === 401 || status === 403) && typeof window !== 'undefined') {
      const isLogin = window.location.pathname.startsWith('/admin/login') || window.location.pathname.startsWith('/login');
      if (!isLogin) {
        useSuperAdminStore.getState().logout();
      }
    }
    const customError = new Error(message);
    customError.status = status;
    customError.data = err.response?.data;
    return Promise.reject(customError);
  }
);

export const superAdminService = {
  sendOtp: (email, password = null) => superAdminClient.post('/send-otp', { email, password }),
  verifyOtp: (email, otp) => superAdminClient.post('/verify-otp', { email, otp }),
  login: (email, password) => superAdminClient.post('/login', { email, password }),
  getMe: () => superAdminClient.get('/me'),
  getDashboardMetrics: () => superAdminClient.get('/dashboard'),
  getCompanies: (params) => superAdminClient.get('/companies', { params }),
  getCompanyById: (id) => superAdminClient.get(`/companies/${id}`),
  toggleCompanyStatus: (id, isActive, reason) => superAdminClient.put(`/companies/${id}/status`, { is_active: isActive, reason }),
  getUsers: (params) => superAdminClient.get('/users', { params }),
  toggleUserStatus: (id, isActive, reason) => superAdminClient.put(`/users/${id}/status`, { is_active: isActive, reason }),
  getSubscriptions: (params) => superAdminClient.get('/subscriptions', { params }),
  getSubscriptionById: (id) => superAdminClient.get(`/subscriptions/${id}`),
  getPayments: (params) => superAdminClient.get('/payments', { params }),
  getAnalytics: (days) => superAdminClient.get('/analytics', { params: { days } }),
  getLogs: (params) => superAdminClient.get('/logs', { params }),
  getSettings: () => superAdminClient.get('/settings'),

  // Support Tickets Management
  getTickets: (params) => superAdminClient.get('/support/tickets', { params }),
  getTicketDetails: (id) => superAdminClient.get(`/support/tickets/${id}`),
  updateTicket: (id, data) => superAdminClient.put(`/support/tickets/${id}`, data),
  getAttachmentDownloadUrl: (attachmentId) => `${getApiBaseUrl()}/support/attachments/${attachmentId}/download`,

  // Sales Enquiries Management (Lifetime Plan Leads)
  getSalesEnquiries: (params) => superAdminClient.get('/sales/enquiries', { params }),
  getSalesEnquiryDetails: (id) => superAdminClient.get(`/sales/enquiries/${id}`),
  updateSalesEnquiry: (id, data) => superAdminClient.put(`/sales/enquiries/${id}`, data),
  createLifetimePaymentLink: (id) => superAdminClient.post(`/sales/enquiries/${id}/create-payment`),
  verifySalesEnquiryPayment: (id, data) => superAdminClient.post(`/sales/enquiries/${id}/verify-payment`, data)
};

export default superAdminService;
