import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  Trash2, 
  Search, 
  DollarSign, 
  Check, 
  ShieldAlert,
  Smartphone,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Order, Product, UserAccount } from '../types';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  activeAccount: UserAccount | null;
  savedAccounts: UserAccount[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onAddSystemOrder: (order: Order) => void;
}

export default function AdminPanel({
  orders,
  products,
  activeAccount,
  savedAccounts,
  onUpdateOrderStatus,
  onDeleteOrder,
  onDeleteProduct,
}: AdminPanelProps) {
  // Simple view tab toggle
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'accounts'>('stats');
  
  // Search and filters
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // 1. STATISTIQUES RÉELLES
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    
    // Revenue from completed or paid orders
    const totalRevenue = orders
      .filter(o => o.status === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const paidOrders = orders.filter(o => o.status === 'paid').length;

    // Accounts distribution
    const clientCount = savedAccounts.filter(a => a.role === 'client').length;
    const sellerCount = savedAccounts.filter(a => a.role === 'seller').length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      paidOrders,
      totalProducts: products.length,
      totalUsers: savedAccounts.length,
      clientCount,
      sellerCount,
    };
  }, [orders, products, savedAccounts]);

  // 2. DISPATCH FILTERS (Mobile Friendly list filtering)
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const query = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerPhone.includes(query) ||
        o.deliveryZone.toLowerCase().includes(query)
      );
    });
  }, [orders, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const query = productSearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(query) ||
        p.sellerName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });
  }, [products, productSearch]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 animate-fade-in space-y-6 font-sans pb-24">
      
      {/* Mini Admin Panel Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-400">Administration Réelle</h2>
            <p className="text-xs text-slate-350 font-extrabold leading-tight">Ivoire Vintage - Abidjan</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
          Gérez l'ensemble des commandes clients et modérez le catalogue en direct de manière simplifiée et sécurisée.
        </p>
      </div>

      {/* ADMIN SIMPLE NAVIGATION ACTIONS */}
      <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2 text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-slate-900'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer text-center relative ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-slate-900'
          }`}
        >
          Commandes
          {stats.pendingOrders > 0 && (
            <span className="absolute -top-1 -right-1 bg-vibrant-orange text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {stats.pendingOrders}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === 'products'
              ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-slate-900'
          }`}
        >
          Catalogue
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`py-2 text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === 'accounts'
              ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-slate-900'
          }`}
        >
          Comptes
        </button>
      </div>

      {/* PANEL 1: STATISTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-4 animate-fade-in text-sans">
          
          <div className="grid grid-cols-2 gap-3">
            {/* Revenue card */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider">REVENUS</span>
                <DollarSign className="w-3.5 h-3.5 text-vibrant-emerald" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white mt-2 leading-none">
                {formatPrice(stats.totalRevenue)}
              </p>
              <p className="text-[8.5px] text-neutral-400 mt-1">Cumulé payé / livré</p>
            </div>

            {/* Total Orders card */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider">COMMANDES</span>
                <ShoppingBag className="w-3.5 h-3.5 text-vibrant-orange" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white mt-2 leading-none">
                {stats.totalOrders} cmd(s)
              </p>
              <p className="text-[8.5px] text-neutral-400 mt-1">
                {stats.pendingOrders} en cours • {stats.deliveredOrders} livrées
              </p>
            </div>

            {/* Total Products card */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider">ARTICLES</span>
                <Package className="w-3.5 h-3.5 text-vibrant-emerald" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white mt-2 leading-none">
                {stats.totalProducts} fiches
              </p>
              <p className="text-[8.5px] text-neutral-400 mt-1">Garde-robe publique active</p>
            </div>

            {/* Total accounts card */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider">COMPTES GÉOS</span>
                <Users className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white mt-2 leading-none">
                {stats.totalUsers} profils
              </p>
              <p className="text-[8.5px] text-neutral-400 mt-1">
                {stats.clientCount} clients • {stats.sellerCount} vendeurs
              </p>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-neutral-950 p-4 rounded-xl border border-vibrant-border/40 text-[11px] leading-relaxed text-slate-800 dark:text-neutral-300">
            <p className="font-extrabold text-stone-900 dark:text-neutral-100 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-vibrant-orange" />
              <span>Suivi logistique d'Abidjan</span>
            </p>
            <p className="mt-1">
              Les commandes de vêtements sont payées à la livraison (COD) par défaut. Vous devez changer le statut de la commande en <b>Payée / Livrée</b> dès que vos livreurs ramènent les fonds de livraison.
            </p>
            <p className="mt-2 text-[10px] text-neutral-450 dark:text-neutral-500 font-mono">
              Admin actif : {activeAccount ? activeAccount.fullName : 'Soro David'}
            </p>
          </div>

        </div>
      )}

      {/* PANEL 2: LIVE ORDERS AS CARD SHEETS */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="relative flex items-center bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl px-3 py-1.5 shadow-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher nom, n° de tél..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full bg-transparent border-none text-xs focus:outline-none py-1 px-2 text-stone-800 dark:text-neutral-200"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-950/40 rounded-2xl border-2 border-dashed border-neutral-150">
              <p className="text-xs text-neutral-400 font-bold uppercase">Aucune commande trouvée.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => (
                <div 
                  key={ord.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-150 dark:border-neutral-800 shadow-sm space-y-3 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-rose-600 block text-xs">{ord.id}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      {ord.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                          À livrer 🛵
                        </span>
                      )}
                      {ord.status === 'paid' && (
                        <span className="bg-emerald-100 text-vibrant-emerald text-[9px] font-black uppercase px-2 py-0.5 rounded">
                          Payée ✨
                        </span>
                      )}
                      {ord.status === 'delivered' && (
                        <span className="bg-blue-100 text-blue-850 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                          Livrable / Solde ☑
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer information */}
                  <div className="space-y-1.5 pt-1.5 border-t border-dotted border-neutral-250">
                    <p className="font-bold text-neutral-900 dark:text-white">
                      Client : <span className="font-extrabold">{ord.customerName}</span>
                    </p>
                    <p className="text-[11px] font-mono font-bold text-vibrant-emerald flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" />
                      <a href={`tel:${ord.customerPhone}`} className="hover:underline">+225 {ord.customerPhone}</a>
                    </p>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-vibrant-orange shrink-0 mt-0.5" />
                      <span>{ord.deliveryZone} ({ord.deliveryAddress})</span>
                    </p>
                    {ord.deliveryInstruction && (
                      <p className="bg-neutral-50 dark:bg-neutral-950 p-2 rounded-lg italic text-[10px] text-amber-800 font-medium">
                        " {ord.deliveryInstruction} "
                      </p>
                    )}
                    
                    {/* Price & payment */}
                    <div className="flex justify-between items-center bg-[#FFF7ED]/30 rounded-lg p-2 mt-2">
                      <span className="text-neutral-450">Méthode: {ord.paymentMethod === 'cod' ? 'Livraison (COD)' : ord.paymentMethod.toUpperCase()}</span>
                      <span className="font-black text-slate-900 dark:text-white">{formatPrice(ord.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-805">
                    {ord.status === 'pending' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'paid')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] py-1.5 rounded-lg uppercase cursor-pointer"
                      >
                        Marquer Payé
                      </button>
                    )}
                    {ord.status !== 'delivered' ? (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] py-1.5 rounded-lg uppercase cursor-pointer"
                      >
                        Marquer Livré
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'pending')}
                        className="flex-1 bg-neutral-200 hover:bg-neutral-250 text-slate-800 font-extrabold text-[10px] py-1.5 rounded-lg uppercase cursor-pointer"
                      >
                        Remettre en instance
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement la commande ${ord.id} ?`)) {
                          onDeleteOrder(ord.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg border border-rose-150 shrink-0 cursor-pointer"
                      title="Supprimer la commande"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* PANEL 3: CATALOG MODERATION LIST */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="relative flex items-center bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl px-3 py-1.5 shadow-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Chercher par vêtement..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full bg-transparent border-none text-xs focus:outline-none py-1 px-2 text-stone-800 dark:text-neutral-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id}
                className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-150 dark:border-neutral-800 flex gap-3 text-xs"
              >
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-16 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200 dark:border-neutral-800"
                />

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white truncate">{prod.title}</h4>
                    <p className="text-[11px] text-vibrant-emerald font-black mt-0.5">{formatPrice(prod.price)}</p>
                    <p className="text-[9.5px] text-neutral-400">Vendeur : {prod.sellerName}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-dashed border-neutral-100 dark:border-neutral-805 pt-1.5 mt-1.5">
                    <span className="text-[9.5px] uppercase font-bold text-neutral-400">Catégorie: {prod.category}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Éliminer définitivement l'article "${prod.title}" ?`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded border border-rose-200 text-[10px] font-black cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3 h-3 shrink-0" />
                      <span>Rayer</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-950/40 rounded-xl">
                <p className="text-xs text-neutral-450 font-bold">Aucun vêtement de friperie ne correspond.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* PANEL 4: USERS DIRECTORY */}
      {activeTab === 'accounts' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="space-y-2.5">
            {savedAccounts.map((account) => (
              <div 
                key={account.id}
                className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-150 dark:border-neutral-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-vibrant-orange flex items-center justify-center font-black">
                      {account.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-900 dark:text-white leading-tight">{account.fullName}</h4>
                      <p className="text-[10px] text-neutral-400">{account.email}</p>
                    </div>
                  </div>

                  <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.5 rounded ${
                    account.role === 'admin' 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : account.role === 'seller'
                        ? 'bg-orange-100 text-orange-850'
                        : 'bg-emerald-100 text-[#047857]'
                  }`}>
                    {account.role === 'admin' ? 'Super Admin' : account.role === 'seller' ? 'Vendeur' : 'Client VIP'}
                  </span>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-lg text-[10.5px] space-y-1 text-neutral-500">
                  <p>Inscrit le : <b>{new Date(account.createdAt || Date.now()).toLocaleDateString('fr-FR')}</b></p>
                  <p>Contact direct: <b className="text-stone-800 dark:text-neutral-350 font-mono">+225 {account.phone}</b></p>
                  {account.role === 'client' && (
                    <p>Commune & Adresse : <b className="text-vibrant-orange font-sans">{account.commune || 'Abidjan'}</b></p>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
