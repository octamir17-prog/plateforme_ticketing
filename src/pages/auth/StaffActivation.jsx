import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react'
import { 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  User, 
  Building2, 
  Briefcase, 
  Mail, 
  Loader2, 
  KeyRound, 
  ArrowLeft 
} from 'lucide-react';
import api from '../../services/api';

export default function StaffActivation() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [dataActivation, setDataActivation] = useState(null);

  const [username, setUsername] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [confirmMotdepasse, setConfirmMotdepasse] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifierToken = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/auth/activation/${token}`);
        if (res.data && res.data.success) {
          setDataActivation(res.data.data);
        } else {
          setTokenInvalid(true);
        }
      } catch (err) {
        setTokenInvalid(true);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifierToken();
    } else {
      setTokenInvalid(true);
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (motdepasse.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (motdepasse !== confirmMotdepasse) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/auth/activation/${token}`, {
        username,
        motdepasse
      });

      if (res.data && res.data.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setErrorMsg(err.response?.data?.message || 'Mot de passe trop court ou champ manquant.');
      } else if (status === 409) {
        setErrorMsg('Ce nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.');
      } else if (status === 404 || status === 410) {
        setTokenInvalid(true);
      } else {
        setErrorMsg('Une erreur est survenue lors de l\'activation. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-amber-400">
              MS
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                Ministère de la Santé
              </h1>
              <p className="text-[11px] font-semibold text-cyan-700">
                République du Bénin
              </p>
            </div>
          </div>
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            Activation Staff
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Vérification du lien d'activation...</p>
            </div>
          ) : tokenInvalid ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">Lien non valide</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Ce lien n'est plus valide, a expiré ou a déjà été utilisé pour l'activation d'un compte.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à l'accueil</span>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-slate-900">Compte activé avec succès</h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Compte activé. Consultez votre boîte mail, vous y trouverez aussi ce lien.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/connexion-staff"
                  className="w-full inline-flex items-center justify-center px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <h2 className="text-base font-bold text-slate-900">Activation de votre compte</h2>
                <p className="text-xs text-slate-500">
                  Vérifiez vos informations ci-dessous puis configurez vos identifiants.
                </p>
              </div>

              {dataActivation && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">Agent</p>
                      <p className="text-xs font-bold text-slate-800">
                        {dataActivation.agent?.prenom} {dataActivation.agent?.nom}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400">Rôle</p>
                        <p className="text-xs font-semibold text-slate-700 uppercase">
                          {dataActivation.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400">Structure</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {dataActivation.structure?.codeStructure} - {dataActivation.structure?.designation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {dataActivation.agent?.email && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-600 font-medium">
                        {dataActivation.agent.email}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choisissez votre nom d'utilisateur"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mot de passe (8 caractères minimum)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={motdepasse}
                      onChange={(e) => setMotdepasse(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmMotdepasse}
                      onChange={(e) => setConfirmMotdepasse(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Activer mon compte</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 border-t border-slate-200 bg-white text-center text-[11px] text-slate-400">
        © Ministère de la Santé - République du Bénin
      </footer>
    </div>
  );
}