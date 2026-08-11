import React from 'react';

export default function AuthHeader({ title, subtitle = 'Ministère de la Santé — République du Bénin' }) {
  return (
    <header className="sticky top-0 z-30 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-row items-center justify-between gap-4 w-full">
      <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center">
        <img src="/logo_sante.png" alt="Logo Ministère" className="h-full w-auto object-contain" />
      </div>

      <div className="text-center px-2 flex-1 min-w-0">
        <h1 className="text-[11px] sm:text-lg lg:text-xl font-bold tracking-tight leading-tight" style={{ color: '#15aabf' }}>
          {title}
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>
      </div>

      <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center opacity-0 pointer-events-none hidden sm:flex">
        <img src="/logo_sante.png" alt="" className="h-full w-auto object-contain" />
      </div>
    </header>
  );
}