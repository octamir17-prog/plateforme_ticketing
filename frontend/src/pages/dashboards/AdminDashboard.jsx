import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Building2, 
  Ticket, 
  CheckCircle2, 
  Plus, 
  Upload, 
  Send, 
  UserMinus, 
  Loader2,
  Layers,
  GitCommit,
  LayoutDashboard,
  MapPin,
  Building,
  Sliders,
  FileSpreadsheet,
  ChevronDown,
  LogOut,
  Lock,
  Search
} from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/workflowService';
import DashboardHeader from '../../components/layout/DashboardHeader';
const ROLE_LABELS = {
  UTILISATEUR: 'Utilisateur',
  RESPONSABLE: 'Responsable',
  TECHNICIEN: 'Technicien',
  POINT_FOCAL: 'Point focal',
};

const ROLE_ENDPOINT_SEGMENT = {
  RESPONSABLE: 'responsables',
  TECHNICIEN: 'techniciens',
  POINT_FOCAL: 'points-focaux',
};

const STATS_CONFIG = [
  { key: 'agents', label: 'Agents enregistrés', icon: Users, iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { key: 'structures', label: 'Structures actives', icon: Building2, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { key: 'ticketsTotal', label: 'Total Tickets Système', icon: Ticket, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { key: 'ticketsClotures', label: 'Tickets Clôturés', icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState({ agents: 0, structures: 0, ticketsTotal: 0, ticketsClotures: 0 });
  const [emplacements, setEmplacements] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [types, setTypes] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const [roleFilter, setRoleFilter] = useState('');
  const [structureFilterCode, setStructureFilterCode] = useState('');
  const [structureSearch, setStructureSearch] = useState('');
  const [structureSearchEmplacement, setStructureSearchEmplacement] = useState('');
  const [showStructureDropdownEmplacement, setShowStructureDropdownEmplacement] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [compteSearchTerm, setCompteSearchTerm] = useState('');
  const [adminTickets, setAdminTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');
  const [ticketFilter, setTicketFilter] = useState('TOUS');
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [dashboardView, setDashboardView] = useState('agents');

const emplacementStructureRef = useRef(null);

  const [showNouvelEmplacementModal, setShowNouvelEmplacementModal] = useState(false);
  const [showNouveauCompteModal, setShowNouveauCompteModal] = useState(false);
  const [showNouvelleStructureModal, setShowNouvelleStructureModal] = useState(false);
  const [showModifierStructureModal, setShowModifierStructureModal] = useState(false);
  const [structureEnEdition, setStructureEnEdition] = useState(null);
  const [showNouveauTypeModal, setShowNouveauTypeModal] = useState(false);
  const [showNouveauNiveauModal, setShowNouveauNiveauModal] = useState(false);
  const [showModifierTypeModal, setShowModifierTypeModal] = useState(false);
  const [typeEnEdition, setTypeEnEdition] = useState(null);
  const [showModifierNiveauModal, setShowModifierNiveauModal] = useState(false);
  const [niveauEnEdition, setNiveauEnEdition] = useState(null);
  const [showGererModal, setShowGererModal] = useState(false);

  const [selectedEmplacement, setSelectedEmplacement] = useState(null);
  const [newEmplacement, setNewEmplacement] = useState({ role: 'TECHNICIEN', codeStructure: '' });
  const [newStructure, setNewStructure] = useState({
    codeStructure: '',
    designation: '',
    typeId: '',
    niveauId: '',
    nomResponsable: '',
    prenomResponsable: '',
    mailResponsable: '',
    numResponsable: ''
  });
  const [editStructure, setEditStructure] = useState({
    codeStructure: '',
    designation: '',
    typeId: '',
    niveauId: '',
    nomResponsable: '',
    prenomResponsable: '',
    mailResponsable: '',
    numResponsable: ''
  });
  const [newType, setNewType] = useState({ libelle: '' });
  const [newNiveau, setNewNiveau] = useState({ libelle: '', ordre: 1 });
  const [editType, setEditType] = useState({ libelle: '' });
  const [editNiveau, setEditNiveau] = useState({ libelle: '', ordre: 1 });
  const [newCompte, setNewCompte] = useState({
    role: 'RESPONSABLE',
    codeStructure: '',
    agentMatricule: '',
    agentQuery: ''
  });

  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'comptes') {
      fetchEmplacements();
    }
  }, [activeTab, roleFilter, structureFilterCode]);

  // Actualisation silencieuse toutes les 30s tant que l'onglet Comptes est actif,
  // pour refléter les activations/attributions sans recharger la page.
  useEffect(() => {
    if (activeTab !== 'comptes') return;

    const interval = setInterval(() => {
      fetchEmplacements();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, roleFilter, structureFilterCode]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emplacementStructureRef.current && !emplacementStructureRef.current.contains(event.target)) {
        setShowStructureDropdownEmplacement(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStructures = structures.filter((s) => {
    const search = structureSearch.toLowerCase();
    return (
      s.codeStructure?.toLowerCase().includes(search) ||
      s.designation?.toLowerCase().includes(search) ||
      s.nomResponsable?.toLowerCase().includes(search) ||
      s.prenomResponsable?.toLowerCase().includes(search)
    );
  });

  const filteredEmplacements = emplacements.filter((emp) => {
    const query = compteSearchTerm.trim().toLowerCase();
    if (!query) return true;

    const text = [
      emp.username,
      ROLE_LABELS[emp.role] || emp.role,
      emp.structure?.codeStructure,
      emp.structure?.designation,
    ].join(' ').toLowerCase();

    return text.includes(query);
  });

  const filteredStructuresEmplacement = structures.filter((s) => {
    const search = structureSearchEmplacement.toLowerCase();
    return (
      s.codeStructure?.toLowerCase().includes(search) ||
      s.designation?.toLowerCase().includes(search)
    );
  });

 const filteredAgentsForCompte = allAgents.filter((agent) => {
    if (newCompte.codeStructure && agent.structureCode !== newCompte.codeStructure) {
      return false;
    }

    const query = newCompte.agentQuery.trim().toLowerCase();
    if (!query) return true;

    const text = [
      agent.matricule,
      agent.nom,
      agent.prenom,
      agent.email,
      agent.numero,
      agent.structureCode,
      agent.structureDesignation
    ].join(' ').toLowerCase();

    return text.includes(query);
  });

  const filteredAgentsDashboard = allAgents.filter((agent) => {
    const query = agentSearchTerm.trim().toLowerCase();
    if (!query) return true;

    const text = [
      agent.matricule,
      agent.nom,
      agent.prenom,
      agent.email,
      agent.numero,
      agent.structureCode,
      agent.structureDesignation,
      ROLE_LABELS[agent.role] || ''
    ].join(' ').toLowerCase();

    return text.includes(query);
  });

  const filteredAdminTickets = adminTickets.filter((ticket) => {
    const matchFilter = ticketFilter === 'TOUS' || (ticketFilter === 'CLOTURES' && ticket.statut === 'CLOTURE');
    const query = ticketSearchTerm.trim().toLowerCase();
    const matchSearch = !query || `${ticket.titre} ${ticket.reference} ${ticket.agent?.nom || ''} ${ticket.agent?.prenom || ''}`.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });
  const handleLogout = async () => {
    await authService.logout();
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');

    const [resDashboard, resStructures, resTypes, resNiveaux, resAgents] = await Promise.allSettled([
      api.get('/dashboard/admin'),
      api.get('/structures'),
      api.get('/types'),
      api.get('/niveaux'),
      api.get('/agents/tous')
    ]);

    const echecs = [];

    if (resDashboard.status === 'fulfilled') {
      setStats(resDashboard.value.data?.data || resDashboard.value.data || { agents: 0, structures: 0, ticketsTotal: 0, ticketsClotures: 0 });
    } else {
      echecs.push('statistiques');
    }

    if (resStructures.status === 'fulfilled') {
      setStructures(resStructures.value.data?.data || resStructures.value.data || []);
    } else {
      echecs.push('structures');
    }

    if (resTypes.status === 'fulfilled') {
      setTypes(resTypes.value.data?.data || resTypes.value.data || []);
    } else {
      echecs.push('types');
    }

    if (resNiveaux.status === 'fulfilled') {
      setNiveaux(resNiveaux.value.data?.data || resNiveaux.value.data || []);
    } else {
      echecs.push('niveaux');
    }

    if (resAgents.status === 'fulfilled') {
      setAllAgents(resAgents.value.data?.data || resAgents.value.data || []);
    } else {
      echecs.push('agents');
    }
if (echecs.length > 0) {
      console.error('Echec de chargement :', { resDashboard, resStructures, resTypes, resNiveaux, resAgents });
      setError(`Impossible de charger : ${echecs.join(', ')}. Voir la console pour le detail.`);
    } else {
      setError('');
    }

    setLoading(false);
  };

 const fetchAdminTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await api.get('/tickets');
      const payload = res.data?.data || res.data || [];
      setAdminTickets(Array.isArray(payload) ? payload : []);
      setTicketsError('');
    } catch (err) {
      setTicketsError(err.response?.data?.message || 'Impossible de charger les tickets.');
      setAdminTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchEmplacements = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (structureFilterCode) params.append('codeStructure', structureFilterCode);

      const res = await api.get(`/comptes/emplacements?${params.toString()}`);
      if (res.data) setEmplacements(res.data.data || res.data);
    } catch (err) {
      console.error('Erreur fetch emplacements :', err);
      setEmplacements([]);
    }
  };

  const handleCreateCompte = async (e) => {
    e.preventDefault();

    if (!newCompte.role) {
      alert('Veuillez sélectionner un rôle.');
      return;
    }

    if (!newCompte.codeStructure) {
      alert('Veuillez sélectionner une structure.');
      return;
    }

    if (!newCompte.agentMatricule) {
      alert('Veuillez sélectionner un agent dans la recherche.');
      return;
    }

    try {
      await api.post('/comptes/attribuer', {
        role: newCompte.role,
        codeStructure: newCompte.codeStructure,
        agentMatricule: newCompte.agentMatricule,
      });

      setShowNouveauCompteModal(false);
      setNewCompte({ role: 'RESPONSABLE', codeStructure: '', agentMatricule: '', agentQuery: '' });
      fetchEmplacements();
      alert('Compte attribué avec succès.');
    } catch (err) {
      console.error('Erreur création compte :', err);
      const message = err.response?.data?.message || err.message || 'Erreur lors de l\'attribution du compte';
      alert(message);
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      setShowNouvelleStructureModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création de la structure');
    }
  };

  const ouvrirModificationStructure = (structure) => {
    setStructureEnEdition(structure);
    setEditStructure({
      codeStructure: structure.codeStructure || '',
      designation: structure.designation || '',
      typeId: structure.type?.id || structure.typeId || '',
      niveauId: structure.niveau?.id || structure.niveauId || '',
      nomResponsable: structure.nomResponsable || '',
      prenomResponsable: structure.prenomResponsable || '',
      mailResponsable: structure.mailResponsable || '',
      numResponsable: structure.numResponsable || '',
    });
    setShowModifierStructureModal(true);
  };

  const handleUpdateStructure = async (e) => {
    e.preventDefault();
    if (!structureEnEdition) return;

    try {
      await api.put(`/structures/${structureEnEdition.id}`, editStructure);
      setShowModifierStructureModal(false);
      setStructureEnEdition(null);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification de la structure');
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      await api.post('/types', newType);
      setShowNouveauTypeModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création du type');
    }
  };

  const handleCreateNiveau = async (e) => {
    e.preventDefault();
    try {
      await api.post('/niveaux', newNiveau);
      setShowNouveauNiveauModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création du niveau');
    }
  };

  const ouvrirModificationType = (type) => {
    setTypeEnEdition(type);
    setEditType({ libelle: type.libelle || '' });
    setShowModifierTypeModal(true);
  };

  const handleUpdateType = async (e) => {
    e.preventDefault();
    if (!typeEnEdition) return;

    try {
      await api.put(`/types/${typeEnEdition.id}`, editType);
      setShowModifierTypeModal(false);
      setTypeEnEdition(null);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification du type');
    }
  };

  const ouvrirModificationNiveau = (niveau) => {
    setNiveauEnEdition(niveau);
    setEditNiveau({ libelle: niveau.libelle || '', ordre: niveau.ordre ?? 1 });
    setShowModifierNiveauModal(true);
  };

  const handleUpdateNiveau = async (e) => {
    e.preventDefault();
    if (!niveauEnEdition) return;

    try {
      await api.put(`/niveaux/${niveauEnEdition.id}`, editNiveau);
      setShowModifierNiveauModal(false);
      setNiveauEnEdition(null);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification du niveau');
    }
  };

  const handleSupprimerType = async (type) => {
    if (!window.confirm(`Supprimer le type "${type.libelle}" ? Cette action est irréversible et sera refusée s'il est utilisé par une structure.`)) return;
    try {
      await api.delete(`/types/${type.id}`);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du type');
    }
  };

  const handleSupprimerNiveau = async (niveau) => {
    if (!window.confirm(`Supprimer le niveau "${niveau.libelle}" ? Cette action est irréversible et sera refusée s'il est utilisé par une structure.`)) return;
    try {
      await api.delete(`/niveaux/${niveau.id}`);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du niveau');
    }
  };

  const handleRenvoyerLien = async () => {
    if (!selectedEmplacement) {
      alert('Aucun emplacement sélectionné.');
      return;
    }
    try {
      const payload = {
        role: selectedEmplacement.role,
        username: selectedEmplacement.username
      };
      const res = await api.post('/comptes/renvoyer-lien', payload);
      if (res.data && (res.data.success || res.status === 200)) {
        alert('Lien d\'activation renvoyé avec succès.');
        setShowGererModal(false);
        fetchEmplacements();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du renvoi du lien';
      alert(msg);
    }
  };

  const handleLibererEmplacement = async () => {
    if (!window.confirm('Voulez-vous vraiment libérer cet emplacement ?')) return;
    try {
      await api.patch('/comptes/liberer', {
        role: selectedEmplacement.role,
        username: selectedEmplacement.username
      });
      setShowGererModal(false);
      fetchEmplacements();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la libération');
    }
  };

  const handleDesactiverEmplacement = async () => {
    if (!window.confirm('Voulez-vous vraiment desactiver ce compte ? Il ne pourra plus se connecter tant qu\'il ne sera pas reactive.')) return;
    try {
      const segment = ROLE_ENDPOINT_SEGMENT[selectedEmplacement.role];
      await api.patch(`/${segment}/${selectedEmplacement.id}/desactiver`);
      setShowGererModal(false);
      fetchEmplacements();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la desactivation');
    }
  };

  const handleReactiverEmplacement = async () => {
    try {
      const segment = ROLE_ENDPOINT_SEGMENT[selectedEmplacement.role];
      await api.patch(`/${segment}/${selectedEmplacement.id}/reactiver`);
      setShowGererModal(false);
      fetchEmplacements();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la reactivation');
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('fichier', importFile);

    try {
      const res = await api.post('/agents/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data?.data || res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'comptes', label: 'Comptes', icon: MapPin },
    { id: 'structures', label: 'Structures', icon: Building },
    { id: 'types_niveaux', label: 'Types & Niveaux', icon: Sliders },
    { id: 'import', label: 'Import agents', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <DashboardHeader title="Bienvenue sur votre Espace Administrateur" onLogout={handleLogout} />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
        )}

        {/* Disposition Principale : Menu et Contenu principal */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Menu latéral navigation / onglets */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm sticky top-[104px] space-y-1">
            <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Zone de contenu principale */}
        <main className="flex-1 min-w-0">

          {/* ---------------- ONGLET 1 : TABLEAU DE BORD (PAR DÉFAUT) ---------------- */}
         {activeTab === 'dashboard' && (
<div className="space-y-6">
              <div className="sticky top-[104px] z-20 bg-slate-50 space-y-6 pb-2">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900">Aperçu Général</h2>
                  <p className="text-xs text-slate-500 mt-1">Statistiques globales du système de gestion des tickets et comptes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATS_CONFIG.map((c) => {
                    const Icon = c.icon;
                    const isActive =
                      (c.key === 'agents' && dashboardView === 'agents') ||
                      (c.key === 'structures' && dashboardView === 'structures') ||
                      (c.key === 'ticketsTotal' && dashboardView === 'tickets' && ticketFilter === 'TOUS') ||
                      (c.key === 'ticketsClotures' && dashboardView === 'tickets' && ticketFilter === 'CLOTURES');
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          if (c.key === 'agents') {
                            setDashboardView('agents');
                          } else if (c.key === 'structures') {
                            setDashboardView('structures');
                          } else if (c.key === 'ticketsTotal') {
                            setTicketFilter('TOUS');
                            setDashboardView('tickets');
                            fetchAdminTickets();
                          } else if (c.key === 'ticketsClotures') {
                            setTicketFilter('CLOTURES');
                            setDashboardView('tickets');
                            fetchAdminTickets();
                          }
                        }}
                        className={`p-5 rounded-2xl bg-white border shadow-sm flex items-center gap-4 text-left transition-all cursor-pointer hover:shadow-md ${
                          isActive ? 'border-cyan-300 ring-2 ring-cyan-100' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-3 ${c.iconBg} rounded-xl`}>
                          <Icon className={`w-6 h-6 ${c.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">{stats[c.key] || 0}</p>
                          <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {dashboardView === 'agents' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Tous les agents de la plateforme</h3>
                        <p className="text-xs text-slate-400 font-medium">Affichage de {filteredAgentsDashboard.length} agent(s)</p>
                      </div>
                      <div className="relative max-w-xs w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Rechercher par nom, matricule, structure, rôle..."
                          value={agentSearchTerm}
                          onChange={(e) => setAgentSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {dashboardView === 'structures' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Structures actives</h3>
                        <p className="text-xs text-slate-400 font-medium">Affichage de {filteredStructures.length} structure(s)</p>
                      </div>
                      <div className="relative max-w-xs w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Rechercher par code, désignation ou responsable..."
                          value={structureSearch}
                          onChange={(e) => setStructureSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {dashboardView === 'tickets' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {ticketFilter === 'CLOTURES' ? 'Tickets clôturés' : 'Total tickets système'}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Affichage de {filteredAdminTickets.length} ticket(s)</p>
                      </div>
                      <div className="relative max-w-xs w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Rechercher un ticket..."
                          value={ticketSearchTerm}
                          onChange={(e) => setTicketSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {dashboardView === 'agents' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-6">Matricule</th>
                        <th className="py-3 px-6">Nom & Prénom</th>
                        <th className="py-3 px-6">Structure</th>
                        <th className="py-3 px-6">Rôle</th>
                        <th className="py-3 px-6">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredAgentsDashboard.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">Aucun agent trouvé.</td>
                        </tr>
                      ) : (
                        filteredAgentsDashboard.map((agent) => (
                          <tr key={agent.matricule} className="hover:bg-slate-50">
                            <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">{agent.matricule}</td>
                            <td className="py-4 px-6 font-semibold whitespace-nowrap">{agent.nom} {agent.prenom}</td>
                            <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{agent.structureCode || 'N/A'}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              {agent.role ? (
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                                  {ROLE_LABELS[agent.role] || agent.role}
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  Aucun rôle
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                              <div>{agent.email}</div>
                              <div className="text-[11px] text-slate-400">{agent.numero}</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {dashboardView === 'structures' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-6">Code</th>
                        <th className="py-3 px-6">Désignation</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6">Niveau</th>
                        <th className="py-3 px-6">Responsable</th>
                        <th className="py-3 px-6">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredStructures.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">Aucune structure trouvée.</td>
                        </tr>
                      ) : (
                        filteredStructures.map((s) => (
                          <tr key={s.id || s.codeStructure} className="hover:bg-slate-50">
                            <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">{s.codeStructure}</td>
                            <td className="py-4 px-6 font-semibold whitespace-nowrap">{s.designation}</td>
                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{s.type?.libelle || s.type || 'N/A'}</td>
                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{s.niveau?.libelle || s.niveau || 'N/A'}</td>
                            <td className="py-4 px-6 text-slate-800 font-medium whitespace-nowrap">
                              {s.nomResponsable ? `${s.prenomResponsable || ''} ${s.nomResponsable}` : 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                              <div>{s.mailResponsable || '-'}</div>
                              <div className="text-[11px] text-slate-400">{s.numResponsable || ''}</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {dashboardView === 'tickets' && (
                <div className="space-y-4">
                  {ticketsError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{ticketsError}</div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      {ticketsLoading ? (
                        <div className="p-12 text-center text-slate-400">Chargement...</div>
                      ) : filteredAdminTickets.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">Aucun ticket trouvé.</div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                              <th className="py-3.5 px-6">Référence</th>
                              <th className="py-3.5 px-6">Titre</th>
                              <th className="py-3.5 px-6">Demandeur</th>
                              <th className="py-3.5 px-6">Catégorie</th>
                              <th className="py-3.5 px-6">Structure</th>
                              <th className="py-3.5 px-6">Technicien</th>
                              <th className="py-3.5 px-6">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredAdminTickets.map((ticket) => (
                              <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">{ticket.reference}</td>
                                <td className="py-4 px-6 font-medium text-slate-800 max-w-xs">
                                  <p className="line-clamp-1">{ticket.titre}</p>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                                  {ticket.agent?.nom} {ticket.agent?.prenom}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{ticket.categorie?.nom}</span>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                                  {ticket.affectation?.responsable?.structureCode || 'N/A'}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                                  {ticket.affectation?.technicien?.username || <span className="text-slate-400 italic">Non assigné</span>}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                    ticket.statut === 'CLOTURE' ? 'bg-emerald-100 text-emerald-700' :
                                    ticket.statut === 'EN_COURS' ? 'bg-amber-100 text-amber-700' :
                                    ticket.statut === 'AFFECTE' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {ticket.statut === 'CLOTURE' ? 'Clôturé' :
                                     ticket.statut === 'EN_COURS' ? 'En cours' :
                                     ticket.statut === 'AFFECTE' ? 'Affecté' : 'Soumis'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
{/* ---------------- ONGLET 2 : COMPTES ---------------- */}
          {activeTab === 'comptes' && (
            <div className="space-y-6">
              <div className="sticky top-[104px] z-20 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900">Gestion des comptes</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrer par Rôle</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="">Tous les rôles</option>
                      <option value="RESPONSABLE">Responsable</option>
                      <option value="TECHNICIEN">Technicien</option>
                      <option value="POINT_FOCAL">Point focal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrer par Structure</label>
                    <select
                      value={structureFilterCode}
                      onChange={(e) => setStructureFilterCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="">Toutes les structures</option>
                      {structures.map((s) => (
                        <option key={s.id || s.codeStructure} value={s.codeStructure}>
                          {s.codeStructure} - {s.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={compteSearchTerm}
                      onChange={(e) => setCompteSearchTerm(e.target.value)}
                      placeholder="Rechercher par rôle, structure, compte..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNouveauCompteModal(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau compte</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-6">Compte</th>
                      <th className="py-3 px-6">Rôle</th>
                      <th className="py-3 px-6">Structure</th>
                      <th className="py-3 px-6">Statut</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredEmplacements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">Aucun compte trouvé.</td>
                      </tr>
                    ) : (
                      filteredEmplacements.map((emp) => (
                        <tr key={emp.id || emp.username} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                            {emp.statut === 'ATTRIBUE' && emp.agent
                              ? `${emp.agent.prenom} ${emp.agent.nom}`
                              : emp.username}
                          </td>
                          <td className="py-4 px-6 text-slate-600 whitespace-nowrap capitalize">
                            {emp.role ? emp.role.toLowerCase() : 'N/A'}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-600 whitespace-nowrap">
                            {emp.structure?.codeStructure || emp.codeStructure || 'N/A'}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                emp.statut === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : emp.statut === 'ATTRIBUE'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : emp.statut === 'INACTIF'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : emp.statut === 'LIBRE_DEFINITIF'
                                  ? 'bg-slate-50 text-slate-400 border border-slate-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {emp.statut === 'ACTIVE' && 'Actif'}
                              {emp.statut === 'ATTRIBUE' && 'Attribué'}
                              {emp.statut === 'INACTIF' && 'Désactivé'}
                              {emp.statut === 'LIBRE_DEFINITIF' && 'Libéré (historique)'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmplacement(emp);
                                setShowGererModal(true);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                            >
                              Gérer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* ---------------- ONGLET 3 : STRUCTURES ---------------- */}
          {activeTab === 'structures' && (
            <div className="space-y-6">
              <div className="sticky top-[104px] z-20 bg-slate-50 space-y-4 pb-1">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Structures Régionales et Locales</h2>
                      <p className="text-xs text-slate-500 mt-1">Liste des structures et responsables enregistrés.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNouvelleStructureModal(true)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle structure</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={structureSearch}
                      onChange={(e) => setStructureSearch(e.target.value)}
                      placeholder="Code, désignation ou responsable..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Désignation</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Niveau</th>
                      <th className="py-4 px-6">Responsable</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStructures.map((s) => (
                      <tr key={s.id || s.codeStructure} className="hover:bg-slate-50">
                        <td className="py-4 px-6 font-bold text-slate-900">{s.codeStructure}</td>
                        <td className="py-4 px-6 font-semibold">{s.designation}</td>
                        <td className="py-4 px-6 text-slate-500">{s.type?.libelle || s.type || 'N/A'}</td>
                        <td className="py-4 px-6 text-slate-500">{s.niveau?.libelle || s.niveau || 'N/A'}</td>
                        <td className="py-4 px-6 text-slate-800 font-medium">
                          {s.nomResponsable ? `${s.prenomResponsable || ''} ${s.nomResponsable}` : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          <div>{s.mailResponsable || '-'}</div>
                          <div className="text-[11px] text-slate-400">{s.numResponsable || ''}</div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button type="button" onClick={() => ouvrirModificationStructure(s)} className="text-cyan-600 hover:underline font-semibold cursor-pointer">
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- ONGLET 4 : TYPES & NIVEAUX ---------------- */}
          {activeTab === 'types_niveaux' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="sticky top-[104px] z-10 bg-white flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    <h3 className="text-sm font-bold text-slate-800">Types de structure</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNouveauTypeModal(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau Type</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {types.map((t) => (
                    <div key={t.id || t.libelle} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{t.libelle}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => ouvrirModificationType(t)}
                          className="text-cyan-600 hover:underline font-semibold text-xs cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSupprimerType(t)}
                          className="text-rose-600 hover:underline font-semibold text-xs cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="sticky top-[104px] z-10 bg-white flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-800">Niveaux hiérarchiques</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNouveauNiveauModal(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau Niveau</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {niveaux.map((n) => (
                    <div key={n.id || n.libelle} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{n.libelle}</p>
                        <p className="text-[11px] text-slate-500">Rang hiérarchique : {n.ordre ?? 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => ouvrirModificationNiveau(n)}
                          className="text-cyan-600 hover:underline font-semibold text-xs cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSupprimerNiveau(n)}
                          className="text-rose-600 hover:underline font-semibold text-xs cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- ONGLET 5 : IMPORT AGENTS ---------------- */}
          {activeTab === 'import' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-800 mb-1">Importer des agents</h2>
                <p className="text-xs text-slate-500 mb-6">Fichier Excel (.xlsx), 5 Mo maximum.</p>

                <form onSubmit={handleImportExcel} className="space-y-4">
                  <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    importFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}>
                    {importFile ? (
                      <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    )}
                    <span className={`text-xs font-medium ${importFile ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {importFile ? importFile.name : 'agents_ministere.xlsx'}
                    </span>
                    {importFile && (
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1">Fichier sélectionné, prêt à importer</span>
                    )}
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={importing || !importFile}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Importer</span>
                    </button>
                  </div>
                </form>
              </div>

              {importResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500">Lignes lues</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{importResult.totalLignes || 0}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <p className="text-xs text-emerald-700 font-medium">Réussites</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{importResult.reussites || 0}</p>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                      <p className="text-xs text-rose-700 font-medium">Échecs</p>
                      <p className="text-2xl font-bold text-rose-700 mt-1">{importResult.echecs?.length || 0}</p>
                    </div>
                  </div>

                  {importResult.echecs?.length > 0 && (
                    <div className="space-y-2">
                      {importResult.echecs.map((err, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs shadow-sm">
                          <span className="text-slate-700 font-medium">Ligne {err.ligne} — matricule {err.matricule}</span>
                          <span className="text-rose-600">{err.raison}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          </main>
        </div>
      </div>

      {/* ---------------- MODALES DE Saisie ---------------- */}
      {showNouvelleStructureModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-800">Nouvelle structure</h3>
              <p className="text-xs text-slate-500 mt-1">Saisissez les informations de la structure et du responsable.</p>
            </div>

            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Code structure</label>
                  <input
                    type="text"
                    placeholder="Ex: CSA"
                    value={newStructure.codeStructure}
                    onChange={(e) => setNewStructure({ ...newStructure, codeStructure: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Désignation</label>
                  <input
                    type="text"
                    placeholder="Ex: Centre de santé"
                    value={newStructure.designation}
                    onChange={(e) => setNewStructure({ ...newStructure, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Type de structure</label>
                  <select
                    value={newStructure.typeId}
                    onChange={(e) => setNewStructure({ ...newStructure, typeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.libelle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Niveau hiérarchique</label>
                  <select
                    value={newStructure.niveauId}
                    onChange={(e) => setNewStructure({ ...newStructure, niveauId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((n) => (
                      <option key={n.id} value={n.id}>{n.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-3">Informations du responsable</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Nom responsable</label>
                    <input
                      type="text"
                      placeholder="Nom"
                      value={newStructure.nomResponsable}
                      onChange={(e) => setNewStructure({ ...newStructure, nomResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Prénom responsable</label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={newStructure.prenomResponsable}
                      onChange={(e) => setNewStructure({ ...newStructure, prenomResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Email responsable</label>
                    <input
                      type="email"
                      placeholder="email@domaine.com"
                      value={newStructure.mailResponsable}
                      onChange={(e) => setNewStructure({ ...newStructure, mailResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Numéro téléphone</label>
                    <input
                      type="tel"
                      placeholder="+229..."
                      value={newStructure.numResponsable}
                      onChange={(e) => setNewStructure({ ...newStructure, numResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNouvelleStructureModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Créer la structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModifierStructureModal && structureEnEdition && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-800">Modifier la structure</h3>
              <p className="text-xs text-slate-500 mt-1">{structureEnEdition.codeStructure} — modifiez les champs nécessaires.</p>
            </div>

            <form onSubmit={handleUpdateStructure} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Code structure</label>
                  <input
                    type="text"
                    value={editStructure.codeStructure}
                    onChange={(e) => setEditStructure({ ...editStructure, codeStructure: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Désignation</label>
                  <input
                    type="text"
                    value={editStructure.designation}
                    onChange={(e) => setEditStructure({ ...editStructure, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Type de structure</label>
                  <select
                    value={editStructure.typeId}
                    onChange={(e) => setEditStructure({ ...editStructure, typeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.libelle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Niveau hiérarchique</label>
                  <select
                    value={editStructure.niveauId}
                    onChange={(e) => setEditStructure({ ...editStructure, niveauId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((n) => (
                      <option key={n.id} value={n.id}>{n.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-3">Informations du responsable</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Nom responsable</label>
                    <input
                      type="text"
                      value={editStructure.nomResponsable}
                      onChange={(e) => setEditStructure({ ...editStructure, nomResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Prénom responsable</label>
                    <input
                      type="text"
                      value={editStructure.prenomResponsable}
                      onChange={(e) => setEditStructure({ ...editStructure, prenomResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Email responsable</label>
                    <input
                      type="email"
                      value={editStructure.mailResponsable}
                      onChange={(e) => setEditStructure({ ...editStructure, mailResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Numéro téléphone</label>
                    <input
                      type="tel"
                      value={editStructure.numResponsable}
                      onChange={(e) => setEditStructure({ ...editStructure, numResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowModifierStructureModal(false); setStructureEnEdition(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNouveauTypeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">Nouveau type de structure</h3>
            </div>

            <form onSubmit={handleCreateType} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Libellé</label>
                <input
                  type="text"
                  placeholder="Ex: Soins de base"
                  value={newType.libelle}
                  onChange={(e) => setNewType({ ...newType, libelle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNouveauTypeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Créer le type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNouveauNiveauModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">Nouveau niveau hiérarchique</h3>
            </div>

            <form onSubmit={handleCreateNiveau} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Libellé</label>
                <input
                  type="text"
                  placeholder="Ex: Périphérique, Central..."
                  value={newNiveau.libelle}
                  onChange={(e) => setNewNiveau({ ...newNiveau, libelle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Rang hiérarchique</label>
                <input
                  type="number"
                  placeholder="1, 2, 3..."
                  value={newNiveau.ordre}
                  onChange={(e) => setNewNiveau({ ...newNiveau, ordre: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNouveauNiveauModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Créer le niveau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showModifierTypeModal && typeEnEdition && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">Modifier le type</h3>
            </div>

            <form onSubmit={handleUpdateType} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Libellé</label>
                <input
                  type="text"
                  value={editType.libelle}
                  onChange={(e) => setEditType({ ...editType, libelle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModifierTypeModal(false); setTypeEnEdition(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModifierNiveauModal && niveauEnEdition && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">Modifier le niveau</h3>
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Modifier le rang hiérarchique affecte immédiatement l'escalade des tickets pour toutes les structures de ce niveau.
              </p>
            </div>

            <form onSubmit={handleUpdateNiveau} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Libellé</label>
                <input
                  type="text"
                  value={editNiveau.libelle}
                  onChange={(e) => setEditNiveau({ ...editNiveau, libelle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Rang hiérarchique</label>
                <input
                  type="number"
                  value={editNiveau.ordre}
                  onChange={(e) => setEditNiveau({ ...editNiveau, ordre: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModifierNiveauModal(false); setNiveauEnEdition(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showNouveauCompteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-800">Nouveau compte</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sélectionnez le rôle, la structure et l’agent concerné.
              </p>
            </div>

            <form onSubmit={handleCreateCompte} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Rôle</label>
                <select
                  value={newCompte.role}
                  onChange={(e) => setNewCompte({ ...newCompte, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="RESPONSABLE">Responsable</option>
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="POINT_FOCAL">Point focal</option>
                </select>
              </div>

              <div className="relative" ref={emplacementStructureRef}>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Structure</label>
                <div className="relative">
                  <input
                    type="text"
                    value={structureSearchEmplacement}
                    onChange={(e) => {
                      setStructureSearchEmplacement(e.target.value);
                      setNewCompte((prev) => ({ ...prev, codeStructure: '' }));
                    }}
                    onFocus={() => setShowStructureDropdownEmplacement(true)}
                    placeholder="Rechercher une structure"
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStructureDropdownEmplacement((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {showStructureDropdownEmplacement && (
                  <div className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {filteredStructuresEmplacement.length > 0 ? (
                      filteredStructuresEmplacement.map((s) => (
                        <button
                          key={s.id || s.codeStructure}
                          type="button"
                          onClick={() => {
                            setNewCompte((prev) => ({ ...prev, codeStructure: s.codeStructure }));
                            setStructureSearchEmplacement(`${s.codeStructure} - ${s.designation}`);
                            setShowStructureDropdownEmplacement(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-100 text-slate-700 text-xs"
                        >
                          <div className="font-semibold">{s.codeStructure}</div>
                          <div className="text-[11px] text-slate-500">{s.designation}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-[11px] text-slate-500">Aucune structure trouvée.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs text-slate-600 mb-1 font-medium">Agent</label>
                <input
                  type="text"
                  value={newCompte.agentQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCompte((prev) => ({ ...prev, agentQuery: value, agentMatricule: '' }));
                  }}
                  placeholder={newCompte.codeStructure ? 'Matricule, nom, prénom, email...' : 'Sélectionnez d\'abord une structure'}
                  disabled={!newCompte.codeStructure}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {newCompte.agentQuery && !newCompte.agentMatricule && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                    {filteredAgentsForCompte.length > 0 ? (
                      filteredAgentsForCompte.slice(0, 10).map((agent) => (
                        <button
                          key={agent.id || agent.matricule}
                          type="button"
                          onClick={() => {
                            setNewCompte((prev) => ({
                              ...prev,
                              agentMatricule: String(agent.matricule),
                              agentQuery: `${agent.matricule} - ${agent.nom} ${agent.prenom}`
                            }));
                          }}
                          className="w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50 text-xs text-slate-700"
                        >
                          <div className="font-semibold">{agent.matricule} — {agent.nom} {agent.prenom}</div>
                          <div className="text-[11px] text-slate-500">{agent.structureCode} • {agent.email}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-[11px] text-slate-500">Aucun agent trouvé.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowNouveauCompteModal(false); setNewCompte({ role: 'RESPONSABLE', codeStructure: '', agentMatricule: '', agentQuery: '' }); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGererModal && selectedEmplacement && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">{selectedEmplacement.username}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedEmplacement.role} • {selectedEmplacement.structure?.codeStructure || selectedEmplacement.codeStructure} •{' '}
                <span
                  className={
                    selectedEmplacement.statut === 'ACTIVE'
                      ? 'text-emerald-600 font-semibold'
                      : selectedEmplacement.statut === 'INACTIF'
                      ? 'text-rose-600 font-semibold'
                      : selectedEmplacement.statut === 'LIBRE_DEFINITIF'
                      ? 'text-slate-400 font-semibold'
                      : 'text-amber-600 font-semibold'
                  }
                >
                  {selectedEmplacement.statut === 'ACTIVE' && 'Actif'}
                  {selectedEmplacement.statut === 'ATTRIBUE' && 'Attribué'}
                  {selectedEmplacement.statut === 'INACTIF' && 'Désactivé'}
                  {selectedEmplacement.statut === 'LIBRE_DEFINITIF' && 'Libéré (historique)'}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {selectedEmplacement.statut !== 'LIBRE_DEFINITIF' && (
                <>
                  {selectedEmplacement.statut === 'ATTRIBUE' && (
                    <button
                      type="button"
                      onClick={handleRenvoyerLien}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-slate-500" />
                      <span>Renvoyer le lien d'activation</span>
                    </button>
                  )}

                  {selectedEmplacement.statut === 'INACTIF' ? (
                    <button
                      type="button"
                      onClick={handleReactiverEmplacement}
                      className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Réactiver le compte</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDesactiverEmplacement}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>Désactiver le compte</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLibererEmplacement}
                    className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <UserMinus className="w-4 h-4 text-rose-600" />
                    <span>Libérer l'emplacement</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGererModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
