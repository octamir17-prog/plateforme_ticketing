import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock, Mail, ShieldCheck, User, Phone, Building2, Loader2 } from 'lucide-react';
import { authService } from '../../services/workflowService';
import AuthHeader from '../../components/layout/AuthHeader';

const formatTypeLabel = (type) => (type === 'STAFF' ? 'personnel' : 'utilisateur');

export default function PasswordResetFlow() {
  const [searchParams] = useSearchParams();
  const typeCompte = searchParams.get('type') === 'STAFF' ? 'STAFF' : 'UTILISATEUR';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [username, setUsername] = useState('');
  const [telephone, setTelephone] = useState('');
  const [structure, setStructure] = useState('');
  const [code, setCode] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');

  const isStaff = typeCompte === 'STAFF';

  const promptText = useMemo(() => {
    if (isStaff) {
      return 'Renseignez votre username, votre téléphone et la structure pour recevoir le code de réinitialisation.';
    }
    return 'Renseignez votre username et votre téléphone pour recevoir le code de réinitialisation.';
  }, [isStaff]);

  const handleDemanderCode = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !telephone) {
      setError('Le nom d\'utilisateur et le téléphone sont obligatoires.');
      return;
    }

    if (isStaff && !structure) {
      setError('La structure est obligatoire pour le personnel.');
      return;
    }

    try {
      setLoading(true);
      await authService.requestPasswordReset({
        typeCompte: isStaff ? 'STAFF' : 'UTILISATEUR',
        username,
        telephone,
        structure: isStaff ? structure : undefined,
      });

      setStep(2);
      setSuccess('Code envoyé. Vérifiez votre adresse email institutionnelle.');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de demander la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifierCode = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!code) {
      setError('Le code est obligatoire.');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyPasswordReset({ typeCompte: isStaff ? 'STAFF' : 'UTILISATEUR', username, code });
      setStep(3);
      setSuccess('Authentification confirmée. Vous pouvez maintenant définir votre nouveau mot de passe.');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalisation = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!nouveauMotDePasse || !confirmationMotDePasse) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    try {
      setLoading(true);
      await authService.finalizePasswordReset({
        typeCompte: isStaff ? 'STAFF' : 'UTILISATEUR',
        username,
        code,
        nouveauMotDePasse,
      });

      setSuccess('Votre mot de passe a bien été réinitialisé.');
      setStep(4);
      setCode('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de finaliser la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <AuthHeader title="Réinitialisation du mot de passe" />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-[#15aabf]" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#15aabf' }}>Réinitialisation du mot de passe</h1>
            <p className="text-xs text-slate-500">{formatTypeLabel(typeCompte)} - {promptText}</p>
          </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center text-xs font-medium">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleDemanderCode} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Nom d'utilisateur</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                  placeholder="Votre username"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Téléphone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                  placeholder="Ex : 22997000000"
                />
              </div>
            </div>

            {isStaff && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Structure</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    required
                    type="text"
                    value={structure}
                    onChange={(e) => setStructure(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                    placeholder="Code ou nom de la structure"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#15aabf] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{loading ? 'Envoi...' : 'Recevoir le code'}</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifierCode} className="space-y-4 text-xs">
            <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center gap-2.5 text-cyan-800 text-[11px]">
              <CheckCircle2 className="w-5 h-5 text-[#15aabf] shrink-0" />
              <span>Votre identité a été vérifiée. Saisissez le code reçu par email.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Code de vérification</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#15aabf] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Vérification...' : 'Valider le code'}</span>
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalisation} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="password"
                  value={nouveauMotDePasse}
                  onChange={(e) => setNouveauMotDePasse(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                  placeholder="8 caractères minimum"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="password"
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#15aabf] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}</span>
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Réinitialisation terminée</p>
            <p className="text-xs text-slate-500">Vous pouvez maintenant vous reconnecter avec votre nouveau mot de passe.</p>
            <a
              href={typeCompte === 'STAFF' ? '/connexion-staff' : '/login'}
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white rounded-xl font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </a>
          </div>
        )}
    </div>
      </main>

      <footer className="text-center text-[11px] text-slate-400">
        © Ministère de la Santé - République du Bénin
      </footer>
    </div>
  );
}