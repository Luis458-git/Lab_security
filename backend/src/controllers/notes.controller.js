import notesService from '../services/notes.service.js';

export const getNotes = async (req, res, next) => {
  try {
    const data = await notesService.getUserNotes(req.user.id);
    res.status(200).json({
      status: 200,
      ...data
    });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const note = await notesService.getNoteById(
      req.user.id,
      req.params.id,
      req.ip,
      req.headers['user-agent']
    );
    res.status(200).json({
      status: 200,
      note
    });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await notesService.createNote(
      req.user.id,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    res.status(201).json({
      status: 201,
      message: 'Nota creada y cifrada con éxito',
      note
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await notesService.updateNote(
      req.user.id,
      req.params.id,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    res.status(200).json({
      status: 200,
      message: 'Nota actualizada y recifrada con éxito',
      note
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const result = await notesService.deleteNote(
      req.user.id,
      req.params.id,
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

export default {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
};
