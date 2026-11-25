import React, { useState } from 'react';
import { Lock, Edit2, Trash2, Calendar, ShieldCheck, Eye, EyeOff, Copy, Check, Terminal } from 'lucide-react';

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
    <div className="bg-vault-card border border-vault-border rounded-xl p-5 hover:border-vault-borderHover transition-surface flex flex-col justify-between group shadow-sm hover:shadow-emerald-950/20">
      <div>
        {/* Header of Note Card */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-semibold text-white text-base line-clamp-1 group-hover:text-vault-emerald transition-colors font-sans">
            {note.title}
          </h3>
          <button
            onClick={() => setShowCrypto(!showCrypto)}
            className="shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-vault-emerald border border-emerald-800/40 font-mono font-medium transition-colors cursor-pointer"
            title="Ver / Ocultar datos criptográficos en BD (IV, Tag, Ciphertext)"
          >
            <Lock className="w-2.5 h-2.5 text-vault-emerald" />
            <span>{showCrypto ? 'Ver Texto Plano' : 'AES-256-GCM'}</span>
          </button>
        </div>

        {/* Content body: Muestra el texto plano descifrado O los metadatos criptográficos según toggle */}
        {!showCrypto ? (
          <p className="text-gray-300 text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed select-text">
            {note.content}
          </p>
        ) : (
          <div className="bg-vault-bg/90 border border-emerald-900/50 rounded-lg p-3 space-y-2.5 font-mono text-[11px] animate-fadeIn">
            <div className="flex items-center justify-between text-vault-emerald pb-1.5 border-b border-emerald-900/40">
              <span className="flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
                <Terminal className="w-3 h-3" />
                Cifrado en Reposo (PostgreSQL)
              </span>
              <span className="text-[10px] text-gray-500">AES-256-GCM</span>
            </div>

            {/* Ciphertext */}
            <div>
              <div className="flex items-center justify-between text-gray-400 mb-0.5">
                <span className="text-[10px] text-gray-300 font-bold">1. Ciphertext (Cifrado):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.ciphertext || '', 'ciphertext')}
                  className="hover:text-white transition-colors"
                  title="Copiar Ciphertext"
                >
                  {copiedField === 'ciphertext' ? <Check className="w-3 h-3 text-vault-emerald" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-emerald-400/90 break-all bg-[#0d131f] p-1.5 rounded border border-gray-800 text-[10px] max-h-16 overflow-y-auto select-all">
                {note.cryptoMeta?.ciphertext || 'No disponible'}
              </p>
            </div>

            {/* Initialization Vector (IV) */}
            <div>
              <div className="flex items-center justify-between text-gray-400 mb-0.5">
                <span className="text-[10px] text-gray-300 font-bold">2. Vector de Inicialización (IV - 12B):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.iv || '', 'iv')}
                  className="hover:text-white transition-colors"
                  title="Copiar IV"
                >
                  {copiedField === 'iv' ? <Check className="w-3 h-3 text-vault-emerald" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-cyan-400/90 break-all bg-[#0d131f] p-1.5 rounded border border-gray-800 text-[10px] select-all">
                {note.cryptoMeta?.iv || 'No disponible'}
              </p>
            </div>

            {/* Authentication Tag */}
            <div>
              <div className="flex items-center justify-between text-gray-400 mb-0.5">
                <span className="text-[10px] text-gray-300 font-bold">3. Auth Tag (Etiqueta GCM - 16B):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.authTag || '', 'authTag')}
                  className="hover:text-white transition-colors"
                  title="Copiar Auth Tag"
                >
                  {copiedField === 'authTag' ? <Check className="w-3 h-3 text-vault-emerald" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-amber-400/90 break-all bg-[#0d131f] p-1.5 rounded border border-gray-800 text-[10px] select-all">
                {note.cryptoMeta?.authTag || 'No disponible'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="mt-5 pt-3 border-t border-vault-border/80 flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono text-[11px] flex items-center gap-1.5 text-gray-400">
          <Calendar className="w-3 h-3 text-gray-500" />
          {formattedDate}
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onEdit(note)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-vault-surface text-gray-400 hover:text-vault-emerald transition-colors font-medium text-xs"
            title="Editar contenido de la nota"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-950/30 text-gray-400 hover:text-vault-red transition-colors font-medium text-xs disabled:opacity-50"
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
