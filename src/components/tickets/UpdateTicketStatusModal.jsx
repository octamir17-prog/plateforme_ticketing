import React, { useState } from 'react';
import api from '../../api/client';
import { X, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

export default function UpdateTicketStatusModal({ isOpen, onClose, ticket, onSuccess }) {
  const [statut, setStatut] = useState('EN_COURS');
  const [rapport, setRapport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (statut === 'CLOTURE') {
        await api.post(`/tickets/${ticket.id}/cloturer`, {
          rapport: rapport,
        });
      } else {
        await api.patch(`/tickets/${ticket.id}/statut`, {
          statut: statut,
        });
      }

      setRapport('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
        
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Mettre à jour l'intervention</h3>
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
              Statut de l'intervention
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="EN_COURS">Pris en charge / En cours</option>
              <option value="CLOTURE">Clôturé / Résolu</option>
            </select>
          </div>

          {statut === 'CLOTURE' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rapport de résolution / Remarques
              </label>
              <textarea
                rows={3}
                value={rapport}
                onChange={(e) => setRapport(e.target.value)}
                placeholder="Expliquez brièvement l'action réalisée pour résoudre le problème..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

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
              {loading ? "Enregistrement..." : "Valider le changement"}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}