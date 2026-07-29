import React, { useState } from 'react';
import { Users, UserPlus, Search, CheckCircle, XCircle, Plus, X } from 'lucide-react';

export default function PointFocalDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [agents, setAgents] = useState([
    { matricule: 'AG-894', nom: 'KPOHINTO', prenom: 'Jean-Marc', sexe: 'M', numero: '+229 97000000', email: 'jean@sante.gouv.bj', actif: true },
    { matricule: 'AG-312', nom: 'SOSSOU', prenom: 'Carine', sexe: 'F', numero: '+229 96112233', email: 'carine@sante.gouv.bj', actif: true }
  ]);

  const [newAgent, setNewAgent] = useState({
    matricule: '', nom: '', prenom: '', sexe: 'M', numero: '', email: ''
  });

  const handleAddAgent = (e) => {
    e.preventDefault();
    setAgents(prev => [...prev, { ...newAgent, actif: true }]);
    setIsModalOpen(false);
    setNewAgent({ matricule: '', nom: '', prenom: '', sexe: 'M', numero: '', email: '' });
  };

  const toggleStatus = (matricule) => {
    setAgents(prev => prev.map(a => a.matricule === matricule ? { ...a, actif: !a.actif } : a));
  };

  const filteredAgents = agents.filter(a => 
    a.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            Bienvenue sur votre Espace Point Focal 
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#15aabf] hover:opacity-90 text-white font-semibold text-xs rounded-xl cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouvel Agent
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
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
        <span className="text-xs text-slate-500 font-medium">{filteredAgents.length} Agent(s) enregistré(s)</span>
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
            {filteredAgents.map((agent) => (
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
                    onClick={() => toggleStatus(agent.matricule)}
                    className="text-xs font-semibold text-slate-600 hover:underline cursor-pointer"
                  >
                    {agent.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
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
                <label className="block font-semibold mb-1">Email</label>
                <input required type="email" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Téléphone</label>
                <input required type="text" value={newAgent.numero} onChange={e => setNewAgent({...newAgent, numero: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 text-slate-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#15aabf] text-white font-semibold rounded-xl">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}