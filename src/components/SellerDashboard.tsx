import React, { useState, useEffect } from 'react';
import { Category, Product, ClothesState, UserAccount, Order } from '../types';
import { PlusCircle, Tag, Sparkles, Image, Check, CheckSquare, Plus, RefreshCw, ShoppingBag, MapPin, Store } from 'lucide-react';

interface SellerDashboardProps {
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  sellerProducts: Product[];
  onRemoveSellerProduct: (id: string) => void;
  activeAccount: UserAccount | null;
  orders?: Order[];
}

// Preset fashionable Unsplash clothes images for quick selection
const IMAGES_PRESETS = [
  {
    label: 'Robe Chic',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600',
  },
  {
    label: 'Veste Cuir',
    url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600',
  },
  {
    label: 'Chemise Motif',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600',
  },
  {
    label: 'Chaussures Retro',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600',
  },
  {
    label: 'Sac Vintage',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600',
  },
  {
    label: 'Sweat oversize',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
  }
];

export default function SellerDashboard({
  onAddProduct,
  sellerProducts,
  onRemoveSellerProduct,
  activeAccount,
  orders = [],
}: SellerDashboardProps) {
  // Compute sells and revenue stats
  const stats = React.useMemo(() => {
    let soldCount = 0;
    let totalRevenue = 0;
    const soldItemsList: Array<{
      productId: string;
      title: string;
      price: number;
      image: string;
      count: number;
      date: string;
    }> = [];

    const sellerProductIds = new Set(sellerProducts.map(p => p.id));
    
    orders.forEach(order => {
      order.items.forEach(item => {
        // Match product belonging to this seller
        if (sellerProductIds.has(item.productId)) {
          soldCount += 1;
          totalRevenue += item.price;
          
          const existing = soldItemsList.find(x => x.productId === item.productId);
          if (existing) {
            existing.count += 1;
          } else {
            soldItemsList.push({
              productId: item.productId,
              title: item.title,
              price: item.price,
              image: item.image,
              count: 1,
              date: order.createdAt
            });
          }
        }
      });
    });

    return {
      soldCount,
      totalRevenue,
      soldItemsList
    };
  }, [sellerProducts, orders]);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<Exclude<Category, 'Tous'>>('Femme');
  const [size, setSize] = useState('M');
  const [brand, setBrand] = useState('');
  const [state, setState] = useState<ClothesState>('Comme neuf');
  const [imageUrl, setImageUrl] = useState(IMAGES_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerCity, setSellerCity] = useState('Cocody, Abidjan');

  // Auto-prepopulate seller coordinates if logged in as a Seller
  useEffect(() => {
    if (activeAccount && activeAccount.role === 'seller') {
      setSellerName(activeAccount.fullName);
      setSellerPhone(activeAccount.phone);
      if (activeAccount.city) {
        setSellerCity(activeAccount.city);
      }
    }
  }, [activeAccount]);

  // Error Checkers
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Quick preset loader helper
  const handlePresetSelect = (url: string) => {
    setImageUrl(url);
    if (errors.imageUrl) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.imageUrl;
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errorDetails: Record<string, string> = {};

    if (!title.trim() || title.length < 4) {
      errorDetails.title = 'Veuillez saisir un titre descriptif (ex: Veste à boutons dorés)';
    }

    if (!price || Number(price) <= 100) {
      errorDetails.price = 'Le prix de vente doit être supérieur à 100 FCFA';
    }

    if (originalPrice && Number(originalPrice) <= Number(price)) {
      errorDetails.originalPrice = 'Le prix d\'origine doit être supérieur au prix friperie proposé';
    }

    if (!imageUrl.trim()) {
      errorDetails.imageUrl = 'Une URL d\'image ou un preset est requis';
    }

    if (!description.trim() || description.length < 10) {
      errorDetails.description = 'Fournissez une description de l\'habit d\'au moins 10 caractères';
    }

    if (!sellerName.trim() || sellerName.length < 3) {
      errorDetails.sellerName = 'Indiquez votre prénom ou le nom de votre dressing';
    }

    const cleanPhone = sellerPhone.replace(/\s+/g, '');
    if (!cleanPhone) {
      errorDetails.sellerPhone = 'Votre numéro de téléphone est requis';
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      errorDetails.sellerPhone = 'Numéro ivoirien invalide (ex: 0708091011)';
    } else if (!/^(01|05|07)/.test(cleanPhone)) {
      errorDetails.sellerPhone = 'Doit débuter par 01, 05 ou 07';
    }

    setErrors(errorDetails);
    return Object.keys(errorDetails).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Trigger Callback
    onAddProduct({
      title,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description,
      category,
      size,
      brand: brand || undefined,
      state,
      images: [imageUrl],
      sellerName,
      sellerPhone,
      sellerCity,
    });

    setCreationSuccess(true);
    
    // Reset Form except contact settings for reuse
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setBrand('');
    setDescription('');
    
    setTimeout(() => {
      setCreationSuccess(false);
    }, 4000);
  };

  return (
    <div id="seller-portal" className="max-w-6xl mx-auto px-4 py-8 animate-fade-in space-y-8 font-sans text-neutral-850">
      
      {/* Title & Introduction */}
      <div className="border-b border-vibrant-border/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-vibrant-orange" />
            Espace Vendeur Ivoire Vintage
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez votre dressing, visualisez vos ventes et publiez de nouveaux vêtements en direct.
          </p>
        </div>
        
        {activeAccount && activeAccount.role === 'seller' && (
          <div className="bg-orange-50 text-vibrant-orange text-xs font-bold px-3.5 py-1.5 rounded-full border border-vibrant-border/80 flex items-center gap-2">
            <span>Boutique de :</span>
            <span className="font-extrabold underline">{activeAccount.fullName}</span>
          </div>
        )}
      </div>

      {/* STATISTICS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Sold products */}
        <div className="bg-emerald-50/40 rounded-3xl p-5 border border-vibrant-emerald/20 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-[#047857] uppercase tracking-wider font-display">Produits Vendus</span>
            <div className="text-xl sm:text-2xl font-black text-slate-800">
              {stats.soldCount} {stats.soldCount > 1 ? 'articles' : 'article'}
            </div>
            <p className="text-[10px] text-emerald-600/95 font-medium">Validés par paiement mobile</p>
          </div>
          <div className="p-3 bg-vibrant-emerald/10 text-vibrant-emerald rounded-2xl shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: Revenue generated */}
        <div className="bg-orange-50/45 rounded-3xl p-5 border border-vibrant-orange/10 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-vibrant-orange uppercase tracking-wider font-display">Revenus Générés</span>
            <div className="text-xl sm:text-2xl font-black text-slate-800">
              {stats.totalRevenue.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-[10px] text-stone-500 font-medium">Frais d'intermédiation : 0%</p>
          </div>
          <div className="p-3 bg-vibrant-orange/10 text-vibrant-orange rounded-2xl shrink-0">
            <Tag className="h-5 w-5 rotate-90" />
          </div>
        </div>

        {/* Metric 3: Active items listed */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/70 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider font-display">Articles Actifs</span>
            <div className="text-xl sm:text-2xl font-black text-slate-800">
              {sellerProducts.length} {sellerProducts.length > 1 ? 'habits' : 'habit'}
            </div>
            <p className="text-[10px] text-neutral-500 font-medium">Disponibles dans la vitrine</p>
          </div>
          <div className="p-3 bg-neutral-100 text-neutral-500 rounded-xl shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* SOLD ARTICLES CHRONICLER DETAILS LIST */}
      {stats.soldCount > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/70 shadow-xs space-y-4">
          <h4 className="text-xs font-black text-neutral-900 uppercase font-display tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <Sparkles className="h-4 w-4 text-vibrant-orange" />
            Suivi des ventes récentes ({stats.soldCount})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stats.soldItemsList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[#FFF7ED]/35 p-3 rounded-2xl border border-vibrant-border/40">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-10 h-12 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate leading-none font-display">{item.title}</p>
                  <p className="text-[11px] text-vibrant-emerald font-black mt-1.5 font-display">{item.price.toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5 font-semibold">Quantité vendue : x{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Add item Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-md border border-neutral-100 space-y-6">
          <div className="border-b border-vibrant-border/50 pb-4">
            <h3 className="text-xl font-black text-neutral-900 uppercase font-display">Vider Mon Dressing</h3>
            <p className="text-xs text-neutral-500">
              Vendez vos beaux vêtements inutilisés en Côte d'Ivoire. Remplissez cette fiche pour chiner en direct !
            </p>
          </div>

          {creationSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Habit en ligne !</p>
                <p>Votre vêtement a été publié avec succès. Vous pouvez le retrouver sur la page d'accueil de la boutique.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Title & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">Titre de l'habit*</label>
                <input
                  id="seller-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Robe cache-cœur rouge"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-850"
                />
                {errors.title && <p className="text-[10px] text-rose-650 font-semibold">{errors.title}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">Marque (ou "Sur-mesure")</label>
                <input
                  id="seller-brand-input"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Zara, Mango, Confection Locale"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855"
                />
              </div>
            </div>

            {/* Category / Size / Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">Rayon / Sexe*</label>
                <select
                  id="seller-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855 cursor-pointer font-bold font-display"
                >
                  <option value="Femme">Femme ♀</option>
                  <option value="Homme">Homme ♂</option>
                  <option value="Enfant">Enfant 👶</option>
                  <option value="Accessoires">Accessoires 👜</option>
                  <option value="Premium">Premium ⭐</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">Taille (EU / Ans)*</label>
                <input
                  id="seller-size-input"
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Ex: M, L, XL, 38, 6 ans..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">État réel de l'habit*</label>
                <select
                  id="seller-state-select"
                  value={state}
                  onChange={(e) => setState(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855 cursor-pointer font-bold"
                >
                  <option value="Comme neuf">Comme neuf (porté une seule fois)</option>
                  <option value="Très bon état">Très bon état (sans aucun défaut)</option>
                  <option value="Bon état">Bon état (petites traces normales)</option>
                  <option value="Satisfaisant">Satisfaisant (petit prix)</option>
                </select>
              </div>
            </div>

            {/* Price tag in FCFA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">Prix de vente souhaité (FCFA)*</label>
                <input
                  id="seller-price-input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 5000"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855 font-bold"
                />
                {errors.price && <p className="text-[10px] text-rose-600 font-semibold">{errors.price}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">Prix estimé d'origine neuf (FCFA)</label>
                <input
                  id="seller-org-price-input"
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 15000"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855 font-bold"
                />
                {errors.originalPrice && <p className="text-[10px] text-rose-600 font-semibold">{errors.originalPrice}</p>}
              </div>
            </div>

            {/* Description card */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500 block">Description & Qualités*</label>
              <textarea
                id="seller-description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Racontez l'histoire de ce vêtement : matière, couleur exacte, si le tissu est extensible, etc."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855"
              ></textarea>
              {errors.description && <p className="text-[10px] text-rose-600 font-semibold">{errors.description}</p>}
            </div>

            {/* Preset Image chooser to facilitate mock uploads */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-neutral-500 block">L'image du vêtement* (Choisissez un preset ou mettez un lien)</label>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {IMAGES_PRESETS.map((preset, idx) => {
                  const isActive = imageUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(preset.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                        isActive ? 'border-vibrant-emerald ring-2 ring-vibrant-emerald/20' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1">
                        <span className="text-[9px] text-white font-bold leading-none truncate max-w-[50px]">
                          {preset.label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 bg-vibrant-emerald text-white rounded-full p-0.5">
                          <Check className="h-2 w-2" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Direct image input */}
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-neutral-400">
                  <Image className="h-4 w-4" />
                </span>
                <input
                  id="seller-manual-image-url"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Collez une adresse URL d'image personnalisée"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-vibrant-emerald text-neutral-855"
                />
              </div>
              {errors.imageUrl && <p className="text-[10px] text-rose-600 font-semibold">{errors.imageUrl}</p>}
            </div>

            {/* Direct Contact configurations for CIV matches */}
            <div className="bg-orange-50 p-4 rounded-2xl border border-vibrant-border space-y-4">
              <div className="flex items-center gap-2 text-neutral-850 font-bold mb-1">
                <MapPin className="h-4 w-4 text-vibrant-emerald" />
                <span className="font-display">Mes informations de contact vendeur</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 block">Mon Nom / Dressing*</label>
                  <input
                    id="seller-name-input"
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Ex: Marie Dressing"
                    className="w-full bg-white border border-vibrant-border rounded-xl px-2.5 py-2 focus:outline-none focus:border-vibrant-emerald text-[#1C1917]"
                  />
                  {errors.sellerName && <p className="text-[10px] text-rose-600 font-semibold">{errors.sellerName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 block">Mon Numéro WhatsApp/Mobile (10 chiffres)*</label>
                  <input
                    id="seller-phone-input"
                    type="tel"
                    maxLength={10}
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 0585951525"
                    className="w-full bg-white border border-vibrant-border rounded-xl px-2.5 py-2 focus:outline-none focus:border-vibrant-emerald text-[#1C1917]"
                  />
                  {errors.sellerPhone && <p className="text-[10px] text-rose-600 font-semibold">{errors.sellerPhone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 block">Ma zone à Abidjan/CI*</label>
                  <select
                    id="seller-city-select"
                    value={sellerCity}
                    onChange={(e) => setSellerCity(e.target.value)}
                    className="w-full bg-white border border-vibrant-border rounded-xl px-2.5 py-2 focus:outline-none focus:border-vibrant-emerald text-[#1C1917] text-xs cursor-pointer font-bold"
                  >
                    <option value="Cocody, Abidjan">Cocody, Abidjan</option>
                    <option value="Marcory, Abidjan">Marcory, Abidjan</option>
                    <option value="Yopougon, Abidjan">Yopougon, Abidjan</option>
                    <option value="Plateau, Abidjan">Plateau, Abidjan</option>
                    <option value="Treichville, Abidjan">Treichville, Abidjan</option>
                    <option value="Koumassi, Abidjan">Koumassi, Abidjan</option>
                    <option value="Port-Bouët, Abidjan">Port-Bouët, Abidjan</option>
                    <option value="Grand-Bassam">Grand-Bassam</option>
                    <option value="Yamoussoukro">Yamoussoukro</option>
                    <option value="Bouaké">Bouaké</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              id="submit-product-sell"
              type="submit"
              className="w-full bg-vibrant-emerald hover:bg-[#059669] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md mt-4 text-xs tracking-wide uppercase cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publier mon habit en direct</span>
            </button>

          </form>
        </div>

        {/* Right column: Current published listings */}
        <div className="lg:col-span-5 bg-[#FFF7ED]/30 p-6 rounded-3xl border border-vibrant-border/50 space-y-4 h-fit">
          <div className="border-b border-vibrant-border pb-3">
            <h4 className="text-sm font-black text-neutral-900 uppercase font-display">Mon Dressing Actif</h4>
            <p className="text-[11px] text-neutral-500">
              Retrouvez {sellerProducts.length} habit{sellerProducts.length > 1 ? 's' : ''} que vous avez listé{sellerProducts.length > 1 ? 's' : ''} depuis ce navigateur.
            </p>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-neutral-300 mx-auto">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="text-xs text-neutral-500">
                Vous n'avez pas encore publié d'habit. Remplissez le formulaire de gauche en 2 minutes pour voir vos fiches s'afficher ici !
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {sellerProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 bg-white p-3 rounded-2xl border border-vibrant-border/30 items-center justify-between shadow-sm"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-12 h-14 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 truncate font-display">{p.title}</h5>
                      <span className="text-[11px] font-extrabold text-[#059669] block mt-0.5 font-display">
                        {p.price.toLocaleString('fr-FR')} XOF
                      </span>
                      <span className="text-[10px] text-neutral-400 block">Taille : {p.size} ({p.state})</span>
                    </div>
                  </div>

                  <button
                    id={`btn-remove-listing-${p.id}`}
                    onClick={() => onRemoveSellerProduct(p.id)}
                    className="text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl px-3 py-1.5 transition-all shrink-0 bg-rose-50"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
