import React, { useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import PasswordChangeModal from '../PasswordChangeModal';

export default function DashboardHeader({ title, subtitle, onLogout, actions }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-row items-center justify-between gap-4 w-full">
        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center">
          <img src="/logo_sante.png" alt="Logo Ministère" className="h-full w-auto object-contain" />
        </div>

        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-xs sm:text-lg lg:text-xl font-bold tracking-tight truncate" style={{ color: '#15aabf' }}>
            {title}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">
            {subtitle || 'Ministère de la Santé — République du Bénin'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-xs rounded-xl cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modifier votre mot de passe</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-white bg-slate-700 hover:bg-slate-800 font-semibold text-xs rounded-xl cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}