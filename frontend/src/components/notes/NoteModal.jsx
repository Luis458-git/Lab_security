import React, { useState, useEffect } from 'react';
import { Lock, X, Save, ShieldCheck, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden flex flex-col animate-modal-in border border-emerald-500/30">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Editar Nota Cifrada' : 'Nueva Nota Confidencial'}
              </h2>
              <p className="text-[11px] text-emerald-400 font-mono">
                Envelope Encryption • AES-256-GCM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-semibold text-slate-300">Título de la Nota</label>
              <span className="text-slate-400 font-mono text-[11px]">
                {title.length} / {MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Credenciales de Servidor de Producción..."
              maxLength={MAX_TITLE_LENGTH}
              className="input-cyber w-full rounded-xl px-4 py-2.5 text-sm placeholder-slate-500"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-semibold text-slate-300">Contenido Secreto</label>
              <span
                className={`font-mono text-[11px] ${
                  isContentOverflow
                    ? 'text-rose-400 font-bold'
                    : contentRemaining < 100
                    ? 'text-amber-400 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {content.length} / {MAX_CONTENT_LENGTH} chars
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí tu nota confidencial. Se cifrará automáticamente con una llave de 256 bits antes de guardarse..."
              rows={7}
              className="input-cyber w-full rounded-xl px-4 py-3 text-sm placeholder-slate-500 resize-none leading-relaxed font-sans"
              disabled={loading}
            />
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-3 flex items-center space-x-2.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Se computará un IV aleatorio de 96 bits y etiqueta de integridad GCM de 128 bits.</span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isContentOverflow}
              className="btn-cyber flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cifrando Nota...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialData ? 'Recifrar y Actualizar' : 'Cifrar y Guardar'}</span>
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
