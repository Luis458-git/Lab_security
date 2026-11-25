import client from '../api/client.js';

export const adminService = {
  getUsers: () => client.get('/admin/users'),
  updateUserRole: (userId, role) => client.patch(`/admin/users/${userId}/role`, { role }),
  getSecurityLogs: (limit = 100) => client.get(`/admin/logs?limit=${limit}`)
};

export default adminService;
