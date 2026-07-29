import React, { useState } from 'react';
import { 
  Wrench, 
  Play, 
  CheckCircle2, 
  Clock, 
  Search, 
  User, 
  X,
  AlertCircle,
  Folder,
  ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';

export default function TechnicienDashboard() {
  const [filter, setFilter] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentaireCloture, setCommentaireCloture] = useState('');
  const [motifEscalade, setMotifEscalade] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEscaladeModalOpen, setIsEscaladeModalOpen] = useState(false);

  const [tickets, setTickets] = useState([
    {
      id: 101,
      reference: 'TCK-2026-001',
      titre: 'Panne de connexion réseau au 2ème étage',
      description: 'Le switch principal du couloir B ne répond plus depuis ce matin.',
      statut: 'AFFECTE',
      dateCreation: '26/07/2026',
      categorie: { id: 2, nom: 'Réseau' },
      agent: { matricule: 'AG-894', nom: 'KPOHINTO', prenom: 'Jean-Marc', numero: '+229 97000000', structureId: 1 },
      affectation: {
        id: 12,
        statut: 'EN_ATTENTE',
        priorite: 'HAUTE',
        dateAffectation: '26/07/2026 09:00',
        technicienId: 5,
        responsableId: 2,
        recuParEscalade: false
      }
    },
    {
      id: 102,
      reference: 'TCK-2026-004',
      titre: 'Imprimante HP non détectée',
      description: 'Pilote manquant suite à la mise à jour Windows.',
      statut: 'EN_COURS',
      dateCreation: '25/07/2026',
      categorie: { id: 1, nom: 'Matériel' },
      agent: { matricule: 'AG-312', nom: 'SOSSOU', prenom: 'Carine', numero: '+229 96112233', structureId: 1 },
      affectation: {
        id: 15,
        statut: 'EN_TRAITEMENT',
        priorite: 'MOYENNE',
        dateAffectation: '25/07/2026 14:30',
        technicienId: 5,
        responsableId: 2,
        recuParEscalade: false
      }
    }
  ]);

  const stats = {
    total: tickets.length,
    affectes: tickets.filter(t => t.affectation.statut === 'EN_ATTENTE').length,
    enTraitement: tickets.filter(t => t.affectation.statut === 'EN_TRAITEMENT').length,
    escalades: tickets.filter(t => t.affectation.statut === 'ESCALADE').length,
    clotures: tickets.filter(t => t.affectation.statut === 'CLOTUREE').length
  };

  const handleDemarrer = async (affectationId) => {
    try {
      await api.post(`/affectations/${affectationId}/demarrer`);
      setTickets(prev => prev.map(t => 
        t.affectation.id === affectationId 
          ? { ...t, affectation: { ...t.affectation, statut: 'EN_TRAITEMENT' } } 
          : t
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du démarrage du traitement.');
    }
  };

  const handleCloturer = async (e) => {
    e.preventDefault();
    if (!selectedTicket?.affectation?.id) return;

    const affectationId = selectedTicket.affectation.id;

    try {
      await api.post(`/affectations/${affectationId}/cloturer`, {
        commentaire: commentaireCloture || undefined
      });
      setTickets(prev => prev.map(t => 
        t.affectation.id === affectationId 
          ? { ...t, affectation: { ...t.affectation, statut: 'CLOTUREE' } } 
          : t
      ));
      setIsModalOpen(false);
      setSelectedTicket(null);
      setCommentaireCloture('');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la clôture du ticket.');
    }
  };

  const handleEscalader = async (e) => {
    e.preventDefault();
    if (!selectedTicket?.affectation?.id) return;

    const affectationId = selectedTicket.affectation.id;

    try {
      await api.post(`/affectations/${affectationId}/escalader`, {
        motif: motifEscalade
      });
      setTickets(prev => prev.map(t => 
        t.affectation.id === affectationId 
          ? { ...t, affectation: { ...t.affectation, statut: 'ESCALADE' } } 
          : t
      ));
      setIsEscaladeModalOpen(false);
      setSelectedTicket(null);
      setMotifEscalade('');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'escalade du ticket.');
    }
  };

  const openClotureModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const openEscaladeModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsEscaladeModalOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchFilter = 
      filter === 'TOUS' || 
      (filter === 'EN_ATTENTE' && ticket.affectation.statut === 'EN_ATTENTE') ||
      (filter === 'EN_TRAITEMENT' && ticket.affectation.statut === 'EN_TRAITEMENT') ||
      (filter === 'ESCALADE' && ticket.affectation.statut === 'ESCALADE') ||
      (filter === 'CLOTUREE' && ticket.affectation.statut === 'CLOTUREE');

    const matchSearch = 
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.agent.nom.toLowerCase().includes(searchTerm.toLowerCase());

    return matchFilter && matchSearch;
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setFilter('TOUS')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 cursor-pointer hover:border-[#15aabf] hover:shadow-sm ${
            filter === 'TOUS'
              ? 'bg-white border-[#15aabf] ring-2 ring-[#15aabf]/20 shadow-sm'
              : 'bg-white border-slate-200'
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
          className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 cursor-pointer hover:border-[#15aabf] hover:shadow-sm ${
            filter === 'EN_ATTENTE'
              ? 'bg-white border-[#15aabf] ring-2 ring-[#15aabf]/20 shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.affectes}</p>
            <p className="text-xs text-slate-500 font-medium">À démarrer</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('EN_TRAITEMENT')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 cursor-pointer hover:border-[#15aabf] hover:shadow-sm ${
            filter === 'EN_TRAITEMENT'
              ? 'bg-white border-[#15aabf] ring-2 ring-[#15aabf]/20 shadow-sm'
              : 'bg-white border-slate-200'
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
          className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 cursor-pointer hover:border-[#15aabf] hover:shadow-sm ${
            filter === 'ESCALADE'
              ? 'bg-white border-[#15aabf] ring-2 ring-[#15aabf]/20 shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.escalades}</p>
            <p className="text-xs text-slate-500 font-medium">Escaladés</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('CLOTUREE')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 cursor-pointer hover:border-[#15aabf] hover:shadow-sm ${
            filter === 'CLOTUREE'
              ? 'bg-white border-[#15aabf] ring-2 ring-[#15aabf]/20 shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.clotures}</p>
            <p className="text-xs text-slate-500 font-medium">Clôturés</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {filter === 'TOUS' && 'Tous les tickets'}
              {filter === 'EN_ATTENTE' && 'Tickets à démarrer'}
              {filter === 'EN_TRAITEMENT' && 'Tickets en cours de traitement'}
              {filter === 'ESCALADE' && 'Tickets escaladés'}
              {filter === 'CLOTUREE' && 'Tickets clôturés'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
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
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Aucun ticket trouvé pour ce filtre.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">ID Ticket</th>
                  <th className="py-3.5 px-6">Sujet</th>
                  <th className="py-3.5 px-6">Demandeur</th>
                  <th className="py-3.5 px-6">Catégorie</th>
                  <th className="py-3.5 px-6">Statut</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                      {ticket.reference}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800 max-w-xs">
                      <p className="line-clamp-1">{ticket.titre}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 font-normal">{ticket.description}</p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.agent.nom} {ticket.agent.prenom}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        {ticket.categorie.nom}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        ticket.affectation.statut === 'EN_TRAITEMENT' ? 'bg-amber-100 text-amber-700' :
                        ticket.affectation.statut === 'CLOTUREE' ? 'bg-emerald-100 text-emerald-700' :
                        ticket.affectation.statut === 'ESCALADE' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.affectation.statut === 'EN_TRAITEMENT' ? 'En cours' :
                         ticket.affectation.statut === 'CLOTUREE' ? 'Clôturé' :
                         ticket.affectation.statut === 'ESCALADE' ? 'Escaladé' : 'À démarrer'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {ticket.affectation.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleDemarrer(ticket.affectation.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Démarrer</span>
                            </button>
                            <button
                              onClick={() => openEscaladeModal(ticket)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Escalader</span>
                            </button>
                          </>
                        )}

                        {ticket.affectation.statut === 'EN_TRAITEMENT' && (
                          <>
                            <button
                              onClick={() => openClotureModal(ticket)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Clôturer</span>
                            </button>
                            <button
                              onClick={() => openEscaladeModal(ticket)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Escalader</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Clôturer le ticket #{selectedTicket?.reference}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloturer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rapport de résolution / Commentaire (Optionnel)
                </label>
                <textarea
                  rows="4"
                  placeholder="Expliquez la solution apportée..."
                  value={commentaireCloture}
                  onChange={(e) => setCommentaireCloture(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Confirmer la clôture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEscaladeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Escalader le ticket #{selectedTicket?.reference}
              </h3>
              <button 
                onClick={() => setIsEscaladeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEscalader} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif de l'escalade
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Précisez la raison pour laquelle vous transférez ce ticket au responsable..."
                  value={motifEscalade}
                  onChange={(e) => setMotifEscalade(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEscaladeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors cursor-pointer"
                >
                  Confirmer l'escalade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}