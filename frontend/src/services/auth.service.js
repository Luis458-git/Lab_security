import client from '../api/client.js';

export const authService = {
  register: (payload) => client.post('/auth/register', payload),
  login: (payload) => client.post('/auth/login', payload),
  logout: () => client.post('/auth/logout'),
  getMe: () => client.get('/auth/me'),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => client.post('/auth/reset-password', payload)
};

export default authService;
