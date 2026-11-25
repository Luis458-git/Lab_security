import React, { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notes.service.js';
import QuotaBar from '../components/notes/QuotaBar.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';

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
      setError(err.message || 'Error al cargar las notas de la bóveda');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleOpenCreate = () => {
    if (count >= maxQuota) {
      alert(`Has alcanzado la cuota máxima permitida de ${maxQuota} notas. Elimina notas antiguas para liberar espacio.`);
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
      alert(err.message || 'Error al eliminar la nota');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>Bóveda de Notas Privadas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              E2E In-Memory Decrypt
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cada contenido se cifra con claves simétricas derivadas y autenticación GCM (OWASP A04)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={count >= maxQuota}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors shadow-sm shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg leading-none">+</span>
          <span>Nueva Nota Cifrada</span>
        </button>
      </div>

      {/* Quota Bar */}
      <QuotaBar count={count} max={maxQuota} />

      {/* Search and Filters */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
        <svg className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar dentro del texto descifrado en memoria..."
          className="bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-500 hover:text-white px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-mono">Descifrando notas con AES-256-GCM...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && (
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-300">
                {search ? 'No se encontraron notas que coincidan con la búsqueda' : 'Tu bóveda está vacía'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {search
                  ? 'Intenta con otro término de búsqueda.'
                  : 'Crea tu primera nota confidencial protegida por cifrado simétrico en reposo.'}
              </p>
              {!search && (
                <button
                  onClick={handleOpenCreate}
                  className="mt-4 px-4 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-600/30 transition-colors"
                >
                  + Crear primera nota
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Note Create/Edit Modal */}
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
