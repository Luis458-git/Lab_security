import React, { useState, useEffect } from 'react';
import profileService from '../services/profile.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, UserCheck, Shield, Phone, Save, Loader2, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ProfilePage = () => {
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);

  // Edit Form
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
      setError(err.message || 'Error al obtener los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggleRevealPhone = async () => {
    if (isPhoneRevealed) {
      setIsPhoneRevealed(false);
      return;
    }

    if (revealedPhone) {
      setIsPhoneRevealed(true);
      return;
    }

    setRevealing(true);
    setError('');
    try {
      const res = await profileService.revealPhone();
      setRevealedPhone(res.phone);
      setIsPhoneRevealed(true);
    } catch (err) {
      setError(err.message || 'Error al descifrar dato sensible en el servidor');
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
        setMessage('No se detectaron modificaciones para guardar');
        setUpdating(false);
        return;
      }

      const res = await profileService.updateProfile(payload);
      setProfile(res.profile);
      setPhone('');
      setRevealedPhone(null);
      setIsPhoneRevealed(false);
      setMessage('Perfil y datos sensibles cifrados y actualizados exitosamente');
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
        <span className="text-xs text-emerald-300/80 font-mono">Cargando identidad criptográfica...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>PII Vault Protection (RF-05)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Perfil de <span className="text-gradient-emerald">Identidad y PII</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Enmascaramiento dinámico y cifrado simétrico AES-256-GCM de Información Personal Identificable.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identidad y Revelado Auditado */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 animate-slide-up">
          <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-extrabold text-xl font-mono shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{profile?.fullName}</h2>
              <span className="text-xs text-slate-400 font-mono">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400">Rol de Acceso (RBAC):</span>
              <span className="font-mono text-[11px] px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                {profile?.role}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400">UUID de Bóveda:</span>
              <span className="font-mono text-slate-400 text-[11px] truncate max-w-[190px]">
                {profile?.id}
              </span>
            </div>

            {/* Teléfono Cifrado */}
            <div className="py-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Teléfono Confidencial:
                </span>
                {profile?.hasPhone ? (
                  <span className="font-mono text-emerald-300 bg-slate-950/90 px-3 py-1 rounded-xl border border-emerald-500/30 text-xs font-bold shadow-inner">
                    {isPhoneRevealed && revealedPhone ? revealedPhone : profile.phoneMasked || '***-***-XXXX'}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">No registrado</span>
                )}
              </div>

              {profile?.hasPhone && (
                <div className="pt-1">
                  <button
                    onClick={handleToggleRevealPhone}
                    disabled={revealing}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {revealing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Descifrando desde base de datos...</span>
                      </>
                    ) : isPhoneRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ocultar Teléfono (Enmascarar)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Revelar Dato Descifrado (Auditoría A09)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Cada revelado registra un evento PHONE_REVEALED en la bitácora forense</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Actualización */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between animate-slide-up-delay-1">
          <div>
            <h2 className="text-base font-bold text-white mb-5 border-b border-white/10 pb-3.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Actualizar Datos Sensibles</span>
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="input-cyber w-full rounded-xl px-4 py-2.5 text-sm placeholder-slate-500"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nuevo Teléfono <span className="text-emerald-400 font-normal">(Cifrado AES-256-GCM)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+506 8888-8888"
                  className="input-cyber w-full rounded-xl px-4 py-2.5 text-sm placeholder-slate-500 font-mono"
                  disabled={updating}
                />
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Se generará un nuevo vector de inicialización (IV) y se actualizará la máscara pública.
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-cyber w-full py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cifrando y Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar y Recifrar Datos</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
