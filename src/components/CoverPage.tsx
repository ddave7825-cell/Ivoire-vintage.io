import React, { useState, useEffect } from 'react';
import { MapPin, Compass, ShieldCheck, Locate, Truck, ArrowRight, Sparkles, Globe, Navigation, RefreshCw, CheckCircle } from 'lucide-react';
import { DeliveryZone, UserAccount } from '../types';

interface CoverPageProps {
  onEnterBoutique: () => void;
  activeAccount: UserAccount | null;
  onUpdateAccountSettings?: (commune: string, address: string) => void;
  onNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

interface CommuneItem {
  name: string;
  lat: number;
  lng: number;
  price: number;
  time: string;
}

const IVOIRIAN_COMMUNES_GEOLIST: CommuneItem[] = [
  { name: 'Cocody (Deux Plateaux, Angré, Palmerie, Riviera)', lat: 5.3582, lng: -3.9818, price: 1500, time: '24-48h' },
  { name: 'Marcory (Zone 4, Bietry, Résidentiel)', lat: 5.3051, lng: -3.9936, price: 1500, time: '24-48h' },
  { name: 'Plateau (Quartier des affaires)', lat: 5.3211, lng: -4.0191, price: 1500, time: '24h' },
  { name: 'Treichville / Koumassi', lat: 5.2974, lng: -3.9620, price: 1500, time: '24-48h' },
  { name: 'Yopougon (Maroc, Selmer, Niangon)', lat: 5.3438, lng: -4.0805, price: 2000, time: '24-48h' },
  { name: 'Adjamé / Abobo / Anyama', lat: 5.3524, lng: -4.0125, price: 2000, time: '48h' },
  { name: 'Port-Bouët / Gonzagueville', lat: 5.2638, lng: -3.9421, price: 2000, time: '24-48h' },
  { name: 'Grand-Bassam', lat: 5.2104, lng: -3.7313, price: 3000, time: '48-72h' },
  { name: 'Yamoussoukro (Expédition UTB / Massa)', lat: 6.8153, lng: -5.2753, price: 3000, time: '48h à récupérer' },
  { name: 'Bouaké (Expédition sécurisée)', lat: 7.6908, lng: -5.0301, price: 4000, time: '48h à récupérer' },
  { name: 'San Pédro (Expédition maritime/route)', lat: 4.7502, lng: -6.6201, price: 4000, time: '72h à récupérer' }
];

// Helper to compute great-circle distance in kilometers
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function CoverPage({
  onEnterBoutique,
  activeAccount,
  onUpdateAccountSettings,
  onNotification
}: CoverPageProps) {
  // Geolocator states
  const [loadingGeoloc, setLoadingGeoloc] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [closestCommune, setClosestCommune] = useState<CommuneItem | null>(null);
  const [exactDistance, setExactDistance] = useState<number | null>(null);
  const [addressLine, setAddressLine] = useState('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Manual Geolocation demo options
  const [selectedDemoCommune, setSelectedDemoCommune] = useState<string>('');

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      onNotification(
        "Géolocalisation non supportée par votre navigateur actuel ou permission rejetée.",
        "error"
      );
      return;
    }

    setLoadingGeoloc(true);
    setIsSavedSuccessfully(false);
    onNotification("Interrogation du GPS de votre appareil en cours...", "info");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });

        // Calculate closest commune from list
        let minDistance = Infinity;
        let bestCommune: CommuneItem | null = null;

        IVOIRIAN_COMMUNES_GEOLIST.forEach((commune) => {
          const dist = getHaversineDistance(latitude, longitude, commune.lat, commune.lng);
          if (dist < minDistance) {
            minDistance = dist;
            bestCommune = commune;
          }
        });

        setClosestCommune(bestCommune);
        setExactDistance(minDistance);
        setLoadingGeoloc(false);

        if (bestCommune) {
          onNotification(
            `Localisation établie ! Proche de : ${(bestCommune as CommuneItem).name} (${minDistance.toFixed(1)} km)`,
            "success"
          );
        }
      },
      (error) => {
        console.warn("Geolocation denied or unavailable block within sandbox iframe, falling back to Abidjan Central network coords.", error);
        
        // Beautiful fallback near Cocody central coordinates
        const latitude = 5.3582;
        const longitude = -3.9818;
        setCoordinates({ latitude, longitude });

        let minDistance = Infinity;
        let bestCommune: CommuneItem | null = null;

        IVOIRIAN_COMMUNES_GEOLIST.forEach((commune) => {
          const dist = getHaversineDistance(latitude, longitude, commune.lat, commune.lng);
          if (dist < minDistance) {
            minDistance = dist;
            bestCommune = commune;
          }
        });

        setClosestCommune(bestCommune);
        setExactDistance(minDistance);
        setLoadingGeoloc(false);

        if (bestCommune) {
          onNotification(
            `Localisation estimée établie ! Proche de : ${(bestCommune as CommuneItem).name} (district d'Abidjan)`,
            "success"
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualCommuneSelect = (communeName: string) => {
    setSelectedDemoCommune(communeName);
    setIsSavedSuccessfully(false);
    const match = IVOIRIAN_COMMUNES_GEOLIST.find((c) => c.name === communeName);
    if (match) {
      setClosestCommune(match);
      setCoordinates({ latitude: match.lat, longitude: match.lng });
      setExactDistance(0); // perfect match
    }
  };

  const handleApplyToAccount = () => {
    if (!closestCommune) return;

    if (onUpdateAccountSettings) {
      onUpdateAccountSettings(closestCommune.name, addressLine || 'Localisation déterminée par GPS');
      setIsSavedSuccessfully(true);
      onNotification(
        `Adresse de livraison et commune configurées sur : ${closestCommune.name} !`,
        "success"
      );
    } else {
      // If client is not signed in, save details to temporary guest storage
      localStorage.setItem('friperie_guest_commune', closestCommune.name);
      localStorage.setItem('friperie_guest_address', addressLine || 'Géolocalisation à Abidjan');
      setIsSavedSuccessfully(true);
      onNotification(
        `Fait ! Commune enregistrée temporairement (${closestCommune.name}) pour votre panier.`,
        "success"
      );
    }
  };

  return (
    <div id="cover-view-container" className="animate-fade-in font-sans text-neutral-850 bg-stone-50 min-h-screen">
      
      {/* Immersive Cover Visual Header */}
      <div className="relative h-[480px] md:h-[550px] w-full overflow-hidden bg-neutral-950 flex flex-col justify-end">
        <img
          src="/src/assets/images/cover_fashion_banner_1780513084003.png"
          alt="Ivoire Vintage Cover"
          className="absolute inset-0 w-full h-full object-cover opacity-75 object-center hover:scale-105 transition-transform duration-700 pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Shadow Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/30"></div>

        {/* Floating Badges */}
        <div className="absolute top-6 left-6 z-10 flex gap-2 flex-wrap">
          <span className="bg-vibrant-orange text-white text-[10px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full border border-vibrant-orange/30 shadow-md">
            ★★ Collection Vintage Abidjan ★★
          </span>
          <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border border-emerald-500/35">
            Paiements Mobile Sécurisés
          </span>
        </div>

        {/* Content Box atop banner */}
        <div className="relative max-w-5xl mx-auto w-full px-6 md:px-8 pb-10 md:pb-16 text-white space-y-4 z-10">
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-xs text-orange-200 text-xs font-bold px-3 py-1 rounded-full border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-vibrant-orange animate-pulse" />
            <span>Chinez local, portez original</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter leading-none max-w-3xl drop-shadow-lg">
            SAPEZ-VOUS MIEUX <br />
            <span className="text-vibrant-orange bg-clip-text">À MOINDRE COÛT</span>
          </h1>

          <p className="text-stone-200 text-xs md:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-md">
            Découvrez des vêtements de seconde main uniques, soigneusement inspectés et triés par nos passionnés de mode à Abidjan. Achetez instantanément en direct via Wave, Orange ou MTN, ou dressez votre vide-dressing personnel !
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="cover-btn-enter"
              onClick={onEnterBoutique}
              className="bg-vibrant-orange hover:bg-[#EA580C] text-white text-xs md:text-sm font-black uppercase px-8 py-4 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-vibrant-orange/15 border-1 border-orange-500 hover:scale-[1.02] transform transition-all cursor-pointer"
            >
              <span>Accéder à la Vitrine</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            <a
              id="cover-btn-scroll-geo"
              href="#geolocator-anchor"
              className="bg-white/15 hover:bg-white/20 border border-white/25 text-white text-xs md:text-sm font-bold px-6 py-4 rounded-2xl transition-all block"
            >
              Calculer ma livraison GPS
            </a>
          </div>
        </div>
      </div>

      {/* CORE CONTENT LAYOUT: INTUITIVE VANTAGES & THE GEOLOCALISATEUR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Core Value Props Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-150 shadow-xs flex gap-4">
            <div className="bg-emerald-50 text-vibrant-emerald p-3.5 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase text-neutral-900 tracking-tight">Pièces Validées à 100%</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Toutes nos fiches articles comportent des précisions sur leur taille, marque et état réel ("Très bon état", "Bon état" etc.). Aucun compromis.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-150 shadow-xs flex gap-4">
            <div className="bg-orange-50 text-vibrant-orange p-3.5 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase text-neutral-900 tracking-tight">Livraison Rapide (Abidjan)</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Expédition en moins de 24h à 48h à domicile ou en point relais dans n'importe quelle commune ou district autonome.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-150 shadow-xs flex gap-4">
            <div className="bg-neutral-800 text-amber-400 p-3.5 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase text-white tracking-tight">Engagement Eco-Responsable</h3>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Prolongez le cycle de vie des vêtements, réduisez les déchets textiles en Côte d'Ivoire et soignez votre style vintage exclusif.
              </p>
            </div>
          </div>
        </div>

        {/* GEOLOCALISATEUR SECTION */}
        <section id="geolocator-anchor" className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-md grid grid-cols-1 lg:grid-cols-12">
          
          {/* Geolocalisateur Console UI */}
          <div className="p-6 md:p-10 lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#FCD34D] inline-block font-display">
                Géolocalisateur Automatique Iv-Vintage
              </span>
              <h2 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight leading-none">
                Estimez vos frais de livraison par satellite !
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                Notre module calcule de manière autonome la distance entre votre support connecté et les hubs logistiques d'Abidjan pour vous suggérer instantanément la commune de livraison la plus proche et adapter vos frais de livraison.
              </p>

              {/* Action and trigger buttons */}
              <div className="flex flex-wrap gap-3 pb-2 pt-1">
                <button
                  id="btn-geoloc-detect"
                  type="button"
                  onClick={handleLocateMe}
                  disabled={loadingGeoloc}
                  className="bg-vibrant-emerald hover:bg-[#059669] text-white text-xs font-bold px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-vibrant-emerald/10 disabled:opacity-60"
                >
                  {loadingGeoloc ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyse GPS...</span>
                    </>
                  ) : (
                    <>
                      <Locate className="h-4 w-4" />
                      <span>Détecter ma position</span>
                    </>
                  )}
                </button>
              </div>

              {/* Manual drop-down override for choice */}
              <div className="pt-2">
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
                  Ou choisissez manuellement votre commune d'intérêt :
                </label>
                <select
                  id="select-geoloc-manual"
                  value={selectedDemoCommune}
                  onChange={(e) => handleManualCommuneSelect(e.target.value)}
                  className="w-full max-w-sm bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald cursor-pointer"
                >
                  <option value="">Sélectionner une commune...</option>
                  {IVOIRIAN_COMMUNES_GEOLIST.map((comm) => (
                    <option key={comm.name} value={comm.name}>
                      {comm.name} (Frais : {comm.price} FCFA)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* If geolocation target computed */}
            {closestCommune ? (
              <div className="bg-emerald-50/75 p-5 rounded-3xl border border-vibrant-emerald/20 space-y-4 animate-scale-in">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#047857]/90 tracking-wider">
                      Point logistique détecté ou sélectionné
                    </span>
                    <h3 className="text-base font-black text-neutral-900 leading-snug mt-0.5">
                      {closestCommune.name}
                    </h3>
                  </div>

                  <span className="bg-vibrant-emerald/15 text-[#047857] text-xs font-black px-3.5 py-1.5 rounded-xl border border-vibrant-emerald/20 shrink-0 inline-flex items-center gap-1">
                    <Compass className="h-4 w-4 animate-spin text-vibrant-emerald" />
                    GPS Verrouillé
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t border-emerald-900/10 pt-3">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">FRAIS DE LIVRAISON :</span>
                    <span className="text-neutral-800 font-extrabold text-sm">{closestCommune.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">DÉLAI ESTIMÉ :</span>
                    <span className="text-neutral-800 font-extrabold text-sm">{closestCommune.time}</span>
                  </div>
                  {coordinates && (
                    <div className="sm:col-span-2 text-[11px] text-neutral-500 flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-[#047857]" />
                      <span>
                        Coordonnées : Lat {coordinates.latitude.toFixed(4)}, Lng {coordinates.longitude.toFixed(4)} 
                        {exactDistance !== null && exactDistance > 0 && ` (${exactDistance.toFixed(1)} km du centre)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Apply coordinates & commune parameters callback to login registry */}
                <div className="space-y-2 border-t border-emerald-900/10 pt-3">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block">
                    Compléter l'adresse de livraison (ex: Rue du Canal, Palmeraie face pharmacie) :
                  </label>
                  <input
                    id="input-geoloc-detail-address"
                    type="text"
                    placeholder="Précisez votre rue, carrefour, immeuble pour le livreur..."
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-white border border-emerald-300/40 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald"
                  />
                  
                  <button
                    id="btn-geoloc-save-action"
                    onClick={handleApplyToAccount}
                    className="w-full bg-[#047857] hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavedSuccessfully ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-white" />
                        <span>Paramètres appliqués avec succès !</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>Appliquer comme adresse de livraison par défaut</span>
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-neutral-500 italic">
                    {activeAccount
                      ? `Connecté en tant que ${activeAccount.fullName}. Cette action mettra à jour vos cordonnées VIP.`
                      : "Vous n'êtes pas connecté. Cette action pré-remplira automatiquement votre panier d'achat temporaire."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFF7ED]/60 border border-[#FED7AA]/50 p-5 rounded-3xl text-center space-y-2 py-8">
                <Compass className="h-8 w-8 text-[#EA580C] mx-auto animate-bounce" />
                <p className="text-xs font-bold text-neutral-800">Aucun signal capté pour le moment</p>
                <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                  Démarrez la détection par satellite ou choisissez votre commune ci-dessous pour calculer vos frais d'expédition en un clin d'œil.
                </p>
              </div>
            )}
          </div>

          {/* Map mockup and Logistics Overview */}
          <div className="bg-neutral-900 lg:col-span-5 text-white p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-display font-black text-sm uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 animate-spin text-amber-400" />
                Drapeau Logistique National
              </h3>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Notre centralisation logistique est basée en Zone 4, Abidjan. Les expéditions sont acheminées instantanément vers les points de dispatch communaux.
              </p>

              {/* Visual simulated minimalist vector map tracking Abidjan Loop */}
              <div className="relative bg-neutral-950/90 rounded-2xl border border-neutral-800 h-56 p-4 flex flex-col justify-between overflow-hidden">
                {/* Dynamic radar wave effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 bg-emerald-500/5 rounded-full border border-emerald-500/10 animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-emerald-500/5 rounded-full border border-emerald-500/20 animate-pulse"></div>

                <div className="flex justify-between items-start z-10 text-[9px] uppercase font-bold text-neutral-500 tracking-wider">
                  <span>RPA : District Vert</span>
                  <span>Lagune Ébrié</span>
                </div>

                {/* Minimalist stylized geographic indicators */}
                <div className="relative flex-1 flex items-center justify-center z-10">
                  <div className="absolute top-8 left-12 text-center">
                    <span className="block text-[8px] font-black text-neutral-600 font-mono">Yopougon</span>
                    <span className="inline-block w-1.5 h-1.5 bg-neutral-600 rounded-full"></span>
                  </div>
                  <div className="absolute top-12 right-12 text-center">
                    <span className="block text-[8px] font-black text-vibrant-orange font-mono">Cocody</span>
                    <span className="inline-block w-2 h-2 bg-vibrant-orange rounded-full animate-bounce"></span>
                  </div>
                  <div className="absolute bottom-8 left-20 text-center">
                    <span className="block text-[8px] font-black text-neutral-600 font-mono">Marcory / Zone 4</span>
                    <span className="inline-block w-1.5 h-1.5 bg-[#047857] rounded-full animate-pulse"></span>
                  </div>
                </div>

                <div className="flex justify-between items-end z-10">
                  <span className="text-[9px] font-semibold text-[#FCD34D]">Expéditeur Principal</span>
                  <span className="text-[8px] font-mono text-neutral-600">© MiniMap CI v2.63</span>
                </div>
              </div>
            </div>

            {/* Mini directory card list of delivery fees */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <h4 className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hubs logistiques actifs</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-200">
                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                  <span className="text-neutral-500 block">Cocody/Plat :</span>
                  <span className="font-bold">1 500 FCFA</span>
                </div>
                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                  <span className="text-neutral-500 block">Yopougon :</span>
                  <span className="font-bold">2 000 FCFA</span>
                </div>
                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                  <span className="text-neutral-500 block">Grand-Bassam :</span>
                  <span className="font-bold">3 000_FCFA</span>
                </div>
                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                  <span className="text-neutral-500 block">Yamoussoukro :</span>
                  <span className="font-bold">3 000_FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlighted Categories on Cover */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black uppercase font-display tracking-tight text-neutral-900">
              Les Tendances du Dressing
            </h3>
            <p className="text-xs text-neutral-500">Découvrez d'ores et déjà les opportunités du catalogue chic</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <button
              onClick={onEnterBoutique}
              className="group relative bg-[#FFF7ED] hover:bg-[#FED7AA]/30 border border-vibrant-border/50 py-6 px-4 rounded-3xl transition-all cursor-pointer shadow-xs"
            >
              <span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">👗</span>
              <span className="text-xs font-extrabold uppercase text-neutral-800 block">Femme</span>
              <span className="text-[10px] text-neutral-500 font-semibold block mt-0.5">Robes & jupes vintage</span>
            </button>

            <button
              onClick={onEnterBoutique}
              className="group relative bg-[#FFF7ED] hover:bg-[#FED7AA]/30 border border-vibrant-border/50 py-6 px-4 rounded-3xl transition-all cursor-pointer shadow-xs"
            >
              <span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">🧥</span>
              <span className="text-xs font-extrabold uppercase text-neutral-800 block">Homme</span>
              <span className="text-[10px] text-neutral-500 font-semibold block mt-0.5">Bombers & chemises</span>
            </button>

            <button
              onClick={onEnterBoutique}
              className="group relative bg-[#FFF7ED] hover:bg-[#FED7AA]/30 border border-vibrant-border/50 py-6 px-4 rounded-3xl transition-all cursor-pointer shadow-xs"
            >
              <span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">🧸</span>
              <span className="text-xs font-extrabold uppercase text-neutral-800 block">Enfant</span>
              <span className="text-[10px] text-neutral-500 font-semibold block mt-0.5">Barboteuses & vestes</span>
            </button>

            <button
              onClick={onEnterBoutique}
              className="group relative bg-[#FFF7ED] hover:bg-[#FED7AA]/30 border border-vibrant-border/50 py-6 px-4 rounded-3xl transition-all cursor-pointer shadow-xs"
            >
              <span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">💎</span>
              <span className="text-xs font-extrabold uppercase text-neutral-800 block">Premium</span>
              <span className="text-[10px] text-neutral-500 font-semibold block mt-0.5">Luxe & Haute Couture</span>
            </button>
          </div>
        </section>

      </div>
      
    </div>
  );
}
