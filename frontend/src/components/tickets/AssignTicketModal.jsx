import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { X, UserPlus, Tag, AlertCircle, Check } from 'lucide-react';

export default function AssignTicketModal({ isOpen, onClose, ticket, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTechnicien, setSelectedTechnicien] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && ticket) {
      setSelectedCategory(ticket.categorieId || ticket.categorie?.id || '');
      setSelectedTechnicien(ticket.technicienId || ticket.technicien?.id || '');
      
      const fetchData = async () => {
        try {
          const [resCats, resTechs] = await Promise.all([
            api.get('/categories'),
            api.get('/utilisateurs/techniciens'),
          ]);
          setCategories(resCats.data);
          setTechniciens(resTechs.data);
        } catch (err) {
          setError("Erreur lors du chargement des catégories ou techniciens.");
        }
      };
      
      fetchData();
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedCategory && selectedCategory !== (ticket.categorieId || ticket.categorie?.id)) {
        await api.patch(`/tickets/${ticket.id}/categorie`, {
          categorieId: selectedCategory,
        });
      }

      if (selectedTechnicien && selectedTechnicien !== (ticket.technicienId || ticket.technicien?.id)) {
        await api.post(`/tickets/${ticket.id}/affecter`, {
          technicienId: selectedTechnicien,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
        
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Traiter le Ticket</h3>
            <p className="text-xs text-indigo-600 font-mono font-semibold">{ticket.reference}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catégorie du problème
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.libelle || cat.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Affecter à un Technicien
            </label>
            <select
              value={selectedTechnicien}
              onChange={(e) => setSelectedTechnicien(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="">-- Sélectionner un technicien --</option>
              {techniciens.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.nom} {tech.prenom} ({tech.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}