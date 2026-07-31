import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, UserPlus } from 'lucide-react';
import { authService } from '../../services/workflowService';

const retirerAccents = (texte) => texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const suggererUsername = (prenom, nom) => {
  const prefixePrenom = retirerAccents((prenom || '').trim()).slice(0, 3).toLowerCase();
  const nomNettoye = retirerAccents((nom || '').trim()).replace(/\s+/g, '').toLowerCase();
  return `${prefixePrenom}${nomNettoye}`;
};

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const donneesBrutes = sessionStorage.getItem('agentPreview');
    if (donneesBrutes) {
      const donnees = JSON.parse(donneesBrutes);
      setUsername(suggererUsername(donnees.prenom, donnees.nom));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    const matricule = localStorage.getItem('temp_matricule');
    const code = localStorage.getItem('temp_code');

    if (!matricule || !code) {
      setError("Veuillez d'abord vérifier votre matricule et votre code.");
      return;
    }

    try {
      setLoading(true);
      await authService.finalizeRegistration(matricule, code, username, password);
      localStorage.removeItem('temp_matricule');
      localStorage.removeItem('temp_code');
      navigate('/login');
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setError(err.response?.data?.message || 'Ce nom d\'utilisateur est déjà pris. Veuillez en saisir un autre.');
      } else if (status === 400) {
        setError(err.response?.data?.message || 'Mot de passe trop court ou champ manquant.');
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-slate-800">Inscription</h1>
          <p className="text-xs text-slate-500">Finalisez votre compte utilisateur</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

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
                placeholder="Choisissez un nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Suggestion : les 3 premières lettres de votre prénom suivies de votre nom (modifiable si vous préférez autre chose).
            </p>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirmez le mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Inscription...' : "S'inscrire"}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-[#15aabf] hover:underline">
            Retour à la vérification
          </Link>
        </div>
      </div>
    </div>
  );
}
