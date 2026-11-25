import client from '../api/client.js';

export const profileService = {
  getProfile: () => client.get('/profile'),
  revealPhone: () => client.post('/profile/reveal-phone'),
  updateProfile: (payload) => client.put('/profile', payload)
};

export default profileService;
