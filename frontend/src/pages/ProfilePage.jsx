import React, { useState, useEffect } from 'react';
import profileService from '../services/profile.service.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [revealing, setRevealing] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.profile);
      setFullName(res.profile.fullName || '');
    } catch (err) {
      setError(err.message || 'Error al obtener el perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRevealPhone = async () => {
    setRevealing(true);
    setError('');
    try {
      const res = await profileService.revealPhone();
      setRevealedPhone(res.phone);
    } catch (err) {
      setError(err.message || 'Error al descifrar el dato sensible');
    } finally {
      setRevealing(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUpdating(true);

    try {
      const payload = {};
      if (fullName.trim() !== profile.fullName) payload.fullName = fullName.trim();
      if (phone.trim()) payload.phone = phone.trim();

      if (Object.keys(payload).length === 0) {
        setMessage('No hay cambios pendientes para guardar');
        setUpdating(false);
        return;
      }

      const res = await profileService.updateProfile(payload);
      setProfile(res.profile);
      setPhone('');
      setRevealedPhone(null);
      setMessage('Perfil y datos sensibles actualizados y cifrados exitosamente');
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Perfil de Seguridad y PII</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Protección de Información Personal Identificable mediante enmascaramiento y cifrado AES-256-GCM (RF-05)
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-300 text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Visualización Segura */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{profile?.fullName}</h2>
              <span className="text-xs text-slate-400 font-mono">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Rol en el Sistema:</span>
              <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 capitalize">
                {profile?.role}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">ID de Usuario (UUID):</span>
              <span className="font-mono text-slate-500 text-[11px] truncate max-w-[180px]">
                {profile?.id}
              </span>
            </div>

            {/* PII sensible: Teléfono Enmascarado y botón Revelar */}
            <div className="py-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Teléfono (Dato Sensible):</span>
                {profile?.hasPhone ? (
                  <span className="font-mono text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {revealedPhone ? revealedPhone : profile.phoneMasked || '***-***-XXXX'}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">No registrado</span>
                )}
              </div>

              {profile?.hasPhone && !revealedPhone && (
                <div className="pt-1">
                  <button
                    onClick={handleRevealPhone}
                    disabled={revealing}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <span>👁️</span>
                    <span>{revealing ? 'Descifrando desde BD...' : 'Revelar Teléfono Descifrado (Auditoría A09)'}</span>
                  </button>
                  <p className="text-[10px] text-slate-500 mt-1 italic text-center">
                    * Esta acción genera un registro inmutable `PHONE_REVEALED` en security_logs.
                  </p>
                </div>
              )}

              {revealedPhone && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-[11px] text-cyan-300">
                  <span className="font-semibold block text-cyan-200">✓ Descifrado exitosamente:</span>
                  <span className="font-mono text-base font-bold text-white">{revealedPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Actualización de Datos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 border-b border-slate-800 pb-3">
            Actualizar Datos del Perfil
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                disabled={updating}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nuevo Teléfono <span className="text-slate-500 font-normal">(Cifrado con AES-256-GCM)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 9999 8888"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                disabled={updating}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Al guardar, se generará una nueva máscara y se reemplazará el ciphertext en reposo.
              </p>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-cyan-500/20"
            >
              {updating ? 'Guardando y Cifrando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
