import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  LogIn,
  UserPlus,
  Edit3,
  Save,
  LifeBuoy,
  Send,
  Clock,
  CheckCircle2,
  FileText,
  HelpCircle,
  ShieldCheck,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { authService } from '../services/workflowService';

export default function Home() {
  const navigate = useNavigate();

  const [chargement, setChargement] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');

  const [agentInfo, setAgentInfo] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    email: '',
    telephone: ''
  });

  const [brouillon, setBrouillon] = useState({ nom: '', prenom: '' });

  useEffect(() => {
    const donneesBrutes = sessionStorage.getItem('agentPreview');

    if (!donneesBrutes) {
      navigate('/verification');
      return;
    }

    const donnees = JSON.parse(donneesBrutes);

    setAgentInfo({
      nom: donnees.nom,
      prenom: donnees.prenom,
      matricule: donnees.matricule,
      email: donnees.email,
      telephone: donnees.numeroTelephone
    });

    setChargement(false);
  }, [navigate]);

  const handleBrouillonChange = (e) => {
    const { name, value } = e.target;
    setBrouillon((prev) => ({ ...prev, [name]: value }));
  };

  const commencerEdition = () => {
    setBrouillon({ nom: agentInfo.nom, prenom: agentInfo.prenom });
    setErreur('');
    setIsEditing(true);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnregistrement(true);

    const donneesBrutes = sessionStorage.getItem('agentPreview');
    const { matricule, code } = JSON.parse(donneesBrutes);

    try {
      await authService.updateAgentProfile(matricule, code, brouillon.nom, brouillon.prenom);

      const nouvelAgentInfo = { ...agentInfo, nom: brouillon.nom, prenom: brouillon.prenom };
      setAgentInfo(nouvelAgentInfo);

      const donneesMisesAJour = { ...JSON.parse(donneesBrutes), nom: brouillon.nom, prenom: brouillon.prenom };
      sessionStorage.setItem('agentPreview', JSON.stringify(donneesMisesAJour));

      setIsEditing(false);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de mettre a jour vos informations.');
    } finally {
      setEnregistrement(false);
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">

      {/* ================= HEADER / BARRE DE NAVIGATION ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <img
              src="/logo_sante.png"
              alt="Logo Ministere"
              className="h-10 sm:h-12 object-contain"
            />
            <div className="hidden md:block border-l border-slate-200 pl-3">
              <p className="text-xs font-bold text-slate-800">Portail d'Assistance IT</p>
              <p className="text-[10px] text-slate-500">Ministere de la Sante — Benin</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>

            <button
              onClick={() => navigate('/inscription')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer"
              style={{ backgroundColor: '#15aabf' }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Creer un compte</span>
            </button>
          </div>

        </div>
      </header>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-[#15aabf] to-cyan-700 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <h1 className="text-3xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenue sur votre plateforme de ticketing
            </h1>
            <p className="text-xs sm:text-sm text-cyan-50 leading-relaxed">
              Consultez vos informations d'agent, decouvrez l'ensemble des services d'assistance technique disponibles et suivez notre guide rapide pour prendre en main l'outil.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= CARTE ESPACE INFOS AGENT (GAUCHE) ================= */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-50 rounded-lg text-[#15aabf]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Fiche Agent</h2>
                  <p className="text-[11px] text-slate-500">Vos informations personnelles</p>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={commencerEdition}
                  className="p-2 text-slate-500 hover:text-[#15aabf] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Modifier votre nom et prenom"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveInfo}
                  disabled={enregistrement}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              )}
            </div>

            {erreur && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5">
                {erreur}
              </p>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Nom &amp; Prenom
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="nom"
                      value={brouillon.nom}
                      onChange={handleBrouillonChange}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                    />
                    <input
                      type="text"
                      name="prenom"
                      value={brouillon.prenom}
                      onChange={handleBrouillonChange}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                    />
                  </div>
                ) : (
                  <p className="font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {agentInfo.nom} {agentInfo.prenom}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Matricule
                </label>
                <p className="font-medium text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-100">
                  {agentInfo.matricule}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Adresse Email
                </label>
                <p className="font-medium text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-100">
                  {agentInfo.email}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Telephone
                </label>
                <p className="font-medium text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-100">
                  {agentInfo.telephone}
                </p>
              </div>
            </form>
          </div>

          {/* ================= SECTION GUIDE ET POSSIBILITES (DROITE) ================= */}
          <div className="lg:col-span-2 space-y-8">

            {/* CE QUE VOUS POUVEZ FAIRE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <LifeBuoy className="w-5 h-5 text-[#15aabf]" />
                <h2 className="text-base font-bold text-slate-800">
                  Que pouvez-vous faire sur cette plateforme ?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#15aabf]" /> Signaler une panne
                  </div>
                  <p className="text-slate-500">
                    Soumettez un ticket en quelques clics pour vos soucis de reseau, materiel ou logiciel metier.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#15aabf]" /> Suivi en temps reel
                  </div>
                  <p className="text-slate-500">
                    Suivez le statut de vos demandes (Soumis, En Cours, Resolu) et relancez directement en cas de besoin.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#15aabf]" /> Historique des interventions
                  </div>
                  <p className="text-slate-500">
                    Accedez a la liste complete de toutes vos interventions passees et leurs solutions.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#15aabf]" /> Assistance Directe
                  </div>
                  <p className="text-slate-500">
                    Soyez notifie des qu'un technicien prend en charge votre demande au niveau du Ministere.
                  </p>
                </div>
              </div>
            </div>

            {/* GUIDE D'UTILISATION ETAPE PAR ETAPE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-[#15aabf]" />
                <h2 className="text-base font-bold text-slate-800">
                  Guide Rapide d'Utilisation
                </h2>
              </div>

              <div className="space-y-4 text-xs">

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#15aabf] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">Connectez-vous a votre espace</h3>
                    <p className="text-slate-500">
                      Cliquez sur le bouton <strong>Se connecter</strong> en haut a droite avec vos identifiants d'agent. Si vous n'avez pas de compte, utilisez le bouton <strong>Creer un compte</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#15aabf] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">Creez un nouveau ticket</h3>
                    <p className="text-slate-500">
                      Depuis votre tableau de bord, cliquez sur <strong>Nouveau ticket</strong>. Renseignez la categorie (Materiel, Reseau, Logiciel) et decrivez brievement le probleme.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#15aabf] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">Suivez et relancez votre demande</h3>
                    <p className="text-slate-500">
                      Consultez l'onglet <strong>Soumis</strong>. Si votre demande n'a pas encore ete prise en charge, un bouton <strong>Relancer</strong> vous permet d'envoyer un rappel aux techniciens.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
