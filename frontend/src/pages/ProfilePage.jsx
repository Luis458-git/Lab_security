import React, { useState, useEffect } from 'react';
import profileService from '../services/profile.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Shield, Phone, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);

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
        <Loader2 className="w-7 h-7 text-[#141414] animate-spin" />
        <span className="text-xs text-[#666666] font-mono">Cargando perfil seguro...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-[#E5E5E5] animate-slide-up">
        <div className="w-14 h-14 rounded-[28%] bg-[#141414] text-white flex items-center justify-center font-mono text-xl font-bold shadow-sm">
          {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight">
            Perfil de Seguridad y PII
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
            Protección de Información Personal Identificable mediante enmascaramiento y cifrado AES-256-GCM (RF-05)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#15803d] text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Visualización y Desvelado Seguro */}
        <div className="editorial-card rounded-2xl bg-[#F4F4F5] p-3.5 border border-[#E5E5E5] animate-slide-up">
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] h-full flex flex-col justify-between space-y-5">
            <div className="border-b border-[#E5E5E5] pb-4">
              <h2 className="text-base font-bold text-[#141414]">{profile?.fullName}</h2>
              <span className="text-xs text-[#666666] font-mono">{profile?.email}</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-[#E5E5E5]">
                <span className="text-[#666666]">Rol de Acceso (RBAC):</span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#141414] text-white uppercase font-bold">
                  {profile?.role}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#E5E5E5]">
                <span className="text-[#666666]">Identificador UUID:</span>
                <span className="font-mono text-[#666666] text-[11px] truncate max-w-[190px]">
                  {profile?.id}
                </span>
              </div>

              {/* Teléfono Enmascarado */}
              <div className="py-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#141414] font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#666666]" />
                    Teléfono Confidencial:
                  </span>
                  {profile?.hasPhone ? (
                    <span className="font-mono text-[#141414] bg-[#F7F7F8] px-3 py-1 rounded-full border border-[#E5E5E5] text-xs font-bold">
                      {isPhoneRevealed && revealedPhone ? revealedPhone : profile.phoneMasked || '***-***-XXXX'}
                    </span>
                  ) : (
                    <span className="text-[#878787] italic">No registrado</span>
                  )}
                </div>

                {profile?.hasPhone && (
                  <div className="pt-1">
                    <button
                      onClick={handleToggleRevealPhone}
                      disabled={revealing}
                      className="btn-editorial-outline w-full py-2.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
                          <span>Revelar Dato Descifrado (Auditoría A09)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#878787] mt-2 text-center">
                      Cada revelado genera un registro inmutable PHONE_REVEALED en security_logs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Actualización */}
        <div className="editorial-card rounded-2xl bg-[#F4F4F5] p-3.5 border border-[#E5E5E5] animate-slide-up-delay-1">
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] h-full flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#141414] mb-4 border-b border-[#E5E5E5] pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#141414]" />
                <span>Actualizar Datos Sensibles</span>
              </h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="input-editorial w-full rounded-xl px-4 py-2.5 text-sm"
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141414] mb-1.5 uppercase tracking-wider">
                    Nuevo Teléfono <span className="text-[#878787] font-normal">(Cifrado AES-256-GCM)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+506 8888-8888"
                    className="input-editorial w-full rounded-xl px-4 py-2.5 text-sm font-mono"
                    disabled={updating}
                  />
                  <p className="text-[10px] text-[#878787] mt-1.5">
                    Se generará un nuevo IV y se actualizará la máscara en la base de datos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn-editorial w-full py-3 px-5 rounded-full text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
};

export default ProfilePage;
