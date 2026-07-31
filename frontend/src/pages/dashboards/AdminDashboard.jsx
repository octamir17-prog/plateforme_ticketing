import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Building2, 
  Ticket, 
  CheckCircle2, 
  Plus, 
  Upload, 
  Send, 
  UserMinus, 
  Lock, 
  Loader2,
  Layers,
  GitCommit,
  LayoutDashboard,
  MapPin,
  Building,
  Sliders,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import api from '../../services/api';

// Pour changer une icone : remplace juste le composant "icon" ci-dessous
// (garde un import lucide-react correspondant en haut du fichier).
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
  const [structures, setStructures] = useState([]);
  const [types, setTypes] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roleFilter, setRoleFilter] = useState('');
  const [structureFilterCode, setStructureFilterCode] = useState('');
  const [structureSearchFilter, setStructureSearchFilter] = useState('');
  const [showStructureFilterDropdown, setShowStructureFilterDropdown] = useState(false);
  const [structureSearch, setStructureSearch] = useState('');
  const [showStructureDropdown, setShowStructureDropdown] = useState(false);
  const [structureSearchEmplacement, setStructureSearchEmplacement] = useState('');
  const [showStructureDropdownEmplacement, setShowStructureDropdownEmplacement] = useState(false);
  const [statutFilter, setStatutFilter] = useState('');

  const filterStructureRef = useRef(null);
  const structureSearchRef = useRef(null);
  const emplacementStructureRef = useRef(null);

  const [showNouvelEmplacementModal, setShowNouvelEmplacementModal] = useState(false);
  const [showNouvelleStructureModal, setShowNouvelleStructureModal] = useState(false);
  const [showModifierStructureModal, setShowModifierStructureModal] = useState(false);
  const [structureEnEdition, setStructureEnEdition] = useState(null);
  const [showNouveauTypeModal, setShowNouveauTypeModal] = useState(false);
  const [showNouveauNiveauModal, setShowNouveauNiveauModal] = useState(false);
  const [showAttributionModal, setShowAttributionModal] = useState(false);
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
  const [attributionForm, setAttributionForm] = useState({ agentMatricule: '', agentNom: '', agentStructure: '' });

  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'emplacements') {
      fetchEmplacements();
    }
  }, [activeTab, roleFilter, structureFilterCode, statutFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterStructureRef.current && !filterStructureRef.current.contains(event.target)) {
        setShowStructureFilterDropdown(false);
      }
      if (structureSearchRef.current && !structureSearchRef.current.contains(event.target)) {
        setShowStructureDropdown(false);
      }
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
      s.designation?.toLowerCase().includes(search)
    );
  });

  const filteredStructuresFilter = structures.filter((s) => {
    const search = structureSearchFilter.toLowerCase();
    return (
      s.codeStructure?.toLowerCase().includes(search) ||
      s.designation?.toLowerCase().includes(search)
    );
  });

  const filteredStructuresEmplacement = structures.filter((s) => {
    const search = structureSearchEmplacement.toLowerCase();
    return (
      s.codeStructure?.toLowerCase().includes(search) ||
      s.designation?.toLowerCase().includes(search)
    );
  });

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');

    const [resDashboard, resStructures, resTypes, resNiveaux] = await Promise.allSettled([
      api.get('/dashboard/admin'),
      api.get('/structures'),
      api.get('/types'),
      api.get('/niveaux')
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

    if (echecs.length > 0) {
      console.error('Echec de chargement :', { resDashboard, resStructures, resTypes, resNiveaux });
      setError(`Impossible de charger : ${echecs.join(', ')}. Voir la console pour le detail.`);
    }

    setLoading(false);
  };

  const fetchEmplacements = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (structureFilterCode) params.append('codeStructure', structureFilterCode);
      if (statutFilter) params.append('statut', statutFilter);

      const res = await api.get(`/comptes/emplacements?${params.toString()}`);
      if (res.data) setEmplacements(res.data.data || res.data);
    } catch (err) {
      console.error('Erreur fetch emplacements :', err);
      setEmplacements([]);
    }
  };

  const handleCreateEmplacement = async (e) => {
    e.preventDefault();

    if (!newEmplacement.role) {
      alert('Veuillez sélectionner un rôle.');
      return;
    }

    if (!newEmplacement.codeStructure) {
      alert('Veuillez sélectionner une structure.');
      return;
    }

    try {
      await api.post('/comptes/emplacements', newEmplacement);
      setShowNouvelEmplacementModal(false);
      fetchEmplacements();
    } catch (err) {
      console.error('Erreur création emplacement :', err);
      const message = err.response?.data?.message || err.message || 'Erreur lors de la création de l\'emplacement';
      alert(message);
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStructure,
        mailResponsable: newStructure.mailResponsable || newStructure.emailResponsable,
        numResponsable: newStructure.numResponsable || newStructure.telephoneResponsable,
      };
      await api.post('/structures', payload);
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
      mailResponsable: structure.mailResponsable || structure.emailResponsable || '',
      numResponsable: structure.numResponsable || structure.telephoneResponsable || '',
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

  const handleAttribuer = async (e) => {
    e.preventDefault();

    if (!selectedEmplacement) {
      alert('Aucun emplacement sélectionné.');
      return;
    }

    try {
      const payload = {
        agentMatricule: attributionForm.agentMatricule,
        role: selectedEmplacement.role,
        username: selectedEmplacement.username
      };

      const response = await api.post('/comptes/attribuer', payload);

      if (response.data && (response.data.success || response.status === 201 || response.status === 200)) {
        alert('Lien d\'activation envoyé avec succès !');

        if (response.data.data?.token) {
          console.log('Token généré (dev) :', response.data.data.token);
        }

        setShowAttributionModal(false);
        setAttributionForm({ agentMatricule: '', agentNom: '', agentStructure: '' });
        fetchEmplacements();
      }
    } catch (error) {
      console.error('Détail erreur attribution :', error.response);

      const status = error.response?.status;
      const messageServeur = error.response?.data?.message || error.response?.data?.error;

      if (status === 404) {
        alert(`Erreur : Agent introuvable avec le matricule ${attributionForm.agentMatricule}`);
      } else if (status === 409) {
        alert('Erreur : Cet emplacement est déjà attribué ou cet agent a déjà un compte.');
      } else if (status === 401 || status === 403) {
        alert('Erreur : Session expirée ou droits insuffisants (Veuillez vous reconnecter).');
      } else if (messageServeur) {
        alert(`Erreur backend (${status || 'Inconnu'}) : ${messageServeur}`);
      } else {
        alert('Impossible de contacter le serveur backend. Vérifiez vos journaux.');
      }
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
      setImportResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'emplacements', label: 'Emplacements', icon: MapPin },
    { id: 'structures', label: 'Structures', icon: Building },
    { id: 'types_niveaux', label: 'Types & Niveaux', icon: Sliders },
    { id: 'import', label: 'Import agents', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      
      
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
            Bienvenue sur votre Espace Administrateur  
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

      {error && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
        </div>
      )}

      {/* Disposition Principale : Menu et Contenu principal */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* Menu latéral navigation / onglets */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm sticky top-6 space-y-1">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Aperçu Général</h2>
                <p className="text-xs text-slate-500 mt-1">Statistiques globales du système de gestion des tickets et comptes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS_CONFIG.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.key} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className={`p-3 ${c.iconBg} rounded-xl`}>
                        <Icon className={`w-6 h-6 ${c.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{stats[c.key] || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- ONGLET 2 : EMPLACEMENTS ---------------- */}
          {activeTab === 'emplacements' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900">Gestion des Emplacements</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrer par Statut</label>
                    <select
                      value={statutFilter}
                      onChange={(e) => setStatutFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="">Statuts</option>
                      <option value="LIBRE">Libre</option>
                      <option value="ATTRIBUE">Attribué</option>
                      <option value="ACTIVE">Actif</option>
                    </select>
                  </div>

                  <div className="relative" ref={filterStructureRef}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrer par Structure</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={structureSearchFilter}
                        onChange={(e) => {
                          setStructureSearchFilter(e.target.value);
                          setStructureFilterCode('');
                        }}
                        onFocus={() => setShowStructureFilterDropdown(true)}
                        placeholder="Code ou désignation"
                        className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStructureFilterDropdown((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    {showStructureFilterDropdown && (
                      <div className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                        {filteredStructuresFilter.length > 0 ? (
                          filteredStructuresFilter.map((s) => (
                            <button
                              key={s.id || s.codeStructure}
                              type="button"
                              onClick={() => {
                                setStructureFilterCode(s.codeStructure);
                                setStructureSearchFilter(`${s.codeStructure} - ${s.designation}`);
                                setShowStructureFilterDropdown(false);
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
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNouvelEmplacementModal(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvel emplacement</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-6">Emplacement</th>
                      <th className="py-3 px-6">Rôle</th>
                      <th className="py-3 px-6">Structure</th>
                      <th className="py-3 px-6">Statut</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {emplacements.map((emp) => (
                      <tr key={emp.id || emp.username} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {emp.username}
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
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {emp.statut === 'ACTIVE' && 'Actif'}
                            {emp.statut === 'ATTRIBUE' && 'Attribué'}
                            {emp.statut === 'LIBRE' && 'Libre'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {emp.statut === 'LIBRE' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmplacement(emp);
                                setShowAttributionModal(true);
                              }}
                              className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                            >
                              Attribuer
                            </button>
                          ) : (
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- ONGLET 3 : STRUCTURES ---------------- */}
          {activeTab === 'structures' && (
            <div className="space-y-6">
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Structures Régionales et Locales</h2>
                      <p className="text-xs text-slate-500 mt-1">Liste des structures et responsables enregistrés.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNouvelleStructureModal(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouvelle structure</span>
                    </button>
                  </div>

                  <div className="relative" ref={structureSearchRef}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Rechercher une structure</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={structureSearch}
                        onChange={(e) => setStructureSearch(e.target.value)}
                        onFocus={() => setShowStructureDropdown(true)}
                        placeholder="Code ou désignation"
                        className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStructureDropdown((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    {showStructureDropdown && (
                      <div className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                        {filteredStructures.length > 0 ? (
                          filteredStructures.map((s) => (
                            <button
                              key={s.id || s.codeStructure}
                              type="button"
                              onClick={() => {
                                setStructureSearch(`${s.codeStructure} - ${s.designation}`);
                                setShowStructureDropdown(false);
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
                          <div>{s.emailResponsable || '-'}</div>
                          <div className="text-[11px] text-slate-400">{s.telephoneResponsable || ''}</div>
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
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
                      <p className="text-2xl font-bold text-slate-800 mt-1">{importResult.lignesLues || 0}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <p className="text-xs text-emerald-700 font-medium">Réussites</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{importResult.reussites || 0}</p>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                      <p className="text-xs text-rose-700 font-medium">Échecs</p>
                      <p className="text-2xl font-bold text-rose-700 mt-1">{importResult.echecs || 0}</p>
                    </div>
                  </div>

                  {importResult.erreurs?.length > 0 && (
                    <div className="space-y-2">
                      {importResult.erreurs.map((err, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs shadow-sm">
                          <span className="text-slate-700 font-medium">{err.ligne}</span>
                          <span className="text-rose-600">{err.message}</span>
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

      {showNouvelEmplacementModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">Nouvel emplacement</h3>
              <p className="text-xs text-slate-500 mt-1">
                Le nom (ex: CSA-TEC4) sera généré automatiquement.
              </p>
            </div>

            <form onSubmit={handleCreateEmplacement} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Rôle</label>
                <select
                  value={newEmplacement.role}
                  onChange={(e) => setNewEmplacement({ ...newEmplacement, role: e.target.value })}
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
                      setNewEmplacement({ ...newEmplacement, codeStructure: '' });
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
                            setNewEmplacement({ ...newEmplacement, codeStructure: s.codeStructure });
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNouvelEmplacementModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Créer l'emplacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttributionModal && selectedEmplacement && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-800">Attribuer l'emplacement</h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedEmplacement.username} • {selectedEmplacement.role} • {selectedEmplacement.structure?.codeStructure || selectedEmplacement.codeStructure}
              </p>
            </div>

            <form onSubmit={handleAttribuer} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Matricule de l'agent</label>
                <input
                  type="text"
                  placeholder="Ex: 1003"
                  value={attributionForm.agentMatricule}
                  onChange={(e) => setAttributionForm({ ...attributionForm, agentMatricule: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAttributionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Envoyer le lien
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
                <span className={selectedEmplacement.statut === 'ACTIVE' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {selectedEmplacement.statut === 'ACTIVE' ? 'Actif' : 'Attribué'}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRenvoyerLien}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 text-slate-500" />
                <span>Renvoyer le lien d'activation</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Fonctionnalité de désactivation')}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Désactiver le compte</span>
              </button>

              <button
                type="button"
                onClick={handleLibererEmplacement}
                className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-3 transition-colors cursor-pointer"
              >
                <UserMinus className="w-4 h-4 text-rose-600" />
                <span>Libérer l'emplacement</span>
              </button>
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
