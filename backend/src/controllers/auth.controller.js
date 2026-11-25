import authService from '../services/auth.service.js';
import env from '../config/env.js';

const COOKIE_NAME = 'sv_session';

const getCookieOptions = () => ({
  httpOnly: true, // Inmune a robo vía XSS (OWASP A03 / A07)
  secure: env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'strict', // Protección estricta contra CSRF
  signed: true, // Firma de integridad con COOKIE_SECRET
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
  path: '/'
});

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body, req.ip, req.headers['user-agent']);
    res.status(201).json({
      status: 201,
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.body, req.ip, req.headers['user-agent']);

    // Asignar cookie firmada HttpOnly
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      status: 200,
      message: 'Inicio de sesión exitoso',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    signed: true,
    path: '/'
  });

  res.status(200).json({
    status: 200,
    message: 'Sesión cerrada exitosamente'
  });
};

export const getSessionUser = async (req, res) => {
  res.status(200).json({
    status: 200,
    user: req.user
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email, req.ip, req.headers['user-agent']);
    res.status(200).json({
      status: 200,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPasswordWithToken(req.body, req.ip, req.headers['user-agent']);
    res.status(200).json({
      status: 200,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  getSessionUser,
  forgotPassword,
  resetPassword
};
