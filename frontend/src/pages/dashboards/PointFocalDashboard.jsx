import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, CheckCircle, XCircle, Plus, X, LogOut } from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/workflowService';
import DashboardHeader from '../../components/layout/DashboardHeader';

export default function PointFocalDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newAgent, setNewAgent] = useState({
    matricule: '', nom: '', prenom: '', sexe: 'M', numero: '', email: ''
  });

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agents');
      const payload = res.data?.data || res.data || [];
      setAgents(Array.isArray(payload) ? payload : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les agents.');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/agents', newAgent);
      setFeedback('Agent enregistre avec succes.');
      setIsModalOpen(false);
      setNewAgent({ matricule: '', nom: '', prenom: '', sexe: 'M', numero: '', email: '' });
      fetchAgents();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible d\'enregistrer cet agent.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (agent) => {
    try {
      const action = agent.actif ? 'desactiver' : 'reactiver';
      await api.patch(`/agents/${agent.matricule}/${action}`);
      fetchAgents();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Impossible de modifier le statut de cet agent.');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  const filteredAgents = agents.filter((a) =>
    (a.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(a.matricule || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">

      <DashboardHeader title="Bienvenue sur votre Espace Point Focal" onLogout={handleLogout} />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
      )}
      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{feedback}</div>
      )}

      <div className="sticky top-[104px] z-20 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs text-slate-500 font-medium">{filteredAgents.length} Agent(s) enregistré(s)</span>
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#15aabf]"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#15aabf] hover:opacity-90 text-white font-semibold text-xs rounded-xl cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Nouvel Agent
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="p-4">Matricule</th>
              <th className="p-4">Nom & Prénom</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Chargement...</td>
              </tr>
            ) : filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Aucun agent trouvé.</td>
              </tr>
            ) : (
              filteredAgents.map((agent) => (
                <tr key={agent.matricule} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{agent.matricule}</td>
                  <td className="p-4">{agent.nom} {agent.prenom}</td>
                  <td className="p-4 text-slate-500">{agent.email} ({agent.numero})</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${agent.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {agent.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleStatus(agent)}
                      className="text-xs font-semibold text-slate-600 hover:underline cursor-pointer"
                    >
                      {agent.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout Agent */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">Ajouter un Agent</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Matricule</label>
                <input required type="text" value={newAgent.matricule} onChange={e => setNewAgent({...newAgent, matricule: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Nom</label>
                  <input required type="text" value={newAgent.nom} onChange={e => setNewAgent({...newAgent, nom: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Prénom</label>
                  <input required type="text" value={newAgent.prenom} onChange={e => setNewAgent({...newAgent, prenom: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Sexe</label>
                <select value={newAgent.sexe} onChange={e => setNewAgent({...newAgent, sexe: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input required type="email" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Téléphone</label>
                <input required type="text" value={newAgent.numero} onChange={e => setNewAgent({...newAgent, numero: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 text-slate-600">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#15aabf] text-white font-semibold rounded-xl disabled:opacity-50">
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
