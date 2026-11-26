import React, { useState } from 'react';
import { Lock, Edit2, Trash2, Calendar, Copy, Check, Terminal, FileText } from 'lucide-react';

export const NoteCard = ({ note, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Confirmas la eliminación permanente de esta nota cifrada de la bóveda?')) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white border border-mobbin-border rounded-xl p-5 hover:border-mobbin-borderHover transition-surface flex flex-col justify-between group shadow-xs">
      <div>
        {/* Header of Note Card */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-mobbin-text text-base line-clamp-1 font-sans">
            {note.title}
          </h3>
          <button
            onClick={() => setShowCrypto(!showCrypto)}
            className="shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-mobbin-surface hover:bg-mobbin-surfaceHover text-mobbin-muted hover:text-mobbin-text border border-mobbin-border font-mono font-medium transition-colors cursor-pointer"
            title="Ver / Ocultar datos criptográficos en BD (IV, Tag, Ciphertext)"
          >
            <span>{showCrypto ? 'Texto Plano' : 'AES-256-GCM'}</span>
          </button>
        </div>

        {/* Content body */}
        {!showCrypto ? (
          <p className="text-mobbin-muted text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed select-text">
            {note.content}
          </p>
        ) : (
          <div className="bg-mobbin-surface border border-mobbin-border rounded-lg p-3 space-y-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-mobbin-border">
              <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-mobbin-text">
                <Terminal className="w-3 h-3 text-mobbin-muted" />
                Cifrado en Reposo (PostgreSQL)
              </span>
              <span className="text-[10px] text-mobbin-muted font-bold">AES-256-GCM</span>
            </div>

            {/* Ciphertext */}
            <div>
              <div className="flex items-center justify-between text-mobbin-muted mb-0.5">
                <span className="text-[10px] font-semibold">1. Ciphertext (Hex):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.ciphertext || '', 'ciphertext')}
                  className="hover:text-mobbin-text transition-colors"
                  title="Copiar Ciphertext"
                >
                  {copiedField === 'ciphertext' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-mobbin-text break-all bg-white p-2 rounded border border-mobbin-border text-[10px] max-h-16 overflow-y-auto select-all">
                {note.cryptoMeta?.ciphertext || 'No disponible'}
              </p>
            </div>

            {/* Initialization Vector (IV) */}
            <div>
              <div className="flex items-center justify-between text-mobbin-muted mb-0.5">
                <span className="text-[10px] font-semibold">2. IV (12 Bytes CSPRNG):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.iv || '', 'iv')}
                  className="hover:text-mobbin-text transition-colors"
                  title="Copiar IV"
                >
                  {copiedField === 'iv' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-mobbin-text break-all bg-white p-1.5 rounded border border-mobbin-border text-[10px] select-all">
                {note.cryptoMeta?.iv || 'No disponible'}
              </p>
            </div>

            {/* Authentication Tag */}
            <div>
              <div className="flex items-center justify-between text-mobbin-muted mb-0.5">
                <span className="text-[10px] font-semibold">3. Auth Tag (16 Bytes):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.authTag || '', 'authTag')}
                  className="hover:text-mobbin-text transition-colors"
                  title="Copiar Auth Tag"
                >
                  {copiedField === 'authTag' ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-mobbin-text break-all bg-white p-1.5 rounded border border-mobbin-border text-[10px] select-all">
                {note.cryptoMeta?.authTag || 'No disponible'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="mt-5 pt-3 border-t border-mobbin-border flex items-center justify-between text-xs text-mobbin-muted">
        <span className="font-mono text-[11px] flex items-center gap-1.5 text-mobbin-muted">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(note)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-mobbin-surface text-mobbin-muted hover:text-mobbin-text transition-colors font-medium text-xs cursor-pointer"
            title="Editar contenido de la nota"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-status-dangerBg text-mobbin-muted hover:text-status-danger transition-colors font-medium text-xs disabled:opacity-50 cursor-pointer"
            title="Eliminar de forma permanente"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Borrando...' : 'Borrar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
