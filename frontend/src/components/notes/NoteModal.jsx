import React, { useState, useEffect } from 'react';

const MAX_TITLE_LENGTH = 150;
const MAX_CONTENT_LENGTH = 2000;

export const NoteModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const contentRemaining = MAX_CONTENT_LENGTH - content.length;
  const isContentOverflow = content.length > MAX_CONTENT_LENGTH;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título de la nota no puede estar vacío');
      return;
    }
    if (title.length > MAX_TITLE_LENGTH) {
      setError(`El título no puede superar ${MAX_TITLE_LENGTH} caracteres`);
      return;
    }
    if (!content.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`El contenido excede el límite máximo de ${MAX_CONTENT_LENGTH} caracteres`);
      return;
    }

    setLoading(true);
    try {
      await onSave({ title: title.trim(), content: content.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la nota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
            <h2 className="text-lg font-semibold text-white">
              {initialData ? 'Editar Nota Cifrada' : 'Nueva Nota en la Bóveda'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-medium text-slate-300">Título de la Nota</label>
              <span className="text-slate-500 font-mono">
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Claves de acceso a servidor..."
              maxLength={MAX_TITLE_LENGTH}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Content textarea */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-medium text-slate-300">Contenido Confidencial</label>
              <span
                className={`font-mono ${
                  isContentOverflow
                    ? 'text-rose-400 font-bold'
                    : contentRemaining < 100
                    ? 'text-amber-400 font-medium'
                    : 'text-slate-500'
                }`}
              >
                {content.length}/{MAX_CONTENT_LENGTH} chars (A06)
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí tu información sensible protegida con AES-256-GCM..."
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm resize-none leading-relaxed"
              disabled={loading}
            />
          </div>

          {/* Security badge footer inside modal */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center space-x-2 text-[11px] text-slate-400">
            <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Se generará un IV único de 12 bytes y AuthTag de 16 bytes al persistir.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isContentOverflow}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-500/20"
            >
              {loading ? 'Cifrando y Guardando...' : initialData ? 'Actualizar Nota' : 'Cifrar y Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
