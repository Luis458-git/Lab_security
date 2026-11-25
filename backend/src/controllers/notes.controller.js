import notesService from '../services/notes.service.js';

/**
 * Obtiene la dirección IP real del cliente considerando proxies inversos (Render / Cloudflare)
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

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
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown-Client';

    const note = await notesService.getNoteById(
      req.user.id,
      req.params.id,
      clientIp,
      userAgent
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
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown-Client';

    const note = await notesService.createNote(
      req.user.id,
      req.body,
      clientIp,
      userAgent
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
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown-Client';

    const note = await notesService.updateNote(
      req.user.id,
      req.params.id,
      req.body,
      clientIp,
      userAgent
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
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown-Client';

    const result = await notesService.deleteNote(
      req.user.id,
      req.params.id,
      clientIp,
      userAgent
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
