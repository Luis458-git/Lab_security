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
      <div className="sage-card rounded-2xl bg-[#DDF2E8] p-3.5 border-2 border-[#BBE2CE] flex flex-col justify-between h-full">
        <div className="bg-[#F7FCF9] rounded-xl p-5 border border-[#BBE2CE] flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-2.5 border-b border-[#BBE2CE]">
              <h3 className="font-bold text-[#002E22] text-base line-clamp-1 font-sans">
                {note.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowCrypto(!showCrypto)}
                className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full font-mono font-extrabold transition-all cursor-pointer border ${
                  showCrypto
                    ? 'bg-[#002E22] text-[#03D47C] border-[#002E22]'
                    : 'bg-[#C2F5DF] hover:bg-[#03D47C] text-[#002E22] border-[#03D47C]'
                }`}
                title="Ver / Ocultar datos criptográficos en BD (IV, Tag, Ciphertext)"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>{showCrypto ? 'Texto Plano' : 'AES-256-GCM'}</span>
              </button>
            </div>

            {/* Body */}
            {!showCrypto ? (
              <p className="text-[#1F4E3E] text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed select-text">
                {note.content}
              </p>
            ) : (
              <div className="bg-[#002E22] text-white border border-[#0B533E] rounded-xl p-3.5 space-y-2.5 font-mono text-[11px] animate-slide-up">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#0B533E]">
                  <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-[#03D47C]">
                    <Terminal className="w-3 h-3" />
                    Cifrado en Reposo (PostgreSQL)
                  </span>
                  <span className="text-[10px] text-[#C2F5DF] font-bold">256-bit</span>
                </div>

                {/* Ciphertext */}
                <div>
                  <div className="flex items-center justify-between text-[#C2F5DF] mb-0.5">
                    <span className="text-[10px] font-bold">1. Ciphertext (Hex):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(note.cryptoMeta?.ciphertext || '', 'ciphertext')}
                      className="hover:text-[#03D47C] transition-colors cursor-pointer"
                    >
                      {copiedField === 'ciphertext' ? <Check className="w-3 h-3 text-[#03D47C]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[#03D47C] break-all bg-[#064232] p-2 rounded-lg border border-[#0B533E] text-[10px] max-h-16 overflow-y-auto select-all">
                    {note.cryptoMeta?.ciphertext || 'No disponible'}
                  </p>
                </div>

                {/* IV */}
                <div>
                  <div className="flex items-center justify-between text-[#C2F5DF] mb-0.5">
                    <span className="text-[10px] font-bold">2. IV (12 Bytes CSPRNG):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(note.cryptoMeta?.iv || '', 'iv')}
                      className="hover:text-[#03D47C] transition-colors cursor-pointer"
                    >
                      {copiedField === 'iv' ? <Check className="w-3 h-3 text-[#03D47C]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-white break-all bg-[#064232] p-1.5 rounded-lg border border-[#0B533E] text-[10px] select-all">
                    {note.cryptoMeta?.iv || 'No disponible'}
                  </p>
                </div>

                {/* Auth Tag */}
                <div>
                  <div className="flex items-center justify-between text-[#C2F5DF] mb-0.5">
                    <span className="text-[10px] font-bold">3. Auth Tag (16 Bytes):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(note.cryptoMeta?.authTag || '', 'authTag')}
                      className="hover:text-[#03D47C] transition-colors cursor-pointer"
                    >
                      {copiedField === 'authTag' ? <Check className="w-3 h-3 text-[#03D47C]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-white break-all bg-[#064232] p-1.5 rounded-lg border border-[#0B533E] text-[10px] select-all">
                    {note.cryptoMeta?.authTag || 'No disponible'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pill Actions Footer */}
          <div className="pt-3 border-t border-[#BBE2CE] flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] flex items-center gap-1 text-[#3B6E5C]">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#03D47C] hover:bg-[#02B86B] text-[#002E22] font-bold text-[11px] transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E1F2EA] hover:bg-[#FEF2F2] text-[#002E22] hover:text-[#B91C1C] border border-[#BBE2CE] font-semibold text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
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
