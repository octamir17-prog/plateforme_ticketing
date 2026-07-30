import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Layers, FileText, Paperclip, Send, ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';

export default function CreerTicket() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [titre, setTitre] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Impossible de charger les catégories depuis le serveur.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('categorieId', categorieId);
    formData.append('description', description);
    if (file) {
      formData.append('pieceJointe', file);
    }

    try {
      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/utilisateur/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-50px)] bg-slate-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 text-[#15aabf] rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Créer un Ticket</h1>
              <p className="text-xs text-slate-500">Remplissez le formulaire pour soumettre votre ticket</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Ticket créé avec succès ! Redirection en cours...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Titre du ticket <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Ticket className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                required
                type="text"
                placeholder="Ex: Problème d'impression sur l'imprimante réseau"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf] font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Catégorie de la panne <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                required
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf] font-medium text-slate-800 appearance-none cursor-pointer"
              >
                <option value="">{loadingCategories ? 'Chargement des catégories...' : 'Sélectionner une catégorie...'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Description détaillée <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                required
                rows="4"
                placeholder="Décrivez précisément le problème rencontré, les messages d'erreur affichés, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15aabf] font-medium text-slate-800 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Ajouter une pièce jointe <span className="text-slate-400 font-normal"></span>
            </label>
            {!file ? (
              <label className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-100/80 cursor-pointer transition-colors">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Choisir un fichier (PNG, JPG, PDF...)</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-cyan-50/50 border border-cyan-200/60 rounded-xl text-slate-700">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-[#15aabf] shrink-0" />
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading || success || loadingCategories}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#15aabf] hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Soumission...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Soumettre le ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}