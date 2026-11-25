import client from '../api/client.js';

export const adminService = {
  getUsers: () => client.get('/admin/users'),
  changeRole: (userId, role) => client.patch(`/admin/users/${userId}/role`, { role }),
  getLogs: (limit = 100) => client.get(`/admin/logs?limit=${limit}`)
};

export default adminService;
