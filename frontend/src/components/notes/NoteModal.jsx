import React, { useState, useEffect } from 'react';
import { Lock, X, Save, FileText, ShieldCheck, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vault-bg/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-vault-card border border-vault-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transition-surface">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-vault-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-vault-surface border border-vault-border flex items-center justify-center text-vault-emerald">
              <Lock className="w-4 h-4 text-vault-emerald" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {initialData ? 'Editar Nota Cifrada' : 'Nueva Nota en la Bóveda'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-vault-surface"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-lg text-vault-red text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-medium text-gray-300">Título de la Nota</label>
              <span className="text-gray-500 font-mono">
                {title.length} / {MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Claves maestras de acceso..."
              maxLength={MAX_TITLE_LENGTH}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Content textarea */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-medium text-gray-300">Contenido Confidencial</label>
              <span
                className={`font-mono text-[11px] ${
                  isContentOverflow
                    ? 'text-vault-red font-bold'
                    : contentRemaining < 100
                    ? 'text-vault-amber font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {content.length} / {MAX_CONTENT_LENGTH} chars (A06)
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí tu información confidencial. Al guardar se cifrará con AES-256-GCM..."
              rows={8}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm resize-none leading-relaxed transition-colors font-sans"
              disabled={loading}
            />
          </div>

          {/* Security badge footer inside modal */}
          <div className="bg-vault-surface/60 border border-vault-border rounded-lg p-2.5 flex items-center space-x-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-vault-emerald shrink-0" />
            <span>Se generará un IV único de 12 bytes y AuthTag de 16 bytes al persistir.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-400 hover:text-white hover:bg-vault-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isContentOverflow}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-vault-emerald hover:bg-emerald-400 text-vault-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-950/40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
