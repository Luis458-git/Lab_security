import React, { useState } from 'react';
import { Lock, Edit2, Trash2, Calendar, ShieldCheck } from 'lucide-react';

export const NoteCard = ({ note, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

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
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-vault-emerald border border-emerald-800/40 font-mono font-medium">
            <Lock className="w-2.5 h-2.5 text-vault-emerald" />
            <span>Cifrado AES-256-GCM</span>
          </span>
        </div>

        {/* Content body rendered strictly as raw text node (OWASP A05: XSS Immune) */}
        <p className="text-gray-300 text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed select-text">
          {note.content}
        </p>
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
