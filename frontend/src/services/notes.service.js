import client from '../api/client.js';

export const notesService = {
  getNotes: () => client.get('/notes'),
  getNoteById: (id) => client.get(`/notes/${id}`),
  createNote: (payload) => client.post('/notes', payload),
  updateNote: (id, payload) => client.put(`/notes/${id}`, payload),
  deleteNote: (id) => client.delete(`/notes/${id}`)
};

export default notesService;
