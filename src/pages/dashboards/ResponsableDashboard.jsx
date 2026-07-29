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
  Send,
  ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';

export default function ResponsableDashboard() {
  const [filter, setFilter] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tickets, setTickets] = useState([]);

  const stats = {
    total: tickets.length,
    enAttente: tickets.filter(t => !t.affectation || t.affectation.statut === 'EN_ATTENTE').length,
    enTraitement: tickets.filter(t => t.affectation?.statut === 'EN_TRAITEMENT').length,
    escalades: tickets.filter(t => t.affectation?.statut === 'ESCALADE').length,
    clotures: tickets.filter(t => t.affectation?.statut === 'CLOTUREE').length
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchFilter = 
      filter === 'TOUS' || 
      (filter === 'EN_ATTENTE' && (!ticket.affectation || ticket.affectation.statut === 'EN_ATTENTE')) ||
      (filter === 'EN_TRAITEMENT' && ticket.affectation?.statut === 'EN_TRAITEMENT') ||
      (filter === 'ESCALADE' && ticket.affectation?.statut === 'ESCALADE') ||
      (filter === 'CLOTUREE' && ticket.affectation?.statut === 'CLOTUREE');

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
            Bienvenue sur votre Espace Responsable équipe technique
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
            <p className="text-xs text-slate-500 font-medium">Résolus</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {filter === 'TOUS' && 'Gestion de l\'ensemble des tickets'}
              {filter === 'EN_ATTENTE' && 'Tickets en attente d\'affectation'}
              {filter === 'EN_TRAITEMENT' && 'Tickets en cours de traitement'}
              {filter === 'ESCALADE' && 'Tickets escaladés (Niveau supérieur)'}
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
              placeholder="Rechercher un ticket..."
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
                      <span className="text-xs font-medium text-slate-600">
                        {ticket.affectation?.technicien 
                          ? `${ticket.affectation.technicien.nom} ${ticket.affectation.technicien.prenom}`
                          : <span className="text-slate-400 italic">Non assigné</span>}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        ticket.affectation?.statut === 'EN_TRAITEMENT' ? 'bg-amber-100 text-amber-700' :
                        ticket.affectation?.statut === 'ESCALADE' ? 'bg-purple-100 text-purple-700' :
                        ticket.affectation?.statut === 'CLOTUREE' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.affectation?.statut === 'EN_TRAITEMENT' ? 'En cours' :
                         ticket.affectation?.statut === 'ESCALADE' ? 'Escaladé' :
                         ticket.affectation?.statut === 'CLOTUREE' ? 'Résolu' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      {!ticket.affectation && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#15aabf] hover:bg-[#1292a4] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Affecter</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}