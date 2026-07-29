import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Loader, 
  CheckCircle, 
  FilePlus2, 
  Search, 
  BellRing, 
  ArrowRight,
  Check,
  Inbox,
  RotateCw 
} from 'lucide-react';

export default function UtilisateurDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('suivi');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Votre ticket #TICK-8021 est pris en charge par un technicien.", date: "Il y a 10 min", lu: false },
    { id: 2, message: "Le ticket #TICK-7984 a été marqué comme Résolu.", date: "Hier à 14:30", lu: false },
    { id: 3, message: "Bienvenue sur la plateforme de ticketing du Ministère.", date: "20/07/2026", lu: true },
  ]);

  const unreadCount = notifications.filter(n => !n.lu).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const tickets = [
    { id: 'TICK-8025', sujet: 'Demande de renouvellement de toner imprimante', categorie: 'Matériel', date: '23/07/2026', statut: 'SOUMIS' },
    { id: 'TICK-8021', sujet: 'Panne de connexion réseau au 2ème étage', categorie: 'Réseau / Wifi', date: '22/07/2026', statut: 'EN_COURS' },
    { id: 'TICK-7984', sujet: 'Imprimante HP non détectée', categorie: 'Matériel', date: '19/07/2026', statut: 'RESOLU' },
    { id: 'TICK-7890', sujet: 'Problème d\'accès au logiciel métier', categorie: 'Logiciel', date: '15/07/2026', statut: 'RESOLU' },
  ];
  
  const handleRelancer = (ticketId) => {
    alert(`Rappel envoyé pour le ticket ${ticketId}`);
  };

  const countTotal = tickets.length;
  const countSoumis = tickets.filter(t => t.statut === 'SOUMIS').length;
  const countEnCours = tickets.filter(t => t.statut === 'EN_COURS').length;
  const countResolus = tickets.filter(t => t.statut === 'RESOLU').length;

  const statsConfig = [
    { 
      key: 'TOUS', 
      label: 'Total Tickets', 
      value: countTotal, 
      icon: FolderKanban, 
      color: 'text-slate-700', 
      bg: 'bg-slate-100',
      borderColor: 'border-slate-300'
    },
    { 
      key: 'SOUMIS', 
      label: 'Soumis', 
      value: countSoumis, 
      icon: Inbox, 
      color: 'text-blue-600', 
      bg: 'bg-slate-100',
      borderColor: 'border-slate-300'
    },
    { 
      key: 'EN_COURS', 
      label: 'En cours', 
      value: countEnCours, 
      icon: Loader, 
      color: 'text-amber-600', 
      bg: 'bg-slate-100',
      borderColor: 'border-slate-300'
    },
    { 
      key: 'RESOLU', 
      label: 'Résolus', 
      value: countResolus, 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-slate-100',
      borderColor: 'border-slate-300'
    },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchStatus = statusFilter === 'TOUS' || ticket.statut === statusFilter;
    const matchSearch = ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      
      <header className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-row items-center justify-between gap-4 w-full">
        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center">
          <img 
            src="/logo_sante.png" 
            alt="Logo Ministère" 
            className="h-full w-auto object-contain"
          />
        </div>

        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-xs sm:text-lg lg:text-xl font-bold tracking-tight truncate" style={{ color: '#15aabf' }}>
            Bienvenue sur votre Espace Technicien
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">
            Ministère de la Santé — République du Bénin
          </p>
        </div>

        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center opacity-0 pointer-events-none hidden sm:flex">
          <img 
            src="/logo_sante.png" 
            alt="" 
            className="h-full w-auto object-contain"
          />
        </div>
      </header>

      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
  <div className="flex items-center gap-2">
    <button
      onClick={() => setActiveTab('suivi')}
      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
        activeTab === 'suivi'
          ? 'bg-[#15aabf] text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      Mes Tickets
    </button>
  </div>

  <button
    onClick={() => navigate('/creer-ticket')}
    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:opacity-90 shrink-0 cursor-pointer"
    style={{ backgroundColor: '#15aabf' }}
  >
    <FilePlus2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span className="hidden xs:inline">Nouveau ticket</span>
    <span className="xs:hidden">Créer ticket</span>
  </button>
</div>

      {activeTab === 'suivi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              const isSelected = statusFilter === stat.key;

              return (
                <button
                  key={stat.key}
                  onClick={() => setStatusFilter(stat.key)}
                  className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
                    isSelected 
                      ? `ring-2 ring-[#15aabf] ${stat.borderColor}` 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {statusFilter === 'TOUS' && "Tous les tickets"}
                  {statusFilter === 'SOUMIS' && "Tickets Soumis"}
                  {statusFilter === 'EN_COURS' && "Tickets En Cours"}
                  {statusFilter === 'RESOLU' && "Tickets Résolus"}
                </h2>
                <p className="text-xs text-slate-500">
                  Affichage de {filteredTickets.length} demande(s)
                </p>
              </div>
              
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par sujet ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">ID Ticket</th>
                    <th className="py-3 px-5">Sujet</th>
                    <th className="py-3 px-5">Catégorie</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Statut</th>
                    <th className="py-3 px-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Aucun ticket trouvé pour cette sélection.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{ticket.id}</td>
                        <td className="py-3.5 px-5 font-medium">{ticket.sujet}</td>
                        <td className="py-3.5 px-5 text-slate-500">{ticket.categorie}</td>
                        <td className="py-3.5 px-5 text-slate-500">{ticket.date}</td>
                        <td className="py-3.5 px-0">
                          <td className="py-3.5 px-5 text-right">
                            {ticket.statut === 'SOUMIS' && (
                              <button
                                onClick={() => handleRelancer(ticket.id)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              >
                                Relancer
                              </button> 
                          )}
                        </td>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ticket.statut === 'RESOLU' ? 'bg-emerald-100 text-emerald-700' :
                            ticket.statut === 'EN_COURS' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {ticket.statut === 'RESOLU' ? 'Résolu' : 
                             ticket.statut === 'EN_COURS' ? 'En cours' : 'Soumis'}
                          </span>
                        </td>
                        <td className="py-3.5 px-0 text-right">
                          <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}