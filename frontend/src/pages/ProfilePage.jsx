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
        <Loader2 className="w-8 h-8 text-[#002E22] animate-spin" />
        <span className="text-xs text-[#3B6E5C] font-mono">Cargando perfil seguro...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-[#BBE2CE] animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-[#002E22] text-[#03D47C] flex items-center justify-center font-mono text-xl font-extrabold shadow-md">
          {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="font-expensify-serif text-2xl sm:text-3xl font-bold text-[#002E22] tracking-tight">
            Perfil de Seguridad y PII
          </h1>
          <p className="text-xs sm:text-sm text-[#3B6E5C] mt-0.5">
            Protección de Información Personal Identificable mediante enmascaramiento y cifrado AES-256-GCM (RF-05)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-[#B91C1C] text-xs font-bold flex items-center gap-2 animate-slide-up">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-[#C2F5DF] border border-[#03D47C] rounded-2xl text-[#002E22] text-xs font-bold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identidad y Revelado Auditado */}
        <div className="sage-card rounded-2xl bg-[#DDF2E8] p-3.5 border-2 border-[#BBE2CE] animate-slide-up">
          <div className="bg-[#F7FCF9] rounded-xl p-6 border border-[#BBE2CE] h-full flex flex-col justify-between space-y-5">
            <div className="border-b border-[#BBE2CE] pb-4">
              <h2 className="text-base font-bold text-[#002E22]">{profile?.fullName}</h2>
              <span className="text-xs text-[#3B6E5C] font-mono">{profile?.email}</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-[#BBE2CE]">
                <span className="text-[#3B6E5C]">Rol de Acceso (RBAC):</span>
                <span className="font-mono text-[11px] px-3 py-0.5 rounded-full bg-[#002E22] text-[#03D47C] uppercase font-extrabold">
                  {profile?.role}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#BBE2CE]">
                <span className="text-[#3B6E5C]">Identificador UUID:</span>
                <span className="font-mono text-[#3B6E5C] text-[11px] truncate max-w-[190px]">
                  {profile?.id}
                </span>
              </div>

              {/* Teléfono Enmascarado */}
              <div className="py-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#002E22] font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0B533E]" />
                    Teléfono Confidencial:
                  </span>
                  {profile?.hasPhone ? (
                    <span className="font-mono text-[#002E22] bg-[#C2F5DF] px-3 py-1 rounded-full border border-[#03D47C] text-xs font-extrabold">
                      {isPhoneRevealed && revealedPhone ? revealedPhone : profile.phoneMasked || '***-***-XXXX'}
                    </span>
                  ) : (
                    <span className="text-[#639281] italic">No registrado</span>
                  )}
                </div>

                {profile?.hasPhone && (
                  <div className="pt-1">
                    <button
                      onClick={handleToggleRevealPhone}
                      disabled={revealing}
                      className="btn-forest w-full py-2.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {revealing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#03D47C]" />
                          <span>Descifrando desde BD...</span>
                        </>
                      ) : isPhoneRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-[#03D47C]" />
                          <span>Ocultar Teléfono (Enmascarar)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#03D47C]" />
                          <span>Revelar Dato Descifrado (Auditoría A09)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#3B6E5C] mt-2 text-center">
                      Cada revelado genera un registro inmutable PHONE_REVEALED en security_logs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Actualización */}
        <div className="sage-card rounded-2xl bg-[#DDF2E8] p-3.5 border-2 border-[#BBE2CE] animate-slide-up-delay-1">
          <div className="bg-[#F7FCF9] rounded-xl p-6 border border-[#BBE2CE] h-full flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#002E22] mb-4 border-b border-[#BBE2CE] pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#002E22]" />
                <span>Actualizar Datos Sensibles</span>
              </h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="input-sage w-full rounded-2xl px-4 py-2.5 text-sm"
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002E22] mb-1.5 uppercase tracking-wider">
                    Nuevo Teléfono <span className="text-[#0B533E] font-normal">(Cifrado AES-256-GCM)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+506 8888-8888"
                    className="input-sage w-full rounded-2xl px-4 py-2.5 text-sm font-mono"
                    disabled={updating}
                  />
                  <p className="text-[10px] text-[#3B6E5C] mt-1.5">
                    Se generará un nuevo IV y se actualizará la máscara en la base de datos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn-expensify w-full py-3 px-5 rounded-full text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
};

export default ProfilePage;
