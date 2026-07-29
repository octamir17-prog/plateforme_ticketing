import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; // Ajuste le chemin selon ton projet

export const NAV_LINKS = [
  { path: '/', label: 'Vérification' },
  { path: '/home', label: 'Home (Agent)' },
  { path: '/login', label: 'Connexion' },
  { path: '/inscription', label: 'Inscription' },
  { path: '/creer-ticket', label: 'Créer Ticket' },
  { path: '/utilisateur/dashboard', label: 'Dashboard Utilisateur' },
  { path: '/technicien/dashboard', label: 'Dashboard Technicien' },
  { path: '/responsable/dashboard', label: 'Dashboard Responsable' },
  { path: '/point-focal/dashboard', label: 'Dashboard Point Focal' },
  { path: '/admin/dashboard', label: 'Dashboard Admin' },
];

export default function PageViewerNav() {
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleNavClick = (path) => {
    let role = null;
    if (path.includes('admin')) role = 'ADMIN';
    else if (path.includes('responsable')) role = 'RESPONSABLE';
    else if (path.includes('technicien')) role = 'TECHNICIEN';
    else if (path.includes('point-focal')) role = 'POINT_FOCAL';
    else if (path.includes('utilisateur')) role = 'UTILISATEUR';

    if (role && setAuth) {
      setAuth({
        accessToken: 'dev-token',
        typeCompte: role,
        user: { nom: 'Mode Dev' }
      });
    }
  };

  return (
    <nav className="bg-slate-900 text-white text-xs px-4 py-2.5 flex items-center gap-2 overflow-x-auto shadow-md sticky top-0 z-50">
      <span className="font-bold text-[#15aabf] shrink-0 mr-2">Nav Dev :</span>

      <Link to="/connexion-staff">Connexion Staff</Link>
<Link to="/activation/test-token-123">Test Activation</Link>

      <div className="flex items-center gap-1.5 shrink-0">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-[#15aabf] text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}