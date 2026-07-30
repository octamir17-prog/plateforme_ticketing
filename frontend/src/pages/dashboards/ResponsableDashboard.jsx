import React, { useEffect, useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Search,
  User,
  UserPlus,
  AlertCircle,
  Folder,
  ArrowRightLeft,
  ArrowUpRight,
  Undo2,
  X,
} from 'lucide-react';
import api from '../../services/api';

export default function ResponsableDashboard() {
  const [filter, setFilter] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [tickets, setTickets] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [structuresCibles, setStructuresCibles] = useState([]);

  const [ticketActif, setTicketActif] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(null);
  const [nouveauTechnicienId, setNouveauTechnicienId] = useState('');
  const [priorite, setPriorite] = useState('');
  const [codeStructureCible, setCodeStructureCible] = useState('');
  const [raison, setRaison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const structureResponsable = JSON.parse(sessionStorage.getItem('user') || '{}')?.structureId;

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      const payload = res.data?.data || res.data || [];
      setTickets(Array.isArray(payload) ? payload : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechniciens = async () => {
    try {
      const res = await api.get('/techniciens');
      const payload = res.data?.data || res.data || [];
      setTechniciens(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setTechniciens([]);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchTechniciens();
  }, []);

  const stats = {
    total: tickets.length,
    enAttente: tickets.filter((t) => !t.affectation || t.affectation.statut === 'EN_ATTENTE').length,
    enTraitement: tickets.filter((t) => t.affectation?.statut === 'EN_TRAITEMENT').length,
    escalades: tickets.filter((t) => t.affectation?.recuParEscalade).length,
    clotures: tickets.filter((t) => t.affectation?.statut === 'CLOTUREE').length,
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchFilter =
      filter === 'TOUS' ||
      (filter === 'EN_ATTENTE' && (!ticket.affectation || ticket.affectation.statut === 'EN_ATTENTE')) ||
      (filter === 'EN_TRAITEMENT' && ticket.affectation?.statut === 'EN_TRAITEMENT') ||
      (filter === 'ESCALADE' && ticket.affectation?.recuParEscalade) ||
      (filter === 'CLOTUREE' && ticket.affectation?.statut === 'CLOTUREE');

    const matchSearch = `${ticket.titre} ${ticket.reference} ${ticket.agent?.nom || ''} ${ticket.agent?.prenom || ''}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchFilter && matchSearch;
  });

  const reinitialiserModale = () => {
    setModaleOuverte(null);
    setTicketActif(null);
    setNouveauTechnicienId('');
    setPriorite('');
    setCodeStructureCible('');
    setRaison('');
    setCommentaire('');
  };

  const ouvrirAffectation = (ticket) => {
    setTicketActif(ticket);
    setModaleOuverte('affecter');
  };

  const ouvrirTransfert = (ticket) => {
    setTicketActif(ticket);
    setModaleOuverte('transferer');
  };

  const ouvrirEscalade = async (ticket) => {
    setTicketActif(ticket);
    setModaleOuverte('escalader');
    if (structureResponsable) {
      try {
        const res = await api.get(`/structures/${structureResponsable}/escaladables`);
        const payload = res.data?.data || res.data || [];
        setStructuresCibles(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setStructuresCibles([]);
      }
    }
  };

  const ouvrirRetour = (ticket) => {
    setTicketActif(ticket);
    setModaleOuverte('retourner');
  };

  const handleAffecter = async (e) => {
    e.preventDefault();
    if (!ticketActif?.affectation?.id || !nouveauTechnicienId || !priorite) return;

    setEnvoiEnCours(true);
    try {
      await api.patch(`/affectations/${ticketActif.affectation.id}/assigner-technicien`, {
        technicienId: Number(nouveauTechnicienId),
        priorite,
      });
      setFeedback('Technicien affecte avec succes.');
      reinitialiserModale();
      fetchTickets();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible d\'affecter ce technicien.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleTransferer = async (e) => {
    e.preventDefault();
    if (!ticketActif?.affectation?.id || !nouveauTechnicienId || !raison) return;

    setEnvoiEnCours(true);
    try {
      await api.post(`/affectations/${ticketActif.affectation.id}/transferer`, {
        nouveauTechnicienId: Number(nouveauTechnicienId),
        raisonTransfert: raison,
        commentaireTransfert: commentaire || undefined,
      });
      setFeedback('Ticket transféré avec succès.');
      reinitialiserModale();
      fetchTickets();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible de transférer ce ticket.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleEscalader = async (e) => {
    e.preventDefault();
    if (!ticketActif?.affectation?.id || !codeStructureCible) return;

    setEnvoiEnCours(true);
    try {
      await api.post(`/affectations/${ticketActif.affectation.id}/escalader`, {
        codeStructureCible,
        raisonEscalade: raison || undefined,
        commentaireEscalade: commentaire || undefined,
      });
      setFeedback('Ticket escaladé avec succès.');
      reinitialiserModale();
      fetchTickets();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible d\'escalader ce ticket.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleRetourner = async (e) => {
    e.preventDefault();
    if (!ticketActif?.affectation?.id || !raison) return;

    setEnvoiEnCours(true);
    try {
      await api.post(`/affectations/${ticketActif.affectation.id}/retourner`, {
        raisonRetour: raison,
        commentaireRetour: commentaire || undefined,
      });
      setFeedback('Ticket retourné à la structure d\'origine.');
      reinitialiserModale();
      fetchTickets();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible de retourner ce ticket.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const techniciensDisponibles = techniciens.filter(
    (t) => t.actif !== false && t.id !== ticketActif?.affectation?.technicienId
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-row items-center justify-between gap-4 w-full">
        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center">
          <img src="/logo_sante.png" alt="Logo Ministère" className="h-full w-auto object-contain" />
        </div>

        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-xs sm:text-lg lg:text-xl font-bold tracking-tight truncate" style={{ color: '#15aabf' }}>
            Bienvenue sur votre Espace Responsable équipe technique
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">Ministère de la Santé — République du Bénin</p>
        </div>

        <div className="h-9 sm:h-12 w-auto shrink-0 flex items-center opacity-0 pointer-events-none hidden sm:flex">
          <img src="/logo_sante.png" alt="" className="h-full w-auto object-contain" />
        </div>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}
      {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{feedback}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setFilter('TOUS')}
          className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
            filter === 'TOUS' ? 'ring-2 ring-[#15aabf] border-slate-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500 font-medium">Total Tickets</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('EN_ATTENTE')}
          className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
            filter === 'EN_ATTENTE' ? 'ring-2 ring-[#15aabf] border-slate-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.enAttente}</p>
            <p className="text-xs text-slate-500 font-medium">En attente</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('EN_TRAITEMENT')}
          className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
            filter === 'EN_TRAITEMENT' ? 'ring-2 ring-[#15aabf] border-slate-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.enTraitement}</p>
            <p className="text-xs text-slate-500 font-medium">En cours</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('ESCALADE')}
          className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
            filter === 'ESCALADE' ? 'ring-2 ring-[#15aabf] border-slate-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.escalades}</p>
            <p className="text-xs text-slate-500 font-medium">Reçus par escalade</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('CLOTUREE')}
          className={`bg-white p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md ${
            filter === 'CLOTUREE' ? 'ring-2 ring-[#15aabf] border-slate-300' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.clotures}</p>
            <p className="text-xs text-slate-500 font-medium">Résolus</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {filter === 'TOUS' && 'Gestion de l’ensemble des tickets'}
              {filter === 'EN_ATTENTE' && 'Tickets en attente d’affectation'}
              {filter === 'EN_TRAITEMENT' && 'Tickets en cours de traitement'}
              {filter === 'ESCALADE' && 'Tickets reçus par escalade'}
              {filter === 'CLOTUREE' && 'Tickets clôturés'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Affichage de {filteredTickets.length} demande(s)</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Chargement...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Aucun ticket trouvé pour cette catégorie.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">ID Ticket</th>
                  <th className="py-3.5 px-6">Sujet</th>
                  <th className="py-3.5 px-6">Demandeur</th>
                  <th className="py-3.5 px-6">Catégorie</th>
                  <th className="py-3.5 px-6">Technicien</th>
                  <th className="py-3.5 px-6">Statut</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTickets.map((ticket) => {
                  const affectation = ticket.affectation;
                  const estCloture = affectation?.statut === 'CLOTUREE';
                  const aUnTechnicien = Boolean(affectation?.technicienId);
                  const recuParEscalade = Boolean(affectation?.recuParEscalade);

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">{ticket.reference}</td>
                      <td className="py-4 px-6 font-medium text-slate-800 max-w-xs">
                        <p className="line-clamp-1">{ticket.titre}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 font-normal">{ticket.description}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.agent?.nom} {ticket.agent?.prenom}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{ticket.categorie?.nom}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-600">
                          {affectation?.technicien ? `${affectation.technicien.nom || ''} ${affectation.technicien.prenom || ''}`.trim() || affectation.technicien.username : <span className="text-slate-400 italic">Non assigné</span>}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          affectation?.statut === 'EN_TRAITEMENT' ? 'bg-amber-100 text-amber-700' :
                          recuParEscalade ? 'bg-purple-100 text-purple-700' :
                          affectation?.statut === 'CLOTUREE' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {affectation?.statut === 'EN_TRAITEMENT' ? 'En cours' :
                           affectation?.statut === 'CLOTUREE' ? 'Résolu' :
                           recuParEscalade ? 'Reçu par escalade' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        {!estCloture && (
                          <div className="inline-flex items-center justify-end gap-2">
                            {!aUnTechnicien && (
                              <button
                                onClick={() => ouvrirAffectation(ticket)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Affecter</span>
                              </button>
                            )}

                            {aUnTechnicien && (
                              <button
                                onClick={() => ouvrirTransfert(ticket)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Transférer</span>
                              </button>
                            )}

                            {recuParEscalade && (
                              <button
                                onClick={() => ouvrirRetour(ticket)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>Retourner</span>
                              </button>
                            )}

                            <button
                              onClick={() => ouvrirEscalade(ticket)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Escalader</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modaleOuverte === 'affecter' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Affecter le ticket #{ticketActif?.reference}</h3>
              <button onClick={reinitialiserModale} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAffecter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technicien</label>
                <select
                  required
                  value={nouveauTechnicienId}
                  onChange={(e) => setNouveauTechnicienId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                >
                  <option value="">Sélectionner...</option>
                  {techniciens.filter((t) => t.actif !== false).map((t) => (
                    <option key={t.id} value={t.id}>{t.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priorité</label>
                <select
                  required
                  value={priorite}
                  onChange={(e) => setPriorite(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                >
                  <option value="">Sélectionner...</option>
                  <option value="BASSE">Basse</option>
                  <option value="NORMALE">Normale</option>
                  <option value="HAUTE">Haute</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={reinitialiserModale} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={envoiEnCours} className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                  {envoiEnCours ? 'Envoi...' : 'Confirmer l\'affectation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modaleOuverte === 'transferer' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Transférer le ticket #{ticketActif?.reference}</h3>
              <button onClick={reinitialiserModale} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nouveau technicien</label>
                <select
                  required
                  value={nouveauTechnicienId}
                  onChange={(e) => setNouveauTechnicienId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                >
                  <option value="">Sélectionner...</option>
                  {techniciensDisponibles.map((t) => (
                    <option key={t.id} value={t.id}>{t.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Raison du transfert</label>
                <textarea
                  rows="3"
                  required
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commentaire (Optionnel)</label>
                <textarea
                  rows="2"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={reinitialiserModale} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={envoiEnCours} className="px-4 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                  {envoiEnCours ? 'Envoi...' : 'Confirmer le transfert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modaleOuverte === 'escalader' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Escalader le ticket #{ticketActif?.reference}</h3>
              <button onClick={reinitialiserModale} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEscalader} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Structure cible</label>
                <select
                  required
                  value={codeStructureCible}
                  onChange={(e) => setCodeStructureCible(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                >
                  <option value="">Sélectionner...</option>
                  {structuresCibles.map((s) => (
                    <option key={s.codeStructure} value={s.codeStructure}>{s.designation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motif de l'escalade</label>
                <textarea
                  rows="3"
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  placeholder="Précisez la raison pour laquelle vous transférez ce ticket au niveau supérieur..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commentaire (Optionnel)</label>
                <textarea
                  rows="2"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={reinitialiserModale} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={envoiEnCours} className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                  {envoiEnCours ? 'Envoi...' : 'Confirmer l\'escalade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modaleOuverte === 'retourner' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Retourner le ticket #{ticketActif?.reference}</h3>
              <button onClick={reinitialiserModale} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRetourner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Raison du retour</label>
                <textarea
                  rows="3"
                  required
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  placeholder="Précisez pourquoi ce ticket ne relève pas de votre structure..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commentaire (Optionnel)</label>
                <textarea
                  rows="2"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={reinitialiserModale} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={envoiEnCours} className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                  {envoiEnCours ? 'Envoi...' : 'Confirmer le retour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
