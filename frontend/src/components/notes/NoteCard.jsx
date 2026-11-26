import React, { useState } from 'react';
import { Lock, Edit2, Trash2, Calendar, Copy, Check, Terminal, Sparkles } from 'lucide-react';

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
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group animate-slide-up relative overflow-hidden">
      {/* Efecto de luz sutil en esquina al hacer hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-500 pointer-events-none"></div>

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-emerald-300 transition-colors font-sans">
            {note.title}
          </h3>
          <button
            onClick={() => setShowCrypto(!showCrypto)}
            className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-mono font-semibold transition-all duration-200 cursor-pointer border ${
              showCrypto
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/30'
            }`}
            title="Inspeccionar sobre criptográfico real en PostgreSQL"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>{showCrypto ? 'Ver Texto Plano' : 'AES-256-GCM'}</span>
          </button>
        </div>

        {/* Body */}
        {!showCrypto ? (
          <p className="text-slate-300 text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed select-text">
            {note.content}
          </p>
        ) : (
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5 font-mono text-[11px] animate-slide-up shadow-inner">
            <div className="flex items-center justify-between text-emerald-400 pb-1.5 border-b border-white/10">
              <span className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                Envelope en Reposo (BD)
              </span>
              <span className="text-[10px] text-cyan-400">256-bit</span>
            </div>

            {/* Ciphertext */}
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] text-slate-300 font-semibold">1. Ciphertext (Hex):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.ciphertext || '', 'ciphertext')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Copiar Ciphertext"
                >
                  {copiedField === 'ciphertext' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-emerald-400 break-all bg-slate-900/90 p-2 rounded-lg border border-white/5 text-[10px] max-h-16 overflow-y-auto select-all">
                {note.cryptoMeta?.ciphertext || 'No disponible'}
              </p>
            </div>

            {/* IV */}
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] text-slate-300 font-semibold">2. IV (12B CSPRNG):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.iv || '', 'iv')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Copiar IV"
                >
                  {copiedField === 'iv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-cyan-300 break-all bg-slate-900/90 p-1.5 rounded-lg border border-white/5 text-[10px] select-all">
                {note.cryptoMeta?.iv || 'No disponible'}
              </p>
            </div>

            {/* AuthTag */}
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] text-slate-300 font-semibold">3. Auth Tag (16B GCM):</span>
                <button
                  onClick={() => copyToClipboard(note.cryptoMeta?.authTag || '', 'authTag')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                  title="Copiar Auth Tag"
                >
                  {copiedField === 'authTag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-amber-300 break-all bg-slate-900/90 p-1.5 rounded-lg border border-white/5 text-[10px] select-all">
                {note.cryptoMeta?.authTag || 'No disponible'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px] flex items-center gap-1.5 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-emerald-400/70" />
          {formattedDate}
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onEdit(note)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-300 border border-transparent hover:border-emerald-500/30 transition-all text-xs font-medium cursor-pointer"
            title="Editar nota"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all text-xs font-medium disabled:opacity-50 cursor-pointer"
            title="Eliminar permanentemente"
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
