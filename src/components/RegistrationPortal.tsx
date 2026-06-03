import React, { useState } from 'react';
import { UserAccount } from '../types';
import { DELIVERY_ZONES } from '../data';
import { User, ShieldCheck, ShoppingBag, Store, Sparkles, CheckCircle, Smartphone, MapPin, Mail, LogOut, RefreshCw, Lock, Key } from 'lucide-react';

interface RegistrationPortalProps {
  activeAccount: UserAccount | null;
  onRegister: (account: UserAccount) => void;
  onLogout: () => void;
  onSwitchAccount: (account: UserAccount) => void;
  savedAccounts: UserAccount[];
}

export default function RegistrationPortal({
  activeAccount,
  onRegister,
  onLogout,
  onSwitchAccount,
  savedAccounts,
}: RegistrationPortalProps) {
  // Toggle between 'login' and 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Register fields
  const [roleTab, setRoleTab] = useState<'client' | 'seller' | 'admin'>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Cocody, Abidjan');
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [addressDetail, setAddressDetail] = useState('');
  const [adminCode, setAdminCode] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status & Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Helper to click-to-autofill credentials
  const handleAutofill = (emailVal: string, passVal: string) => {
    setLoginEmail(emailVal);
    setLoginPassword(passVal);
    setGlobalError('');
  };

  // Switch mode helper
  const handleToggleMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setErrors({});
    setGlobalError('');
  };

  // Validate Inscription inputs
  const validateRegisterForm = () => {
    const errs: { [key: string]: string } = {};
    
    if (!fullName.trim()) {
      errs.fullName = 'Le nom complet est obligatoire';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'Le nom doit faire au moins 3 caractères';
    }

    if (!email.trim()) {
      errs.email = "L'adresse email est requise";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Format d'email invalide";
    }

    if (!password) {
      errs.password = 'Le mot de passe est obligatoire';
    } else if (password.length < 5) {
      errs.password = 'Le mot de passe doit contenir au moins 5 caractères';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Le numéro de téléphone est requis';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Le numéro de Côte d\'Ivoire doit contenir exactement 10 chiffres (ex: 0708091011)';
    } else if (!['01', '05', '07'].includes(cleanPhone.substring(0, 2))) {
      errs.phone = 'Le numéro doit commencer par un préfixe valide : 01, 05 ou 07';
    }

    if (roleTab === 'client') {
      if (!addressDetail.trim()) {
        errs.addressDetail = 'Veuillez préciser votre adresse de livraison exacte';
      } else if (addressDetail.trim().length < 10) {
        errs.addressDetail = 'Veuillez fournir plus de précisions (ex: repères, immeuble, rue)';
      }
    }

    if (roleTab === 'admin') {
      if (!adminCode.trim()) {
        errs.adminCode = 'La clé d\'accès administrateur est obligatoire';
      } else if (adminCode.trim() !== 'admin225') {
        errs.adminCode = 'Clé d\'accès incorrecte ! Astuce: saisissez admin225';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (!loginEmail.trim() || !loginPassword) {
      setGlobalError('Veuillez renseigner votre adresse email et mot de passe.');
      return;
    }

    setSuccessAnimation(true);

    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Identifiants incorects.');
      }

      setTimeout(() => {
        onRegister(data.user);
        setSuccessAnimation(false);
        setLoginEmail('');
        setLoginPassword('');
      }, 800);

    } catch (err: any) {
      setSuccessAnimation(false);
      setGlobalError(err.message || 'Une erreur est survenue lors de la connexion.');
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (!validateRegisterForm()) return;

    setSuccessAnimation(true);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, ''),
      role: roleTab,
      password: password,
      ...(roleTab === 'seller' ? { city } : roleTab === 'client' ? { 
        commune: DELIVERY_ZONES[selectedZoneIdx].name,
        address: addressDetail.trim()
      } : {})
    };

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer le compte.");
      }

      setTimeout(() => {
        onRegister(data);
        setSuccessAnimation(false);
        // Clear fields
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setAddressDetail('');
        setAdminCode('');
        setErrors({});
      }, 1000);

    } catch (err: any) {
      setSuccessAnimation(false);
      setGlobalError(err.message || "Erreur de communication avec le serveur.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-8 font-sans">
      
      {/* Header Info */}
      <div className="border-b border-vibrant-border/50 pb-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="h-6 w-6 text-vibrant-orange" />
            Espace Membres Ivoire Vintage
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Profitez de l'accès sécurisé à notre friperie chic d'Abidjan. Connectez-vous ou rejoignez-nous pour gérer vos commandes ou pièces à vendre en temps réel !
          </p>
        </div>
        
        {activeAccount && (
          <div className="flex items-center gap-2 bg-vibrant-emerald/10 text-[#047857] text-xs font-bold px-3 py-1.5 rounded-full border border-vibrant-emerald/20">
            <span>Connecté en tant que :</span>
            <span className="underline font-extrabold">{activeAccount.fullName}</span>
            <span className="bg-slate-900 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full ml-1 font-display">
              {activeAccount.role === 'client' ? 'Client VIP' : activeAccount.role === 'seller' ? 'Vendeur' : 'Directeur Admin'}
            </span>
          </div>
        )}
      </div>

      {/* RENDER ACTIVE ACCOUNT SUMMARY PAGE IF CONNECTED */}
      {activeAccount ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Card metadata */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-vibrant-border/50 shadow-md space-y-6">
            <div className="flex items-center gap-3 border-b border-orange-150 pb-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 border border-vibrant-border flex items-center justify-center text-vibrant-orange font-bold text-lg font-display">
                {activeAccount.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-black text-neutral-900 font-display">{activeAccount.fullName}</h4>
                <p className="text-xs text-neutral-400">Profil créé le {new Date(activeAccount.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Rôle sur la plateforme</span>
                <span className="text-neutral-800 font-extrabold flex items-center gap-1.5">
                  {activeAccount.role === 'client' ? (
                    <>
                      <ShoppingBag className="h-4 w-4 text-vibrant-emerald" />
                      Client VIP (Acheteur)
                    </>
                  ) : activeAccount.role === 'seller' ? (
                    <>
                      <Store className="h-4 w-4 text-vibrant-orange" />
                      Vendeur Particulier
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-rose-600" />
                      Super-Administrateur
                    </>
                  )}
                </span>
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Adresse email de connexion</span>
                <span className="text-neutral-800 font-bold flex items-center gap-1.5 truncate" title={activeAccount.email}>
                  <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                  {activeAccount.email}
                </span>
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Numéro de téléphone (+225)</span>
                <span className="text-neutral-800 font-extrabold flex items-center gap-1.5 text-vibrant-emerald">
                  <Smartphone className="h-4 w-4 text-vibrant-emerald" />
                  {activeAccount.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}
                </span>
              </div>

              {activeAccount.role === 'client' ? (
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                  <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Commune principale</span>
                  <span className="text-neutral-800 font-bold flex items-center gap-1.5 truncate">
                    <MapPin className="h-4 w-4 text-vibrant-orange" />
                    {activeAccount.commune?.split(' (')[0]}
                  </span>
                </div>
              ) : activeAccount.role === 'seller' ? (
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                  <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Ville / Quartier d'attache</span>
                  <span className="text-neutral-800 font-bold flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-vibrant-orange" />
                    {activeAccount.city}
                  </span>
                </div>
              ) : (
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                  <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Zone de juridiction</span>
                  <span className="text-neutral-800 font-bold flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-600" />
                    Abidjan Central
                  </span>
                </div>
              )}

              {activeAccount.role === 'client' && activeAccount.address && (
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1 sm:col-span-2">
                  <span className="text-neutral-400 block font-semibold text-[10px] uppercase">Adresse de livraison par défaut</span>
                  <p className="text-neutral-800 font-bold leading-relaxed">{activeAccount.address}</p>
                </div>
              )}
            </div>

            {/* VIP perk card */}
            <div className="p-4 bg-orange-50/55 rounded-2xl border border-vibrant-border flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-vibrant-emerald shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1 font-sans text-xs">
                <p className="font-extrabold text-stone-900 font-display">Vos avantages actifs (Serveur local relié)</p>
                {activeAccount.role === 'client' ? (
                  <p className="text-neutral-600 leading-relaxed">
                    Saisie automatique activée dans le panier d'achat ! Vos informations de livraison (+225 {activeAccount.phone}) et votre adresse détaillée sont conservées au niveau de notre base backend pour un paiement accéléré.
                  </p>
                ) : activeAccount.role === 'seller' ? (
                  <p className="text-neutral-600 leading-relaxed">
                    Ajout automatique activé dans le formulaire "Vider Mon Dressing". Vos coordonnées de contact et votre région de vente sont stockées sur le serveur pour vous faire gagner du temps lors de vos publications de friperie.
                  </p>
                ) : (
                  <p className="text-neutral-600 leading-relaxed">
                    Félicitations, vous êtes connecté en tant que Super Admin. Les outils de gestion réels de commande et l'administration des comptes du serveur sont débloqués.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-logout-account-portal"
                onClick={onLogout}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold px-5 py-3 rounded-xl transition-all cursor-pointer border border-rose-200/50 hover:shadow-xs"
              >
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter de ce profil</span>
              </button>
            </div>
          </div>

          {/* Accounts Registered Switcher list in the browser */}
          <div className="bg-white rounded-3xl p-6 border border-vibrant-border/50 shadow-md space-y-4">
            <h4 className="text-sm font-black text-neutral-900 uppercase font-display border-b border-neutral-100 pb-2">
              Comptes mémorisés ({savedAccounts.length})
            </h4>
            
            {savedAccounts.length <= 1 ? (
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Aucun autre profil n'est mémorisé localement. Connectez ou inscrivez un autre compte pour alterner les rôles.
              </p>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {savedAccounts
                  .filter((acc) => acc.id !== activeAccount.id)
                  .map((acc) => (
                    <button
                      key={acc.id}
                      id={`btn-switch-to-${acc.id}`}
                      onClick={() => onSwitchAccount(acc)}
                      className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-orange-50/40 border border-neutral-200/60 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display shrink-0 ${
                          acc.role === 'client' ? 'bg-vibrant-emerald/10 text-vibrant-emerald' : acc.role === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-vibrant-orange/10 text-vibrant-orange'
                        }`}>
                          {acc.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 truncate group-hover:text-vibrant-emerald">{acc.fullName}</p>
                          <span className="text-[9px] text-neutral-400 font-semibold block uppercase">
                            {acc.role === 'client' ? 'Client VIP' : acc.role === 'admin' ? 'Admin' : 'Vendeur'} • +225 {acc.phone}
                          </span>
                        </div>
                      </div>
                      <RefreshCw className="h-3 w-3 text-neutral-300 group-hover:text-vibrant-emerald shrink-0 group-hover:rotate-180 transition-all duration-300" />
                    </button>
                  ))}
              </div>
            )}

            <div className="border-t border-neutral-100 pt-3">
              <p className="text-[10px] text-neutral-400 font-medium leading-normal">
                Note : Votre identification est mémorisée pour basculer facilement d'un compte à un autre lors de vos tests.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* DISCONNECTED OR LOGIN/REGISTER LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form container */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-md border border-vibrant-border/30 space-y-6">
            
            {/* Mode switch buttons: Connection vs Inscription */}
            <div className="flex border-b border-neutral-100 pb-1">
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold text-center transition-all border-b-2 cursor-pointer ${
                  authMode === 'login'
                    ? 'border-vibrant-emerald text-vibrant-emerald text-sm font-black'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Se Connecter
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('register')}
                className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold text-center transition-all border-b-2 cursor-pointer ${
                  authMode === 'register'
                    ? 'border-vibrant-emerald text-vibrant-emerald text-sm font-black'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Créer un compte
              </button>
            </div>

            {globalError && (
              <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200/55 font-bold">
                {globalError}
              </div>
            )}

            {/* 1. SE CONNECTER (LOGIN SCREEN) */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-neutral-800 block flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-450" />
                    <span>Adresse Email</span>
                  </label>
                  <input
                    id="login-input-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (globalError) setGlobalError('');
                    }}
                    placeholder="Ex: davsdavid45@gmail.com"
                    className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-neutral-800 block flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-neutral-450" />
                    <span>Mot de passe</span>
                  </label>
                  <input
                    id="login-input-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (globalError) setGlobalError('');
                    }}
                    placeholder="Entrez votre mot de passe"
                    className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800 font-mono"
                  />
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={successAnimation}
                  className="w-full bg-vibrant-emerald hover:bg-[#059669] text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md mt-6 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {successAnimation ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Authentification en cours...</span>
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      <span>Ouvrir ma session</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. S'INSCRIRE (REGISTER FORM) */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Role Switcher */}
                <div className="grid grid-cols-3 gap-2 bg-[#FFF7ED] p-1.5 rounded-2xl border border-vibrant-border/50">
                  <button
                    id="reg-role-client"
                    type="button"
                    onClick={() => {
                      setRoleTab('client');
                      setErrors({});
                    }}
                    className={`py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleTab === 'client'
                        ? 'bg-vibrant-emerald text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Acheteur</span>
                  </button>
                  
                  <button
                    id="reg-role-seller"
                    type="button"
                    onClick={() => {
                      setRoleTab('seller');
                      setErrors({});
                    }}
                    className={`py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleTab === 'seller'
                        ? 'bg-vibrant-orange text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    <span>Vendeur</span>
                  </button>

                  <button
                    id="reg-role-admin"
                    type="button"
                    onClick={() => {
                      setRoleTab('admin');
                      setErrors({});
                    }}
                    className={`py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleTab === 'admin'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                </div>

                {/* Nom */}
                <div className="space-y-1">
                  <label className="text-xs mr-1 font-extrabold text-neutral-800 block">
                    {roleTab === 'admin' ? 'Nom complet de l\'administrateur' : roleTab === 'client' ? 'Nom complet du Client (Acheteur)' : 'Nom ou Pseudo vendeur'}
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={roleTab === 'admin' ? "Ex: David Soro" : roleTab === 'client' ? "Ex: Kouame Koffi Marc" : "Ex: Mary Dressing Chic"}
                    className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800"
                  />
                  {errors.fullName && <p className="text-[10px] text-rose-600 font-bold">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs mr-1 font-extrabold text-neutral-800 block">Adresse Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contact@friperieivoirienne.ci"
                    className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800"
                  />
                  {errors.email && <p className="text-[10px] text-rose-600 font-bold">{errors.email}</p>}
                </div>

                {/* Mot de passe d'inscription */}
                <div className="space-y-1">
                  <label className="text-xs mr-1 font-extrabold text-neutral-800 block">Créer un mot de passe</label>
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe sécurisé"
                    className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800 font-mono"
                  />
                  {errors.password && <p className="text-[10px] text-rose-600 font-bold">{errors.password}</p>}
                </div>

                {/* Téléphone */}
                <div className="space-y-1">
                  <label className="text-xs mr-1 font-extrabold text-neutral-800 block">
                    Numéro de téléphone Côte d'Ivoire (10 chiffres)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-neutral-400 font-bold">+225</span>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="0708091011"
                      className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl pl-12 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800 font-bold"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-600 font-bold">{errors.phone}</p>}
                </div>

                {/* Client / Seller details fields */}
                {roleTab === 'client' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-neutral-800 block">Secteur / Commune de livraison principale</label>
                      <select
                        id="reg-commune"
                        value={selectedZoneIdx}
                        onChange={(e) => setSelectedZoneIdx(Number(e.target.value))}
                        className="w-full bg-white border border-vibrant-border rounded-xl px-3 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald cursor-pointer font-bold"
                      >
                        {DELIVERY_ZONES.map((zone, idx) => (
                          <option key={idx} value={idx}>
                            {zone.name.split(' (')[0]} (Tarif: {zone.price.toLocaleString('fr-FR')} FCFA)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-neutral-800 block">Adresse de livraison détaillée</label>
                      <textarea
                        id="reg-address"
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        placeholder="Ex: Cocody Angré 22ème Arrondissement, face à la pharmacie de l'avenue, Immeuble Grace, 3ème étage, porte B5"
                        className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald min-h-[70px]"
                      ></textarea>
                      {errors.addressDetail && <p className="text-[10px] text-rose-600 font-bold">{errors.addressDetail}</p>}
                    </div>
                  </>
                ) : roleTab === 'seller' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-neutral-800 block">Ville ou Commune de résidence</label>
                    <select
                      id="reg-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-vibrant-border rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald cursor-pointer font-bold"
                    >
                      <option value="Cocody, Abidjan">Cocody, Abidjan</option>
                      <option value="Marcory, Abidjan">Marcory, Abidjan</option>
                      <option value="Plateau, Abidjan">Plateau, Abidjan</option>
                      <option value="Yopougon, Abidjan">Yopougon, Abidjan</option>
                      <option value="Koumassi, Abidjan">Koumassi, Abidjan</option>
                      <option value="Treichville, Abidjan">Treichville, Abidjan</option>
                      <option value="Grand-Bassam">Grand-Bassam</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-neutral-800 block">Clé de contrôle Administrateur</label>
                    <input
                      id="reg-admin-code"
                      type="password"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Entrez la phrase secrète d'habilitation"
                      className="w-full bg-[#FFF7ED]/25 border border-vibrant-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800 font-mono shadow-xs"
                    />
                    {errors.adminCode && <p className="text-[10px] text-rose-600 font-bold">{errors.adminCode}</p>}
                    <p className="text-[10px] text-neutral-400 font-medium">Pour tester l'accès admin réel, saisissez : <span className="font-bold text-slate-900">admin225</span></p>
                  </div>
                )}

                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={successAnimation}
                  className="w-full bg-vibrant-emerald hover:bg-[#059669] text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md mt-6 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {successAnimation ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saisie d'inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Créer mon compte</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Side perks column + CLICK-TO-AUTOFILL credentials cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Autofill test credentials widget (Extremely helpful!) */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-4 font-sans">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Comptes de Test Réels (Clic-Remplir)</h4>
              </div>
              <p className="text-[10.5px] text-slate-300 leading-normal">
                Découvrez le fonctionnement réel de notre backend en un clic ! Cliquez sur l'un des boutons de profil ci-dessous, puis cliquez sur <b>"Ouvrir ma session"</b> :
              </p>

              <div className="space-y-2.5">
                {/* Admin button fill */}
                <button
                  type="button"
                  onClick={() => handleAutofill("davsdavid45@gmail.com", "admin225")}
                  className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl text-left border border-slate-700/60 transition-all cursor-pointer group text-xs"
                >
                  <div>
                    <span className="font-bold text-rose-450 block text-[10.5px]">👑 Soro David (Super-Admin)</span>
                    <span className="text-[10px] text-slate-400 font-mono block">david@ivoirevintage.ci • Pass: admin225</span>
                  </div>
                  <span className="text-[9px] bg-rose-500/10 text-rose-400 font-extrabold uppercase px-1.5 py-0.5 rounded border border-rose-500/20">
                    Saisie ⚡
                  </span>
                </button>

                {/* Client button fill */}
                <button
                  type="button"
                  onClick={() => handleAutofill("client@example.com", "password123")}
                  className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 rounded-xl text-left border border-slate-700/60 transition-all cursor-pointer group text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-400 block text-[10.5px]">🛍️ Kouamé Koffi (Client VIP)</span>
                    <span className="text-[10px] text-slate-400 font-mono block">client@example.com • Pass: password123</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold uppercase px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Saisie ⚡
                  </span>
                </button>
              </div>
            </div>

            {/* Perks notice */}
            <div className="bg-[#FFF7ED]/45 rounded-3xl p-6 border border-vibrant-border space-y-4">
              <h4 className="text-sm font-black text-neutral-900 uppercase font-display border-b border-vibrant-border pb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-vibrant-orange" />
                Avantages Plateforme
              </h4>
              
              <ul className="space-y-3.5 text-xs text-neutral-600">
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 text-vibrant-emerald flex items-center justify-center shrink-0 mt-0.5">✓</div>
                  <div>
                    <b className="text-neutral-800 font-display block">Double Rôle Client et Vendeur</b>
                    La base de donnée accepte des inscriptions indépendantes pour acheter ou lister des habits.
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 text-vibrant-emerald flex items-center justify-center shrink-0 mt-0.5">✓</div>
                  <div>
                    <b className="text-neutral-800 font-display block">Sauvegarde en temps réel</b>
                    Toutes vos commandes et articles de dressings sont mis à jour instantanément sur le serveur.
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
