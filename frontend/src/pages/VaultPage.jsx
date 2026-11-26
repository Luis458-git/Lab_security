import React, { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notes.service.js';
import QuotaBar from '../components/notes/QuotaBar.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';
import { Plus, Search, FolderLock, Lock, X, Loader2, AlertOctagon, Sparkles } from 'lucide-react';

export const VaultPage = () => {
  const [notes, setNotes] = useState([]);
  const [count, setCount] = useState(0);
  const [maxQuota, setMaxQuota] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await notesService.getNotes();
      setNotes(data.notes || []);
      setCount(data.count || 0);
      setMaxQuota(data.quotaMax || 20);
    } catch (err) {
      setError(err.message || 'Error al descifrar y cargar las notas de la bóveda');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleOpenCreate = () => {
    if (count >= maxQuota) {
      alert(`Has alcanzado la cuota de negocio de ${maxQuota} notas (A06: Insecure Design). Elimina notas antiguas para crear una nueva.`);
      return;
    }
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    if (selectedNote) {
      await notesService.updateNote(selectedNote.id, noteData);
    } else {
      await notesService.createNote(noteData);
    }
    await fetchNotes();
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesService.deleteNote(noteId);
      await fetchNotes();
    } catch (err) {
      alert(err.message || 'Error al eliminar la nota de la bóveda');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-2">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Almacenamiento Cifrado Zero-Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bóveda de <span className="text-gradient-emerald">Notas Privadas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tus notas se descifran únicamente en memoria bajo demanda con verificación de integridad GCM.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={count >= maxQuota}
          className="btn-cyber inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Nota Cifrada</span>
        </button>
      </div>

      {/* Quota Bar */}
      <QuotaBar count={count} max={maxQuota} />

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center focus-within:border-emerald-500/60 transition-all animate-slide-up">
        <Search className="w-4 h-4 text-emerald-400 mr-3 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar instantáneamente en títulos y notas descifradas en memoria..."
          className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            title="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
          <p className="text-xs text-emerald-300/80 font-mono">Descifrando bóveda en memoria con AES-256-GCM...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && (
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl p-8 animate-slide-up">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-float shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {search ? 'Sin coincidencias en tu bóveda' : 'Tu bóveda criptográfica está lista'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                {search
                  ? 'Prueba con otro término de búsqueda.'
                  : 'Crea tu primera nota confidencial. Se cifrará con AES-256-GCM y vector de inicialización único antes de almacenarse.'}
              </p>
              {!search && (
                <button
                  onClick={handleOpenCreate}
                  className="btn-cyber mt-6 px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Cifrar mi primera nota</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialData={selectedNote}
      />
    </div>
  );
};

export default VaultPage;
