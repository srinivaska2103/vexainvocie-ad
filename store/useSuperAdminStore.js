import { create } from 'zustand';

export const useSuperAdminStore = create((set, get) => ({
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('vexa_super_admin_token');
        const adminStr = localStorage.getItem('vexa_super_admin_user');
        if (token && adminStr) {
          const admin = JSON.parse(adminStr);
          if (admin.role === 'SUPER_ADMIN') {
            set({
              admin,
              token,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        }
      } catch (err) {
        console.error('Failed to restore super admin session', err);
      }
    }
    set({ admin: null, token: null, isAuthenticated: false, isLoading: false });
  },

  login: (admin, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vexa_super_admin_token', token);
      localStorage.setItem('vexa_super_admin_user', JSON.stringify(admin));
    }
    set({
      admin,
      token,
      isAuthenticated: true,
      isLoading: false
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vexa_super_admin_token');
      localStorage.removeItem('vexa_super_admin_user');
      window.location.href = '/admin/login';
    }
    set({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
}));
