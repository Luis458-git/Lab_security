import React, { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notes.service.js';
import QuotaBar from '../components/notes/QuotaBar.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';
import { Plus, Search, Lock, X, Loader2, AlertOctagon, FileText } from 'lucide-react';

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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 sm:py-10 space-y-6">
      {/* Header Verde Expensify */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#BBE2CE] animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#002E22] text-[#03D47C] flex items-center justify-center shadow-md shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-expensify-serif text-2xl sm:text-3xl font-bold text-[#002E22] tracking-tight">
              Bóveda de Notas Privadas
            </h1>
            <p className="text-xs sm:text-sm text-[#3B6E5C] mt-0.5">
              Envelope Encryption (AES-256-GCM) en reposo • Descifrado bajo demanda en memoria (RF-04)
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={count >= maxQuota}
          className="btn-expensify inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva Nota Cifrada</span>
        </button>
      </div>

      {/* Quota Bar */}
      <QuotaBar count={count} max={maxQuota} />

      {/* Pill Search & Counter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="w-4 h-4 text-[#3B6E5C] absolute left-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en títulos y notas descifradas..."
            className="w-full h-11 pl-10 pr-9 rounded-full bg-white border border-[#BBE2CE] focus:border-[#03D47C] text-sm text-[#002E22] placeholder-[#639281] focus:outline-none transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 text-[#3B6E5C] hover:text-[#002E22] cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-xs sm:text-sm text-[#0B533E] font-bold">
          Mostrando {filteredNotes.length} de {count} notas cifradas
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-[#B91C1C] text-xs font-bold flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#002E22] animate-spin" />
          <p className="text-xs text-[#3B6E5C] font-mono">Descifrando notas en memoria con clave simétrica...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && (
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 bg-[#DDF2E8] border-2 border-[#BBE2CE] rounded-3xl p-8 animate-slide-up">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#002E22] flex items-center justify-center text-[#03D47C] mb-3 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-expensify-serif text-lg font-bold text-[#002E22]">
                {search ? 'Sin resultados para la búsqueda' : 'Tu bóveda se encuentra vacía'}
              </h3>
              <p className="text-xs text-[#3B6E5C] max-w-sm mx-auto mt-1 leading-relaxed">
                {search
                  ? 'Intenta con otros términos clave.'
                  : 'Crea tu primera nota confidencial. Será cifrada con AES-256-GCM antes de ser persistida.'}
              </p>
              {!search && (
                <button
                  onClick={handleOpenCreate}
                  className="btn-expensify mt-5 px-6 py-2.5 rounded-full text-xs cursor-pointer"
                >
                  + Cifrar mi primera nota
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
