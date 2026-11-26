import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, Loader2 } from 'lucide-react';

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
      setError('El título de la nota es requerido');
      return;
    }
    if (title.length > MAX_TITLE_LENGTH) {
      setError(`El título no puede superar los ${MAX_TITLE_LENGTH} caracteres`);
      return;
    }
    if (!content.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`El contenido excede el límite de negocio de ${MAX_CONTENT_LENGTH} caracteres`);
      return;
    }

    setLoading(true);
    try {
      await onSave({ title: title.trim(), content: content.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la nota cifrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-mobbin-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col transition-surface">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-mobbin-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-mobbin-text">
              {initialData ? 'Editar Nota Cifrada' : 'Nueva Nota en la Bóveda'}
            </h2>
            <p className="text-[11px] text-mobbin-muted">
              Cifrado simétrico AES-256-GCM con autenticación criptográfica.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-mobbin-muted hover:text-mobbin-text transition-colors p-1.5 rounded-lg hover:bg-mobbin-surface cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-status-dangerBg border border-status-dangerBorder rounded-lg text-status-danger text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-semibold text-mobbin-text uppercase tracking-wider">
                Título de la Nota
              </label>
              <span className="text-mobbin-muted font-mono text-[11px]">
                {title.length} / {MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Llaves maestras de API..."
              maxLength={MAX_TITLE_LENGTH}
              className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-mobbin-text text-sm placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Content textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-semibold text-mobbin-text uppercase tracking-wider">
                Contenido Confidencial
              </label>
              <span
                className={`font-mono text-[11px] ${
                  isContentOverflow
                    ? 'text-status-danger font-bold'
                    : contentRemaining < 100
                    ? 'text-status-warning font-semibold'
                    : 'text-mobbin-muted'
                }`}
              >
                {content.length} / {MAX_CONTENT_LENGTH} chars (A06)
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí tu información confidencial. Al guardar se cifrará con AES-256-GCM..."
              rows={7}
              className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-mobbin-text text-sm placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive transition-colors font-sans resize-none leading-relaxed"
              disabled={loading}
            />
          </div>

          {/* Security badge footer inside modal */}
          <div className="bg-mobbin-surface border border-mobbin-border rounded-lg p-3 flex items-center space-x-2 text-[11px] text-mobbin-muted">
            <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
            <span>Se generará un IV único de 12 bytes y AuthTag de 16 bytes al persistir en BD.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-mobbin-muted hover:text-mobbin-text hover:bg-mobbin-surface transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isContentOverflow}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-mobbin-dark hover:bg-mobbin-darkHover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Cifrando y Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialData ? 'Actualizar Nota' : 'Cifrar y Guardar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
