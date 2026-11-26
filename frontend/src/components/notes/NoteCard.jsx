import React, { useState } from 'react';
import { Lock, Edit2, Trash2, Calendar, Copy, Check, Terminal } from 'lucide-react';

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
    <div className="group flex flex-col space-y-2.5 animate-slide-up">
      {/* Contenedor exterior estilo tarjeta Mobbin */}
      <div className="editorial-card rounded-2xl bg-[#F4F4F5] p-3.5 border border-[#E5E5E5] flex flex-col justify-between h-full">
        {/* Lienzo interno blanco */}
        <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-2.5 border-b border-[#E5E5E5]">
              <h3 className="font-bold text-[#141414] text-base line-clamp-1 font-sans">
                {note.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowCrypto(!showCrypto)}
                className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-mono font-semibold transition-all cursor-pointer border ${
                  showCrypto
                    ? 'bg-[#141414] text-white border-[#141414]'
                    : 'bg-[#F4F4F5] hover:bg-[#EFEFF1] text-[#141414] border-[#E5E5E5]'
                }`}
                title="Ver / Ocultar datos criptográficos en BD (IV, Tag, Ciphertext)"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>{showCrypto ? 'Texto Plano' : 'AES-256-GCM'}</span>
              </button>
            </div>

            {/* Body */}
            {!showCrypto ? (
              <p className="text-[#666666] text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed select-text">
                {note.content}
              </p>
            ) : (
              <div className="bg-[#F7F7F8] border border-[#E5E5E5] rounded-xl p-3 space-y-2.5 font-mono text-[11px] animate-slide-up">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E5E5]">
                  <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-[#141414]">
                    <Terminal className="w-3 h-3 text-[#666666]" />
                    Cifrado en Reposo (PostgreSQL)
                  </span>
                  <span className="text-[10px] text-[#666666] font-bold">256-bit</span>
                </div>

                {/* Ciphertext */}
                <div>
                  <div className="flex items-center justify-between text-[#666666] mb-0.5">
                    <span className="text-[10px] font-bold text-[#141414]">1. Ciphertext (Hex):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(note.cryptoMeta?.ciphertext || '', 'ciphertext')}
                      className="hover:text-[#141414] transition-colors cursor-pointer"
                      title="Copiar Ciphertext"
                    >
                      {copiedField === 'ciphertext' ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[#141414] break-all bg-white p-2 rounded-lg border border-[#E5E5E5] text-[10px] max-h-16 overflow-y-auto select-all">
                    {note.cryptoMeta?.ciphertext || 'No disponible'}
                  </p>
                </div>

                {/* IV */}
                <div>
                  <div className="flex items-center justify-between text-[#666666] mb-0.5">
                    <span className="text-[10px] font-bold text-[#141414]">2. IV (12 Bytes CSPRNG):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(note.cryptoMeta?.iv || '', 'iv')}
                      className="hover:text-[#141414] transition-colors cursor-pointer"
                      title="Copiar IV"
                    >
                      {copiedField === 'iv' ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[#141414] break-all bg-white p-1.5 rounded-lg border border-[#E5E5E5] text-[10px] select-all">
                    {note.cryptoMeta?.iv || 'No disponible'}
                  </p>
                </div>

                {/* Auth Tag */}
                <div>
                  <div className="flex items-center justify-between text-[#666666] mb-0.5">
                    <span className="text-[10px] font-bold text-[#141414]">3. Auth Tag (16 Bytes):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(note.cryptoMeta?.authTag || '', 'authTag')}
                      className="hover:text-[#141414] transition-colors cursor-pointer"
                      title="Copiar Auth Tag"
                    >
                      {copiedField === 'authTag' ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[#141414] break-all bg-white p-1.5 rounded-lg border border-[#E5E5E5] text-[10px] select-all">
                    {note.cryptoMeta?.authTag || 'No disponible'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pill Actions Footer (Mobbin Split Pill Pattern) */}
          <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] flex items-center gap-1 text-[#878787]">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#141414] hover:bg-[#262626] text-white font-semibold text-[11px] transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F4F5] hover:bg-[#FEF2F2] text-[#666666] hover:text-[#B91C1C] border border-[#E5E5E5] font-semibold text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isDeleting ? '...' : 'Borrar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
