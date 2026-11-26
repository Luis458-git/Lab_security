import React, { useState, useEffect } from 'react';
import profileService from '../services/profile.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, UserCheck, Shield, Phone, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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
        <Loader2 className="w-7 h-7 text-mobbin-dark animate-spin" />
        <span className="text-xs text-mobbin-muted font-mono">Cargando perfil seguro...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-mobbin-border">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mobbin-surface border border-mobbin-border text-[11px] font-mono text-mobbin-muted mb-2">
          <span>PII Encryption (AES-256-GCM)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-mobbin-text tracking-tight font-sans">
          Perfil de Seguridad y PII
        </h1>
        <p className="text-xs sm:text-sm text-mobbin-muted mt-1">
          Protección de Información Personal Identificable mediante enmascaramiento y cifrado simétrico en reposo (RF-05).
        </p>
      </div>

      {error && (
        <div className="p-4 bg-status-dangerBg border border-status-dangerBorder rounded-lg text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-status-successBg border border-status-successBorder rounded-lg text-status-success text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Visualización y Desvelado Seguro */}
        <div className="bg-white border border-mobbin-border rounded-xl p-6 space-y-5 transition-surface shadow-xs">
          <div className="flex items-center space-x-3.5 border-b border-mobbin-border pb-4">
            <div className="w-10 h-10 rounded-lg bg-mobbin-surface border border-mobbin-border flex items-center justify-center text-mobbin-text font-bold text-base font-mono">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-mobbin-text">{profile?.fullName}</h2>
              <span className="text-xs text-mobbin-muted font-mono">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-mobbin-border">
              <span className="text-mobbin-muted">Rol de Acceso (RBAC):</span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-mobbin-surface text-mobbin-text border border-mobbin-border uppercase font-semibold">
                {profile?.role}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-mobbin-border">
              <span className="text-mobbin-muted">Identificador UUID:</span>
              <span className="font-mono text-mobbin-muted text-[11px] truncate max-w-[190px]">
                {profile?.id}
              </span>
            </div>

            {/* PII sensible: Teléfono Enmascarado y botón Revelar / Ocultar */}
            <div className="py-2 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-mobbin-text font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-mobbin-muted" />
                  Teléfono Confidencial:
                </span>
                {profile?.hasPhone ? (
                  <span className="font-mono text-mobbin-text bg-mobbin-surface px-2.5 py-1 rounded-md border border-mobbin-border text-xs font-semibold">
                    {isPhoneRevealed && revealedPhone ? revealedPhone : profile.phoneMasked || '***-***-XXXX'}
                  </span>
                ) : (
                  <span className="text-mobbin-muted italic">No registrado</span>
                )}
              </div>

              {profile?.hasPhone && (
                <div className="pt-1">
                  <button
                    onClick={handleToggleRevealPhone}
                    disabled={revealing}
                    className="w-full py-2 px-3 rounded-lg bg-mobbin-surface hover:bg-mobbin-surfaceHover text-mobbin-text text-xs font-medium border border-mobbin-border flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {revealing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Descifrando desde BD...</span>
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
                  <p className="text-[10px] text-mobbin-muted mt-1.5 text-center">
                    Cada revelado genera un registro inmutable PHONE_REVEALED en security_logs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Actualización de Teléfono y Perfil */}
        <div className="bg-white border border-mobbin-border rounded-xl p-6 transition-surface shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-mobbin-text mb-4 border-b border-mobbin-border pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-mobbin-dark" />
              <span>Actualizar Datos Sensibles</span>
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive text-sm transition-colors"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mobbin-text mb-1.5 uppercase tracking-wider">
                  Nuevo Teléfono <span className="text-mobbin-muted font-normal">(Cifrado con AES-256-GCM)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+506 8888-8888"
                  className="w-full bg-white border border-mobbin-border rounded-lg px-3.5 py-2.5 text-mobbin-text placeholder-mobbin-subtle focus:outline-none focus:border-mobbin-borderActive text-sm transition-colors font-mono"
                  disabled={updating}
                />
                <p className="text-[10px] text-mobbin-muted mt-1">
                  Se generará un nuevo IV y se actualizará la máscara en la base de datos.
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 px-4 rounded-lg bg-mobbin-dark hover:bg-mobbin-darkHover text-white font-medium text-sm transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
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
