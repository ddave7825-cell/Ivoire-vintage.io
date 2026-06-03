import React from 'react';
import { Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import VoiceSearchButton from './VoiceSearchButton';

interface HomeHeroProps {
  onStartShopping: () => void;
  onOpenSellPortal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNotification?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function HomeHero({
  onStartShopping,
  onOpenSellPortal,
  searchQuery,
  setSearchQuery,
  onNotification,
}: HomeHeroProps) {
  return (
    <div id="home-hero" className="relative bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA] overflow-hidden py-12 md:py-20 border-b border-vibrant-border">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-vibrant-emerald text-white px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-sm border border-vibrant-emerald">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Chinez 2e main Premium à Abidjan & Intérieur</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-none font-display">
              Vêtements de seconde main <span className="text-vibrant-emerald block sm:inline">Chics & Triés sur le volet</span>
            </h1>
            
            <p className="text-base sm:text-lg text-neutral-700 max-w-2xl mx-auto lg:mx-0 font-medium">
              Donnez une seconde vie à votre dressing ou chinez la crème de la friperie en Côte d'Ivoire. Payez en toute sécurité via <span className="font-bold text-vibrant-orange">Wave, Orange Money, MTN ou Moov</span>, nous assurons la livraison.
            </p>

            {/* Search Console */}
            <div className="max-w-md mx-auto lg:mx-0 p-1.5 bg-white rounded-2xl shadow-md border border-vibrant-border flex items-center gap-2">
              <input
                id="hero-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Robe d'été, Veste denim, Air Max, Zara..."
                className="flex-grow pl-4 py-3 bg-transparent text-sm focus:outline-none text-neutral-800"
              />
              <VoiceSearchButton
                onTranscript={(text) => {
                  setSearchQuery(text);
                  onStartShopping();
                }}
                onNotification={(msg, type) => {
                  if (onNotification) onNotification(msg, type);
                }}
              />
              <button
                id="btn-hero-search-action"
                onClick={onStartShopping}
                className="bg-vibrant-emerald hover:bg-[#059669] text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-sm shrink-0"
              >
                Rechercher
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="btn-start-shopping"
                onClick={onStartShopping}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm focus:outline-none active:scale-95"
              >
                Commencer à chiner
              </button>
              <button
                id="btn-sell-my-clothes"
                onClick={onOpenSellPortal}
                className="bg-white hover:bg-vibrant-warm text-neutral-800 text-sm font-bold px-6 py-3.5 rounded-xl transition-all border border-vibrant-border shadow-sm focus:outline-none"
              >
                Vendre mes habits
              </button>
            </div>
          </div>

          {/* Visual Showcase (Stunning Photo Collage or Card) */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md transform rotate-1 hover:rotate-0 transition-all duration-300">
              {/* Decorative Frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-vibrant-orange to-vibrant-emerald opacity-20 rounded-3xl blur-2xl -z-10"></div>
              
              <div className="bg-white p-4 rounded-3xl shadow-xl border border-vibrant-border">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600"
                  alt="Friperie Ivoirienne Chic"
                  className="rounded-2xl w-full h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Simulated live purchase bubble */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-vibrant-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FEF3C7] flex items-center justify-center text-vibrant-orange font-bold shrink-0 text-sm border border-vibrant-border">
                    K
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-950">Koumba à Yamoussoukro</p>
                    <p className="text-[10px] text-neutral-600">Acheté une Robe d'été jaune (6,500 FCFA)</p>
                  </div>
                  <div className="ml-auto bg-[#D1FAE5] text-vibrant-emerald text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold">
                    Payé Wave ☑
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Core Value Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-vibrant-border/50">
          <div className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-white/50 backdrop-blur-xs">
            <div className="p-2.5 bg-vibrant-emerald/10 text-vibrant-emerald rounded-xl border border-vibrant-emerald/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Qualité Certifiée</h4>
              <p className="text-xs text-neutral-600">Zéro trou, zéro tâche cachette</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-white/50 backdrop-blur-xs">
            <div className="p-2.5 bg-vibrant-emerald/10 text-vibrant-emerald rounded-xl border border-vibrant-emerald/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Livraison Express</h4>
              <p className="text-xs text-neutral-600">À domicile ou point relais fiable</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-white/50 backdrop-blur-xs">
            <div className="p-2.5 bg-vibrant-emerald/10 text-vibrant-emerald rounded-xl border border-vibrant-emerald/20">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">100% Mobile Money</h4>
              <p className="text-xs text-neutral-600">Wave, Orange, MTN ou Moov</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 p-3 rounded-2xl border border-white/50 backdrop-blur-xs">
            <div className="p-2.5 bg-vibrant-emerald/10 text-vibrant-emerald rounded-xl border border-vibrant-emerald/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Mode Circulaire Eco</h4>
              <p className="text-xs text-neutral-600">Chic, pas cher & responsable</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
