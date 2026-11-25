import client from '../api/client.js';

export const notesService = {
  getNotes: () => client.get('/notes'),
  getNoteById: (id) => client.get(`/notes/${id}`),
  createNote: (noteData) => client.post('/notes', noteData),
  updateNote: (id, noteData) => client.put(`/notes/${id}`, noteData),
  deleteNote: (id) => client.delete(`/notes/${id}`)
};

export default notesService;
