import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/workflowService';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import AuthHeader from '../../components/layout/AuthHeader';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loginSuccess = useAuthStore(state => state.loginSuccess);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(username, password, 'UTILISATEUR');
      if (res && res.accessToken) {
        loginSuccess({ accessToken: res.accessToken, refreshToken: res.refreshToken, typeCompte: res.typeCompte, profil: res.profil });
        navigate('/utilisateur/dashboard');
      } else {
        setError('Échec de l\'authentification.');
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect.');
      } else if (status === 403) {
        setError('Ce compte est désactivé ou pas encore activé.');
      } else if (!err.response) {
        setError('Serveur injoignable. Vérifiez votre connexion et réessayez.');
      } else {
        setError('Une erreur s\'est produite lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <AuthHeader title="Bienvenue sur l'espace de connexion utilisateur" />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold" style={{ color: '#15aabf' }}>Connexion</h2>
            <p className="text-xs text-slate-500">Accédez à votre espace utilisateur</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:opacity-90 cursor-pointer mt-2 disabled:opacity-50"
              style={{ backgroundColor: '#15aabf' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          <div className="text-center text-[11px] text-slate-500">
            <a href="/mot-de-passe-oublie?type=UTILISATEUR" className="font-semibold text-[#15aabf] hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

       </div>
      </main>

      <footer className="text-center text-[11px] text-slate-400">
        © Ministère de la Santé - République du Bénin
      </footer>
    </div>
  );
}