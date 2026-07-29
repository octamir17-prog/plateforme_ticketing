import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { authService } from '../../services/workflowService';
import { useAuthStore } from '../../store/useAuthStore';

export default function StaffLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [typeCompte, setTypeCompte] = useState('TECHNICIEN');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setSubmitting(true);
      const res = await authService.login(username, motdepasse, typeCompte.toUpperCase());

      if (res && res.accessToken) {
        loginSuccess({ accessToken: res.accessToken, refreshToken: res.refreshToken, typeCompte: res.typeCompte, profil: res.profil });

        const userType = res.typeCompte;
        switch (userType) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'RESPONSABLE':
            navigate('/responsable/dashboard');
            break;
          case 'POINT_FOCAL':
            navigate('/point-focal/dashboard');
            break;
          case 'TECHNICIEN':
          default:
            navigate('/technicien/dashboard');
            break;
        }
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setErrorMsg('Identifiants incorrects.');
      } else if (status === 403) {
        setErrorMsg('Ce compte n\'est pas encore actif, utilisez le lien reçu par email.');
      } else {
        setErrorMsg('Une erreur s\'est produite lors de la connexion.');
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
            Espace Staff
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <h2 className="text-base font-bold text-slate-900">Connexion Staff</h2>
              <p className="text-xs text-slate-500">
                Accédez à votre espace professionnel de gestion.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type de compte
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={typeCompte}
                    onChange={(e) => setTypeCompte(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="TECHNICIEN">TECHNICIEN</option>
                    <option value="RESPONSABLE">RESPONSABLE</option>
                    <option value="POINT_FOCAL">POINT_FOCAL</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

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
                    placeholder="Saisissez votre nom d'utilisateur"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Se connecter</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-slate-200 bg-white text-center text-[11px] text-slate-400">
        © Ministère de la Santé - République du Bénin
      </footer>
    </div>
  );
}