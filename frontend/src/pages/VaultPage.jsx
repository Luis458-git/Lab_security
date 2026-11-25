import React, { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notes.service.js';
import QuotaBar from '../components/notes/QuotaBar.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';
import { Plus, Search, FolderLock, Lock, Shield, X, Loader2, AlertOctagon } from 'lucide-react';

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

  // Filtrado local rápido en memoria (inmune a inyección SQL)
  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 font-sans">
            <FolderLock className="w-6 h-6 text-vault-emerald" />
            <span>Bóveda de Notas Privadas</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Datos confidenciales protegidos con Envelope Encryption (AES-256-GCM) en reposo (RF-04)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={count >= maxQuota}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-vault-emerald hover:bg-emerald-400 text-vault-bg font-semibold text-sm transition-colors shadow-sm shadow-emerald-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Nota Cifrada</span>
        </button>
      </div>

      {/* Quota Bar (Límite de negocio A06) */}
      <QuotaBar count={count} max={maxQuota} />

      {/* Search Bar */}
      <div className="flex items-center bg-vault-card border border-vault-border rounded-xl px-3.5 py-2.5 transition-surface focus-within:border-vault-emerald">
        <Search className="w-4 h-4 text-gray-500 mr-2.5 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar dentro de títulos y notas descifradas en memoria..."
          className="bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none w-full"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-gray-400 hover:text-white p-1 rounded-md"
            title="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-vault-red/60 rounded-xl text-vault-red text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-vault-emerald animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Descifrando notas en memoria con clave simétrica...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && (
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 bg-vault-card/40 border border-vault-border/80 rounded-2xl p-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-vault-surface flex items-center justify-center text-gray-500 mb-3 border border-vault-border">
                <Lock className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-200">
                {search ? 'Sin resultados para la búsqueda' : 'Tu bóveda se encuentra vacía'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {search
                  ? 'Intenta con otros términos clave.'
                  : 'Crea tu primera nota confidencial. Será cifrada de forma atómica antes de ser persistida.'}
              </p>
              {!search && (
                <button
                  onClick={handleOpenCreate}
                  className="mt-4 px-4 py-2 rounded-lg bg-vault-surface hover:bg-vault-card text-vault-emerald border border-vault-emerald/30 text-xs font-semibold transition-colors"
                >
                  + Cifrar mi primera nota
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

      {/* Note Modal */}
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
