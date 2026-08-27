import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Loader,
  CheckCircle,
  FilePlus2,
  Search,
  Send,
  Inbox,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/workflowService';
import DashboardHeader from '../../components/layout/DashboardHeader';

export default function UtilisateurDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('suivi');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, soumis: 0, enCours: 0, clotures: 0 });
  const [toast, setToast] = useState(null);
  const [ticketsAvertis, setTicketsAvertis] = useState(new Set());
  const [relanceEnCours, setRelanceEnCours] = useState(null);
  const toastTimerRef = useRef(null);
  
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

  const loadDashboard = async (showLoading = false) => {
  try {
    if (showLoading) {
      setLoading(true);
    }

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

    if (showLoading) {
      setTickets([]);
      setStats({ total: 0, soumis: 0, enCours: 0, clotures: 0 });
    }
  } finally {
    if (showLoading) {
      setLoading(false);
    }
  }
};

useEffect(() => {
  // Chargement initial
  loadDashboard(true);

  // Actualisation automatique toutes les 20 secondes
  const interval = setInterval(() => {
    loadDashboard(false);
  }, 20000);

  return () => clearInterval(interval);
}, []);

  const UNE_HEURE_MS = 60 * 60 * 1000;

  const afficherToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  };

  const handleRelancer = async (ticket) => {
    const dateCreation = new Date(ticket.raw?.dateCreation);
    const ticketRecent = !Number.isNaN(dateCreation.getTime()) && (Date.now() - dateCreation.getTime()) < UNE_HEURE_MS;

    if (ticketRecent && !ticketsAvertis.has(ticket.id)) {
      setTicketsAvertis((prev) => new Set(prev).add(ticket.id));
      afficherToast('info', 'Votre ticket vient d\'être soumis. Merci de patienter, il sera pris en charge dans les plus brefs délais. Vous pouvez tout de même relancer si vous le souhaitez.');
      return;
    }

    setRelanceEnCours(ticket.id);
    try {
      await api.post(`/tickets/${ticket.id}/relancer`);
      afficherToast('success', 'Votre relance a bien été transmise au responsable. Merci pour votre patience.');
    } catch (err) {
      if (err.response?.status === 429) {
        afficherToast('info', 'Vous avez déjà relancé ce ticket récemment. Une seule relance est possible toutes les 24 heures. Soyez assuré(e) qu\'il sera pris en charge dans les plus brefs délais.');
      } else {
        afficherToast('error', err.response?.data?.message || 'Impossible d\'envoyer la relance.');
      }
    } finally {
      setRelanceEnCours(null);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
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
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className={`flex items-start gap-3 rounded-2xl border shadow-lg px-4 py-3.5 text-xs font-medium ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-cyan-50 border-cyan-200 text-cyan-800'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {toast.type === 'info' && <Clock className="w-4 h-4 mt-0.5 shrink-0" />}
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button onClick={() => setToast(null)} className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <DashboardHeader title="Bienvenue sur votre Espace Utilisateur" onLogout={handleLogout} />

      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-sm font-bold text-slate-800">Mes Tickets</h2>
        </div>

       <div className="flex items-center gap-2">
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
      </div>

      {activeTab === 'suivi' && (
        <div className="space-y-6">
         {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
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
                            {ticket.statut !== 'RESOLU' && (
                              <button
                                onClick={() => handleRelancer(ticket)}
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
