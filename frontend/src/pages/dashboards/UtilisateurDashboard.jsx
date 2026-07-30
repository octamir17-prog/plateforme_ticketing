import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Loader,
  CheckCircle,
  FilePlus2,
  Search,
  Send,
  Inbox,
} from 'lucide-react';
import api from '../../services/api';

export default function UtilisateurDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('suivi');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, soumis: 0, enCours: 0, clotures: 0 });
  const [relanceEnCours, setRelanceEnCours] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [ticketsRes, statsRes] = await Promise.all([
          api.get('/tickets'),
          api.get('/dashboard/utilisateur'),
        ]);

        const payload = ticketsRes.data?.data || ticketsRes.data || [];
        const mappedTickets = Array.isArray(payload) ? payload.map(mapTicket) : [];
        setTickets(mappedTickets);
        const dashboardStats = statsRes.data?.data || statsRes.data || {};
        setStats({
          total: dashboardStats.total ?? mappedTickets.length,
          soumis: dashboardStats.soumis ?? mappedTickets.filter((t) => t.statut === 'SOUMIS').length,
          enCours: dashboardStats.enCours ?? mappedTickets.filter((t) => t.statut === 'EN_COURS').length,
          clotures: dashboardStats.clotures ?? mappedTickets.filter((t) => t.statut === 'RESOLU').length,
        });
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Impossible de charger vos tickets.');
        setTickets([]);
        setStats({ total: 0, soumis: 0, enCours: 0, clotures: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const normalizeStatus = (value) => {
    const status = String(value || '').toUpperCase();
    if (status === 'CLOTURE' || status === 'CLOTUREE') return 'RESOLU';
    if (status === 'AFFECTE' || status === 'EN_COURS' || status === 'EN_TRAITEMENT') return 'EN_COURS';
    return 'SOUMIS';
  };

  const mapTicket = (raw) => ({
    id: raw.id,
    reference: raw.reference || `#${raw.id}`,
    titre: raw.titre || raw.sujet || '—',
    categorie: raw.categorie?.nom || raw.categorie || '—',
    date: formatDate(raw.dateCreation || raw.date),
    statut: normalizeStatus(raw.statut),
    raw,
  });

  const handleRelancer = async (ticketId) => {
    setRelanceEnCours(ticketId);
    try {
      await api.post(`/tickets/${ticketId}/relancer`);
      setFeedback('Relance envoyée au responsable.');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible d\'envoyer la relance.');
    } finally {
      setRelanceEnCours(null);
    }
  };

  const countTotal = stats.total ?? tickets.length;
  const countSoumis = stats.soumis ?? tickets.filter((t) => t.statut === 'SOUMIS').length;
  const countEnCours = stats.enCours ?? tickets.filter((t) => t.statut === 'EN_COURS').length;
  const countResolus = stats.clotures ?? tickets.filter((t) => t.statut === 'RESOLU').length;

  const statsConfig = [
    { key: 'TOUS', label: 'Total Tickets', value: countTotal, icon: FolderKanban, color: 'text-slate-700', bg: 'bg-slate-100', borderColor: 'border-slate-300' },
    { key: 'SOUMIS', label: 'Soumis', value: countSoumis, icon: Inbox, color: 'text-blue-600', bg: 'bg-slate-100', borderColor: 'border-slate-300' },
    { key: 'EN_COURS', label: 'En cours', value: countEnCours, icon: Loader, color: 'text-amber-600', bg: 'bg-slate-100', borderColor: 'border-slate-300' },
    { key: 'RESOLU', label: 'Résolus', value: countResolus, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-slate-100', borderColor: 'border-slate-300' },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchStatus = statusFilter === 'TOUS' || ticket.statut === statusFilter;
    const matchSearch = `${ticket.titre} ${ticket.reference}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-row items-center justify-between gap-4 w-full">
        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center">
          <img src="/logo_sante.png" alt="Logo Ministère" className="h-full w-auto object-contain" />
        </div>

        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-xs sm:text-lg lg:text-xl font-bold tracking-tight truncate" style={{ color: '#15aabf' }}>
            Bienvenue sur votre Espace Utilisateur
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">Ministère de la Santé — République du Bénin</p>
        </div>

        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center opacity-0 pointer-events-none hidden sm:flex">
          <img src="/logo_sante.png" alt="" className="h-full w-auto object-contain" />
        </div>
      </header>

      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('suivi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suivi' ? 'bg-[#15aabf] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mes Tickets
          </button>
        </div>

        <button
          onClick={() => navigate('/creer-ticket')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-4 sm:py-2.5 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:opacity-90 shrink-0 cursor-pointer"
          style={{ backgroundColor: '#15aabf' }}
        >
          <FilePlus2 className="w-4 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Nouveau ticket</span>
          <span className="xs:hidden">Créer ticket</span>
        </button>
      </div>

      {activeTab === 'suivi' && (
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
          )}
          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{feedback}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              const isSelected = statusFilter === stat.key;

              return (
                <button
                  key={stat.key}
                  onClick={() => setStatusFilter(stat.key)}
                  className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
                    isSelected ? `ring-2 ring-[#15aabf] ${stat.borderColor}` : 'border-slate-200 hover:border-slate-300'
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
                  {statusFilter === 'TOUS' && 'Tous les tickets'}
                  {statusFilter === 'SOUMIS' && 'Tickets Soumis'}
                  {statusFilter === 'EN_COURS' && 'Tickets En Cours'}
                  {statusFilter === 'RESOLU' && 'Tickets Résolus'}
                </h2>
                <p className="text-xs text-slate-500">Affichage de {filteredTickets.length} demande(s)</p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou ID..."
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
                    <th className="py-3 px-5">Titre</th>
                    <th className="py-3 px-5">Catégorie</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Chargement...</td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Aucun ticket trouvé pour cette sélection.</td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{ticket.reference}</td>
                        <td className="py-3.5 px-5 font-medium">{ticket.titre}</td>
                        <td className="py-3.5 px-5 text-slate-500">{ticket.categorie}</td>
                        <td className="py-3.5 px-5 text-slate-500">{ticket.date}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ticket.statut === 'RESOLU' ? 'bg-emerald-100 text-emerald-700' :
                              ticket.statut === 'EN_COURS' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {ticket.statut === 'RESOLU' ? 'Résolu' : ticket.statut === 'EN_COURS' ? 'En cours' : 'Soumis'}
                            </span>
                            {ticket.statut === 'SOUMIS' && (
                              <button
                                onClick={() => handleRelancer(ticket.id)}
                                disabled={relanceEnCours === ticket.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-3 h-3" />
                                {relanceEnCours === ticket.id ? 'Envoi...' : 'Relancer'}
                              </button>
                            )}
                          </div>
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
