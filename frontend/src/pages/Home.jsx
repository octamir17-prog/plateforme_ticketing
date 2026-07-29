import React, { useState } from 'react';
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
  Building2,
  Phone,
  Mail,
  User
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  // Mode édition pour les infos de l'agent
  const [isEditing, setIsEditing] = useState(false);
  const [agentInfo, setAgentInfo] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    direction: '',
    email: '',
    telephone: ''
  });

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setAgentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Informations mises à jour avec succès !');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      
      {/* ================= HEADER / BARRE DE NAVIGATION ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <img 
              src="/logo_sante.png" 
              alt="Logo Ministère" 
              className="h-10 sm:h-12 object-contain"
            />
            <div className="hidden md:block border-l border-slate-200 pl-3">
              <p className="text-xs font-bold text-slate-800">Portail d'Assistance IT</p>
              <p className="text-[10px] text-slate-500">Ministère de la Santé — Bénin</p>
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
              <span>Créer un compte</span>
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
              Consultez vos informations d'agent, découvrez l'ensemble des services d'assistance technique disponibles et suivez notre guide rapide pour prendre en main l'outil.
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
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-500 hover:text-[#15aabf] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Modifier les informations"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveInfo}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Enregistrer
                </button>
              )}
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Nom & Prénom
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="nom"
                      value={agentInfo.nom}
                      onChange={handleInfoChange}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                    />
                    <input
                      type="text"
                      name="prenom"
                      value={agentInfo.prenom}
                      onChange={handleInfoChange}
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
                {isEditing ? (
                  <input
                    type="text"
                    name="matricule"
                    value={agentInfo.matricule}
                    onChange={handleInfoChange}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                  />
                ) : (
                  <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {agentInfo.matricule}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Direction / Service
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="direction"
                    value={agentInfo.direction}
                    onChange={handleInfoChange}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                  />
                ) : (
                  <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {agentInfo.direction}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Adresse Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={agentInfo.email}
                    onChange={handleInfoChange}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                  />
                ) : (
                  <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {agentInfo.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="telephone"
                    value={agentInfo.telephone}
                    onChange={handleInfoChange}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15aabf]"
                  />
                ) : (
                  <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {agentInfo.telephone}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* ================= SECTION GUIDE ET POSSIBILITÉS (DROITE) ================= */}
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
                    Soumettez un ticket en quelques clics pour vos soucis de réseau, matériel ou logiciel métier.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#15aabf]" /> Suivi en temps réel
                  </div>
                  <p className="text-slate-500">
                    Suivez le statut de vos demandes (Soumis, En Cours, Résolu) et relancez directement en cas de besoin.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#15aabf]" /> Historique des interventions
                  </div>
                  <p className="text-slate-500">
                    Accédez à la liste complète de toutes vos interventions passées et leurs solutions.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#15aabf]" /> Assistance Directe
                  </div>
                  <p className="text-slate-500">
                    Soyez notifié dès qu'un technicien prend en charge votre demande au niveau du Ministère.
                  </p>
                </div>
              </div>
            </div>

            {/* GUIDE D'UTILISATION ÉTAPE PAR ÉTAPE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-[#15aabf]" />
                <h2 className="text-base font-bold text-slate-800">
                  Guide Rapide d'Utilisation
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Étape 1 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#15aabf] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">Connectez-vous à votre espace</h3>
                    <p className="text-slate-500">
                      Cliquez sur le bouton <strong>Se connecter</strong> en haut à droite avec vos identifiants d'agent. Si vous n'avez pas de compte, utilisez le bouton <strong>Créer un compte</strong>.
                    </p>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#15aabf] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">Créez un nouveau ticket</h3>
                    <p className="text-slate-500">
                      Depuis votre tableau de bord, cliquez sur <strong>Nouveau ticket</strong>. Renseignez la catégorie (Matériel, Réseau, Logiciel) et décrivez brièvement le problème.
                    </p>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#15aabf] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800">Suivez et relancez votre demande</h3>
                    <p className="text-slate-500">
                      Consultez l'onglet <strong>Soumis</strong>. Si votre demande n'a pas encore été prise en charge, un bouton <strong>Relancer</strong> vous permet d'envoyer un rappel aux techniciens.
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