import React, { useState } from 'react';

export const NoteCard = ({ note, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar permanentemente esta nota de tu bóveda?')) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm hover:shadow-cyan-950/20 flex flex-col justify-between group">
      <div>
        {/* Header of Note Card */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {note.title}
          </h3>
          <span className="shrink-0 inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>AES-256-GCM</span>
          </span>
        </div>

        {/* Content body */}
        <p className="text-slate-300 text-sm whitespace-pre-wrap break-words line-clamp-4 font-sans leading-relaxed">
          {note.content}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono text-[11px]">{formattedDate}</span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors font-medium"
            title="Editar contenido de la nota"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-2.5 py-1 rounded hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-colors font-medium disabled:opacity-50"
            title="Eliminar de forma permanente"
          >
            {isDeleting ? 'Borrando...' : 'Borrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
