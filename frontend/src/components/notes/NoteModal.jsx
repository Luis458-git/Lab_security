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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-modal-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#141414]">
              {initialData ? 'Editar Nota Cifrada' : 'Nueva Nota en la Bóveda'}
            </h2>
            <p className="text-[11px] text-[#666666] font-mono">
              Cifrado simétrico AES-256-GCM con autenticación criptográfica
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#141414] transition-colors p-1.5 rounded-full hover:bg-[#F4F4F5] cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-bold text-[#141414] uppercase tracking-wider">
                Título de la Nota
              </label>
              <span className="text-[#878787] font-mono text-[11px]">
                {title.length} / {MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Llaves maestras de API..."
              maxLength={MAX_TITLE_LENGTH}
              className="input-editorial w-full rounded-xl px-4 py-2.5 text-sm"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-bold text-[#141414] uppercase tracking-wider">
                Contenido Confidencial
              </label>
              <span
                className={`font-mono text-[11px] ${
                  isContentOverflow
                    ? 'text-[#B91C1C] font-bold'
                    : contentRemaining < 100
                    ? 'text-[#B45309] font-semibold'
                    : 'text-[#878787]'
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
              className="input-editorial w-full rounded-xl px-4 py-3 text-sm font-sans resize-none leading-relaxed"
              disabled={loading}
            />
          </div>

          <div className="bg-[#F7F7F8] border border-[#E5E5E5] rounded-xl p-3 flex items-center space-x-2 text-[11px] text-[#666666]">
            <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0" />
            <span>Se generará un IV único de 12 bytes y AuthTag de 16 bytes al persistir en BD.</span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-editorial-outline px-5 py-2.5 rounded-full text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isContentOverflow}
              className="btn-editorial flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
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
