import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      setAuth({
        accessToken: 'fake-jwt-token',
        typeCompte: 'UTILISATEUR',
        profil: { username }
      });

      navigate('/utilisateur/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="text-center space-y-2">
         
          <h1 className="text-xl font-bold text-slate-800" style={{ color: '#15aabf' }}>Connexion</h1>
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
            className="w-full flex items-center justify-center gap-2 py-3 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:opacity-90 cursor-pointer mt-2"
            style={{ backgroundColor: '#15aabf' }}
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter</span>
          </button>
        </form>

      </div>
    </div>
  );
}