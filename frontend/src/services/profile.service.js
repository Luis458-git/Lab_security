import client from '../api/client.js';

export const profileService = {
  getProfile: () => client.get('/profile'),
  revealPhone: () => client.post('/profile/reveal-phone'),
  updatePhone: (phone) => client.put('/profile', { phone }),
  updateProfile: (data) => client.put('/profile', data)
};

export default profileService;
