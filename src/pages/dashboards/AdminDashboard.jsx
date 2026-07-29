import React, { useState, useEffect } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';

const MOCK_EMPLACEMENTS = [
  { id: 1, username: 'CSA-RESP1', role: 'RESPONSABLE', codeStructure: 'CSA', statut: 'ACTIVE', structure: { codeStructure: 'CSA' } },
  { id: 2, username: 'CSA-TEC1', role: 'TECHNICIEN', codeStructure: 'CSA', statut: 'ATTRIBUE', structure: { codeStructure: 'CSA' } },
  { id: 3, username: 'CHD-PF1', role: 'POINT_FOCAL', codeStructure: 'CHD', statut: 'LIBRE', structure: { codeStructure: 'CHD' } },
  { id: 4, username: 'MS-TEC2', role: 'TECHNICIEN', codeStructure: 'MS', statut: 'ACTIVE', structure: { codeStructure: 'MS' } },
  { id: 5, username: 'DRS-RESP2', role: 'RESPONSABLE', codeStructure: 'DRS', statut: 'LIBRE', structure: { codeStructure: 'DRS' } },
];

const MOCK_STRUCTURES = [
  { id: 1, codeStructure: 'CSA', designation: 'Centre de Santé d\'Arrondissement', type: 'Soins de base', niveau: 'Périphérique', nomResponsable: 'DOSSOU', prenomResponsable: 'Paul', emailResponsable: 'p.dossou@sante.gouv.bj', telephoneResponsable: '+229 97 00 00 01' },
  { id: 2, codeStructure: 'CHD', designation: 'Centre Hospitalier Départemental', type: 'Hôpital', niveau: 'Intermédiaire', nomResponsable: 'ADAM', prenomResponsable: 'Sarah', emailResponsable: 's.adam@sante.gouv.bj', telephoneResponsable: '+229 97 00 00 02' },
  { id: 3, codeStructure: 'MS', designation: 'Ministère de la Santé', type: 'Administration', niveau: 'Central', nomResponsable: 'KPADONOU', prenomResponsable: 'Michel', emailResponsable: 'm.kpadonou@sante.gouv.bj', telephoneResponsable: '+229 97 00 00 03' },
  { id: 4, codeStructure: 'DRS', designation: 'Direction Régionale de la Santé', type: 'Direction', niveau: 'Régional', nomResponsable: 'BIO', prenomResponsable: 'Chantal', emailResponsable: 'c.bio@sante.gouv.bj', telephoneResponsable: '+229 97 00 00 04' },
];

const MOCK_TYPES = [
  { id: 1, libelle: 'Soins de base', description: 'Centres de santé de proximité et dispensaires' },
  { id: 2, libelle: 'Hôpital', description: 'Établissements hospitaliers départementaux et nationaux' },
  { id: 3, libelle: 'Administration', description: 'Bureaux administratifs centraux et ministériels' },
  { id: 4, libelle: 'Direction', description: 'Directions régionales et départementales' },
];

const MOCK_NIVEAUX = [
  { id: 1, libelle: 'Central', rang: 1 },
  { id: 2, libelle: 'Régional', rang: 2 },
  { id: 3, libelle: 'Intermédiaire', rang: 3 },
  { id: 4, libelle: 'Périphérique', rang: 4 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState({ agents: 124, structures: 18, ticketsTotal: 450, ticketsClotures: 382 });
  const [emplacements, setEmplacements] = useState(MOCK_EMPLACEMENTS);
  const [structures, setStructures] = useState(MOCK_STRUCTURES);
  const [types, setTypes] = useState(MOCK_TYPES);
  const [niveaux, setNiveaux] = useState(MOCK_NIVEAUX);
  const [loading, setLoading] = useState(false);

  const [roleFilter, setRoleFilter] = useState('');
  const [structureFilter, setStructureFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  const [showNouvelEmplacementModal, setShowNouvelEmplacementModal] = useState(false);
  const [showNouvelleStructureModal, setShowNouvelleStructureModal] = useState(false);
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
    emailResponsable: '',
    telephoneResponsable: ''
  });
  const [newType, setNewType] = useState({ libelle: '', description: '' });
  const [newNiveau, setNewNiveau] = useState({ libelle: '', rang: 1 });
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
  }, [activeTab, roleFilter, structureFilter, statutFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resDashboard, resStructures, resTypes, resNiveaux] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/structures'),
        api.get('/structures/types'),
        api.get('/structures/niveaux')
      ]);
      if (resDashboard.data) setStats(resDashboard.data.data || resDashboard.data);
      if (resStructures.data) setStructures(resStructures.data.data || resStructures.data);
      if (resTypes.data) setTypes(resTypes.data.data || resTypes.data);
      if (resNiveaux.data) setNiveaux(resNiveaux.data.data || resNiveaux.data);
    } catch (err) {
      console.log('Utilisation des données de démo');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmplacements = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (structureFilter) params.append('codeStructure', structureFilter);
      if (statutFilter) params.append('statut', statutFilter);

      const res = await api.get(`/comptes/emplacements?${params.toString()}`);
      if (res.data) setEmplacements(res.data.data || res.data);
    } catch (err) {
      let filtered = [...MOCK_EMPLACEMENTS];
      if (roleFilter) filtered = filtered.filter(e => e.role === roleFilter);
      if (statutFilter) filtered = filtered.filter(e => e.statut === statutFilter);
      if (structureFilter) filtered = filtered.filter(e => e.codeStructure === structureFilter);
      setEmplacements(filtered);
    }
  };

  const handleCreateEmplacement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/comptes/emplacements', newEmplacement);
      setShowNouvelEmplacementModal(false);
      fetchEmplacements();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création de l\'emplacement');
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      await api.post('/structures', newStructure);
      setShowNouvelleStructureModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création de la structure');
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      await api.post('/structures/types', newType);
      setShowNouveauTypeModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création du type');
    }
  };

  const handleCreateNiveau = async (e) => {
    e.preventDefault();
    try {
      await api.post('/structures/niveaux', newNiveau);
      setShowNouveauNiveauModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création du niveau');
    }
  };
const handleAttribuer = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      matricule: matriculeInput,
      codeEmplacement: emplacementSelectionne.codeEmplacement,
      role: emplacementSelectionne.role,
      codeStructure: emplacementSelectionne.codeStructure
    };

    const response = await api.post('/comptes/attribuer', payload);

    if (response.data && response.data.success) {
      alert('Lien d\'activation envoyé avec succès !');
      
      if (response.data.data?.token) {
        console.log('Token généré (dev) :', response.data.data.token);
      }

      setOpenModal(false);
      chargerEmplacements();
    }
  } catch (error) {
    console.error('Détail erreur attribution :', error.response);

    const status = error.response?.status;
    const messageServeur = error.response?.data?.message || error.response?.data?.error;

    if (status === 404) {
      alert(`Erreur : Agent introuvable avec le matricule ${matriculeInput}`);
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
      
      {/* En-tête Global avec Logo et Message de bienvenue */}
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
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 rounded-xl">
                    <Users className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.agents || 0}</p>
                    <p className="text-xs text-slate-500 font-medium">Agents enregistrés</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.structures || structures.length}</p>
                    <p className="text-xs text-slate-500 font-medium">Structures actives</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Ticket className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.ticketsTotal || 0}</p>
                    <p className="text-xs text-slate-500 font-medium">Total Tickets Système</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.ticketsClotures || 0}</p>
                    <p className="text-xs text-slate-500 font-medium">Tickets Clôturés</p>
                  </div>
                </div>
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
                      <option value=""> Rôles</option>
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrer par Structure</label>
                    <select
                      value={structureFilter}
                      onChange={(e) => setStructureFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="">Structures</option>
                      {structures.map((s) => (
                        <option key={s.id || s.codeStructure} value={s.codeStructure}>
                          {s.codeStructure} - {s.designation}
                        </option>
                      ))}
                    </select>
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
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-4">
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
                    {structures.map((s) => (
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
                          <button type="button" className="text-cyan-600 hover:underline font-semibold cursor-pointer">
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
                        <p className="text-[11px] text-slate-500">{t.description || 'Aucune description'}</p>
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
                        <p className="text-[11px] text-slate-500">Rang hiérarchique : {n.rang || 'N/A'}</p>
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
                  <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs text-slate-600 font-medium">
                      {importFile ? importFile.name : 'agents_ministere.xlsx'}
                    </span>
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
                      value={newStructure.emailResponsable}
                      onChange={(e) => setNewStructure({ ...newStructure, emailResponsable: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Numéro téléphone</label>
                    <input
                      type="tel"
                      placeholder="+229..."
                      value={newStructure.telephoneResponsable}
                      onChange={(e) => setNewStructure({ ...newStructure, telephoneResponsable: e.target.value })}
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

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Description</label>
                <textarea
                  placeholder="Description du type de structure"
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-20"
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
                  value={newNiveau.rang}
                  onChange={(e) => setNewNiveau({ ...newNiveau, rang: parseInt(e.target.value) })}
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

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Structure</label>
                <select
                  value={newEmplacement.codeStructure}
                  onChange={(e) => setNewEmplacement({ ...newEmplacement, codeStructure: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  required
                >
                  <option value="">Sélectionner une structure</option>
                  {structures.map((s) => (
                    <option key={s.id || s.codeStructure} value={s.codeStructure}>
                      {s.codeStructure} - {s.designation}
                    </option>
                  ))}
                </select>
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