import React, { useState, useEffect } from 'react';
import profileService from '../services/profile.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, UserCheck, Shield, Phone, Save, Loader2, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

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
        <Loader2 className="w-8 h-8 text-vault-emerald animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Cargando perfil seguro...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 font-sans">
          <UserCheck className="w-6 h-6 text-vault-emerald" />
          <span>Perfil de Seguridad y PII</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Protección de Información Personal Identificable mediante enmascaramiento y cifrado simétrico en reposo (RF-05)
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-vault-red/60 rounded-xl text-vault-red text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-vault-emerald text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Visualización y Desvelado Seguro */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 space-y-5 transition-surface shadow-md">
          <div className="flex items-center space-x-3.5 border-b border-vault-border pb-4">
            <div className="w-11 h-11 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-center text-vault-emerald font-bold text-lg font-mono">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{profile?.fullName}</h2>
              <span className="text-xs text-gray-400 font-mono">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-vault-border/60">
              <span className="text-gray-400">Rol de Acceso (RBAC):</span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-vault-surface text-vault-emerald border border-vault-emerald/30 uppercase font-semibold">
                {profile?.role}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-vault-border/60">
              <span className="text-gray-400">Identificador UUID:</span>
              <span className="font-mono text-gray-500 text-[11px] truncate max-w-[190px]">
                {profile?.id}
              </span>
            </div>

            {/* PII sensible: Teléfono Enmascarado y botón Revelar / Ocultar */}
            <div className="py-2 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Teléfono Confidencial:
                </span>
                {profile?.hasPhone ? (
                  <span className="font-mono text-gray-200 bg-vault-bg px-2.5 py-1 rounded-md border border-vault-border text-xs">
                    {isPhoneRevealed && revealedPhone ? revealedPhone : profile.phoneMasked || '***-***-XXXX'}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">No registrado</span>
                )}
              </div>

              {profile?.hasPhone && (
                <div className="pt-1">
                  <button
                    onClick={handleToggleRevealPhone}
                    disabled={revealing}
                    className="w-full py-2 px-3 rounded-lg bg-vault-surface hover:bg-vault-border text-vault-emerald text-xs font-medium border border-vault-border flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                        <span>Revelar dato descifrado (Auditoría A09)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1.5 text-center flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-vault-amber" />
                    <span>Cada revelado genera un registro inmutable PHONE_REVEALED en security_logs</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Actualización de Teléfono y Perfil */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6 transition-surface shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-4 border-b border-vault-border pb-3 flex items-center gap-2 font-sans">
              <Shield className="w-4 h-4 text-vault-emerald" />
              <span>Actualizar Datos Sensibles</span>
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nuevo Teléfono <span className="text-vault-emerald font-normal">(Cifrado con AES-256-GCM)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 9999 8888"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-3.5 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-vault-emerald text-sm transition-colors"
                  disabled={updating}
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Se computará un nuevo vector de inicialización y se reemplazará la máscara en la base de datos.
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 px-4 rounded-lg bg-vault-emerald hover:bg-emerald-400 text-vault-bg font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm shadow-emerald-950/40 flex items-center justify-center gap-2 mt-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cifrando y Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar y Cifrar Datos</span>
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
