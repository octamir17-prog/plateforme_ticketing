import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2,
  User,
  Briefcase
} from 'lucide-react';
import { authService } from '../../services/workflowService';

export default function VerificationMatricule() {
  const navigate = useNavigate();
  
  const [matricule, setMatricule] = useState('');
  const [telephone, setTelephone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authService.verifyAgent(matricule, telephone, false);
      if (res && res.success === false) {
        setError(res.message || 'Erreur lors de la vérification.');
      } else {
        setStep(2);
        setSuccessMessage('Code envoyé. Vérifiez votre adresse email institutionnelle.');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Un compte existe déjà pour cet agent. Connectez-vous via la page de connexion.');
      } else {
        setError(err.response?.data?.message || 'Impossible d’envoyer le code. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authService.verifyCode(matricule, code);
      if (res && res.success === false) {
        setError(res.message || 'Code invalide.');
      } else {
        localStorage.setItem('temp_matricule', matricule);
        localStorage.setItem('temp_code', code);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (role) => {
    if (role === 'AGENT') {
      navigate('/home');
    } else if (role === 'UTILISATEUR') {
      navigate('/inscription');
    }
  };

  return (
    <div className="min-h-[calc(100vh-50px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* En-tête */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-cyan-50 text-[#15aabf] rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Vérification de l'agent</h1>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Saisissez vos identifiants pour recevoir votre code de vérification'}
            {step === 2 && 'Saisissez le code reçu sur votre adresse email institutionnelle'}
            {step === 3 && 'Sélectionnez le type d\'accès que vous souhaitez utiliser'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center text-xs font-medium">
            {error}
          </div>
        )}

        {/* ÉTAPE 1 : Saisie Matricule & Téléphone */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Matricule Agent <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder=" 000001"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf] font-medium uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Numéro de téléphone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="tel"
                  placeholder=" 0197000000"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#15aabf] hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Envoi en cours...</span>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Recevoir un code par email</span>
                </>
              )}
            </button>
          </form>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs">
            {successMessage}
          </div>
        )}

        {/* ÉTAPE 2 : Saisie du Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4 text-xs">
            <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center gap-2.5 text-cyan-800 text-[11px]">
              <CheckCircle2 className="w-5 h-5 text-[#15aabf] shrink-0" />
              <span>Un code de vérification a été envoyé à votre adresse email.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Code de vérification <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  placeholder="Saisissez le code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf] font-bold tracking-widest text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#15aabf] hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Validation...</span>
              ) : (
                <>
                  <span>Confirmer le code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-slate-500 hover:text-slate-700 text-[11px] font-medium underline cursor-pointer"
            >
              Renvoyer le code ou modifier les informations
            </button>
          </form>
        )}

        {/* ÉTAPE 3 : Choix du profil (Agent ou Utilisateur) */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <p className="text-xs font-semibold text-slate-700 text-center">
              Comment souhaitez-vous continuer ?
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelection('AGENT')}
                className="p-4 bg-slate-50 border border-slate-200 hover:border-[#15aabf] hover:bg-cyan-50/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 bg-white border border-slate-200 text-[#15aabf] rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#15aabf]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Espace Agent</h2>
                  <p className="text-[11px] text-slate-500">Accédez directement à votre espace d'accueil</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelection('UTILISATEUR')}
                className="p-4 bg-slate-50 border border-slate-200 hover:border-[#15aabf] hover:bg-cyan-50/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left group"
              >
                <div className="w-10 h-10 bg-white border border-slate-200 text-[#15aabf] rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#15aabf]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Espace Utilisateur</h2>
                  <p className="text-[11px] text-slate-500">Connectez-vous pour accéder à votre tableau de bord</p>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}