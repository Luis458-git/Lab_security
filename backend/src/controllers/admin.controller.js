import adminService from '../services/admin.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({
      status: 200,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const result = await adminService.changeUserRole(
      req.user.id,
      req.params.userId,
      req.body.role,
      req.ip,
      req.headers['user-agent']
    );
    res.status(200).json({
      status: 200,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getSecurityLogs = async (req, res, next) => {
  try {
    const logs = await adminService.getSecurityLogs(req.query.limit);
    res.status(200).json({
      status: 200,
      logs
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  changeRole,
  getSecurityLogs
};
