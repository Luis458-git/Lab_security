import profileService from '../services/profile.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.status(200).json({
      status: 200,
      profile
    });
  } catch (error) {
    next(error);
  }
};

export const revealPhone = async (req, res, next) => {
  try {
    const data = await profileService.revealPhone(
      req.user.id,
      req.ip,
      req.headers['user-agent']
    );
    res.status(200).json({
      status: 200,
      ...data
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(
      req.user.id,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    res.status(200).json({
      status: 200,
      message: 'Perfil actualizado con éxito',
      profile
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  revealPhone,
  updateProfile
};
