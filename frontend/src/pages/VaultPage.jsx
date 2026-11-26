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
      {/* Mobbin Style App Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[28%] bg-[#141414] text-white flex items-center justify-center shadow-sm shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight">
              Bóveda de Notas Privadas
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
              Envelope Encryption (AES-256-GCM) en reposo • Descifrado bajo demanda en memoria (RF-04)
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={count >= maxQuota}
          className="btn-editorial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Nota Cifrada</span>
        </button>
      </div>

      {/* Quota Bar */}
      <QuotaBar count={count} max={maxQuota} />

      {/* Mobbin Pill Search & Counter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="w-4 h-4 text-[#878787] absolute left-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en títulos y notas descifradas..."
            className="w-full h-11 pl-10 pr-9 rounded-full bg-[#F4F4F5] border border-transparent focus:border-[#141414] focus:bg-white text-sm text-[#141414] placeholder-[#878787] focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 text-[#878787] hover:text-[#141414] cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="text-xs sm:text-sm text-[#878787] font-medium">
          Mostrando {filteredNotes.length} de {count} notas cifradas
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs font-semibold flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 text-[#141414] animate-spin" />
          <p className="text-xs text-[#666666] font-mono">Descifrando notas en memoria con clave simétrica...</p>
        </div>
      )}

      {/* Notes Grid */}
      {!loading && (
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 bg-[#F7F7F8] border border-[#E5E5E5] rounded-2xl p-8 animate-slide-up">
              <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center text-[#141414] mb-3 border border-[#E5E5E5] shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#141414]">
                {search ? 'Sin resultados para la búsqueda' : 'Tu bóveda se encuentra vacía'}
              </h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mt-1 leading-relaxed">
                {search
                  ? 'Intenta con otros términos clave.'
                  : 'Crea tu primera nota confidencial. Será cifrada con AES-256-GCM antes de ser persistida.'}
              </p>
              {!search && (
                <button
                  onClick={handleOpenCreate}
                  className="btn-editorial mt-5 px-6 py-2.5 rounded-full text-xs cursor-pointer"
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
