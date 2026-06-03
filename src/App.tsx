import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, CartItem, DeliveryZone, Order, ClothesState, UserAccount } from './types';
import { INITIAL_PRODUCTS } from './data';

// Import custom components
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import SellerDashboard from './components/SellerDashboard';
import OrderHistory from './components/OrderHistory';
import Notification from './components/Notification';
import RegistrationPortal from './components/RegistrationPortal';
import VoiceSearchButton from './components/VoiceSearchButton';
import CoverPage from './components/CoverPage';
import AdminPanel from './components/AdminPanel';
import SellerChatModal from './components/SellerChatModal';

import { Search, SlidersHorizontal, ChevronDown, Check, Tag, ShieldCheck, Heart, ArrowUpRight, HelpCircle, Wifi, WifiOff, Database, Globe, Phone, Headphones, MessageSquare, ExternalLink, User, ShoppingBag } from 'lucide-react';

export default function App() {
  // Dark mode toggle state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('friperie_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('friperie_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('friperie_theme', 'light');
    }
  }, [isDarkMode]);

  // Navigation states
  const [currentTab, setCurrentTab] = useState<'cover' | 'buy' | 'sell' | 'history' | 'register' | 'admin'>('cover');

  // Simulated live seller chat states
  const [activeChatProduct, setActiveChatProduct] = useState<Product | null>(null);

  // Customer Service Dialog popup state
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // Products list combining static seed and user listed products
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  // Cart list
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Focus and checkout states
  const [focusedProduct, setFocusedProduct] = useState<Product | null>(null);
  const [isCheckouting, setIsCheckouting] = useState(false);
  const [checkoutZone, setCheckoutZone] = useState<DeliveryZone | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState('');

  // Orders list
  const [orders, setOrders] = useState<Order[]>([]);

  // Catalog search/filter states
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('Tous');
  const [conditionFilter, setConditionFilter] = useState<string>('Tous');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');

  // Toggle layout selectors on mobile view
  const [showFilters, setShowFilters] = useState(false);

  // App Alerts notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active user profiles & accounts session states
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>([]);

  // Load state from local storage and real database on bootstrap
  useEffect(() => {
    // 1. Fetch products from real backend
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error loading products from server:", err);
        // Resilient local storage fallback
        const cachedCatalog = localStorage.getItem('friperie_full_catalog_cache');
        if (cachedCatalog) {
          try { setProducts(JSON.parse(cachedCatalog)); } catch (e) {}
        }
      });

    // 2. Fetch orders from real backend
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data: Order[]) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error("Error loading orders from server:", err);
        const savedOrders = localStorage.getItem('friperie_orders');
        if (savedOrders) {
          try { setOrders(JSON.parse(savedOrders)); } catch (e) {}
        }
      });

    // 3. Fetch accounts from real backend
    fetch('/api/accounts')
      .then((res) => res.json())
      .then((data: UserAccount[]) => {
        setSavedAccounts(data);
        const activeId = localStorage.getItem('friperie_active_id');
        if (activeId) {
          const match = data.find((a) => a.id === activeId);
          if (match) setActiveAccount(match);
        }
      })
      .catch((err) => {
        console.error("Error loading accounts from server:", err);
        const savedProfiles = localStorage.getItem('friperie_accounts');
        if (savedProfiles) {
          try {
            const parsed = JSON.parse(savedProfiles) as UserAccount[];
            setSavedAccounts(parsed);
            if (parsed.length > 0) setActiveAccount(parsed[0]);
          } catch (e) {}
        }
      });

    // 4. Get Cart
    const savedCart = localStorage.getItem('friperie_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart items', e);
      }
    }
  }, []);

  // Synchronize dynamic products state change with our global offline local cache
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('friperie_full_catalog_cache', JSON.stringify(products));
      localStorage.setItem('friperie_cache_timestamp', new Date().toISOString());
    }
  }, [products]);

  // Account handler callbacks
  const handleRegisterAccount = (newAccount: UserAccount) => {
    setSavedAccounts((prev) => [newAccount, ...prev.filter((a) => a.id !== newAccount.id)]);
    setActiveAccount(newAccount);
    localStorage.setItem('friperie_active_id', newAccount.id);

    // Sync saved accounts list cache
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setSavedAccounts(data))
      .catch(() => {});

    setNotification({
      message: `Connecté(e) en tant que ${newAccount.fullName} (${newAccount.role === 'client' ? 'Client VIP' : newAccount.role === 'admin' ? 'Administrateur' : 'Vendeur'}) avec succès !`,
      type: 'success',
    });
  };

  const handleLogoutAccount = () => {
    setActiveAccount(null);
    localStorage.removeItem('friperie_active_id');
    setNotification({
      message: 'Vous êtes maintenant déconnecté(e).',
      type: 'info',
    });
  };

  const handleSwitchAccount = (account: UserAccount) => {
    setActiveAccount(account);
    localStorage.setItem('friperie_active_id', account.id);
    setNotification({
      message: `Profil actif permuté : ${account.fullName}`,
      type: 'success',
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((updatedOrder: Order) => {
        setOrders((prev) => prev.map((ord) => ord.id === orderId ? updatedOrder : ord));
        setNotification({
          message: `Le statut de la commande ${orderId} a été mis à jour avec succès.`,
          type: 'success',
        });
      })
      .catch(() => {
        setNotification({
          message: `Impossible de modifier le statut sur le serveur.`,
          type: 'error',
        });
      });
  };

  const handleDeleteOrder = (orderId: string) => {
    fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error();
        setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
        setNotification({
          message: `La commande ${orderId} a été retirée des archives de livraison.`,
          type: 'info',
        });
      })
      .catch(() => {
        setNotification({
          message: `Échec de suppression sur le serveur.`,
          type: 'error',
        });
      });
  };

  const handleDeleteProduct = (productId: string) => {
    fetch(`/api/products/${productId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error();
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setSellerProducts((prev) => prev.filter((p) => p.id !== productId));
        setNotification({
          message: `L'article a été définitivement rayé du catalogue public.`,
          type: 'error',
        });
      })
      .catch(() => {
        setNotification({
          message: `Impossible de supprimer l'article du catalogue backend.`,
          type: 'error',
        });
      });
  };

  const handleAddSystemOrder = (order: Order) => {
    const updated = [order, ...orders];
    setOrders(updated);
    localStorage.setItem('friperie_orders', JSON.stringify(updated));
  };

  const handleUpdateAccountSettings = (commune: string, address: string) => {
    if (activeAccount) {
      const updatedAccount: UserAccount = {
        ...activeAccount,
        commune,
        address,
      };
      setActiveAccount(updatedAccount);

      const updatedAccounts = savedAccounts.map((a) =>
        a.id === updatedAccount.id ? updatedAccount : a
      );
      setSavedAccounts(updatedAccounts);
      localStorage.setItem('friperie_accounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('friperie_active_id', updatedAccount.id);
    }
  };

  // Save changes to localStorage helper
  const updateCartAndPersist = (newCart: CartItem[]) => {
    setCartItems(newCart);
    localStorage.setItem('friperie_cart', JSON.stringify(newCart));
  };

  // Add items inside shopper basket
  const handleAddToCart = (product: Product) => {
    // Check if garment is in stock
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      setNotification({
        message: `L'article "${product.title}" est déjà dans votre panier.`,
        type: 'info',
      });
      return;
    }

    const updated = [...cartItems, { product, quantity: 1 }];
    updateCartAndPersist(updated);
    setNotification({
      message: `"${product.title}" a bien été ajouté au panier !`,
      type: 'success',
    });
  };

  // Remove elements from shopping cart
  const handleRemoveFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    updateCartAndPersist(updated);
  };

  // Alter numbers (quantities) on shopping cart
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    updateCartAndPersist(updated);
  };

  // Put a new customized clothing item for sale (P2P input)
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductData)
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((newProduct: Product) => {
        setProducts((prev) => [newProduct, ...prev]);
        setSellerProducts((prev) => [newProduct, ...prev]);
        setNotification({
          message: `Votre vêtement "${newProduct.title}" est maintenant en ligne !`,
          type: 'success',
        });
      })
      .catch(() => {
        setNotification({
          message: `Une erreur est survenue lors de la sauvegarde sur le serveur.`,
          type: 'error',
        });
      });
  };

  // Remove listed garments by this specific user
  const handleRemoveSellerProduct = (productId: string) => {
    const updatedUserProducts = sellerProducts.filter((p) => p.id !== productId);
    setSellerProducts(updatedUserProducts);
    localStorage.setItem('friperie_user_products', JSON.stringify(updatedUserProducts));

    // Keep active listing in sync
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // Also purge if added inside shopping basket
    handleRemoveFromCart(productId);

    setNotification({
      message: 'L\'habit a bien été retiré de la vente.',
      type: 'info',
    });
  };

  // Final confirmation of Mobile Money or Cash on Delivery checkout payment sequence
  const handlePaymentSuccess = (orderMetaData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    // Map current basket items
    const itemsSnapshot = cartItems.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      image: item.product.images[0],
    }));

    const status: Order['status'] = orderMetaData.paymentMethod === 'cod' ? 'pending' : 'paid';

    const orderPayload = {
      ...orderMetaData,
      items: itemsSnapshot,
      status
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((newOrder: Order) => {
        setOrders((prev) => [newOrder, ...prev]);

        // Clear Basket completely
        updateCartAndPersist([]);
        
        // Close views
        setIsCheckouting(false);
        setIsCartOpen(false);

        // Direct redirection to Order history panel
        setCurrentTab('history');

        const amountFormatted = orderMetaData.totalPrice.toLocaleString('fr-FR') + ' FCFA';
        const notificationMessage = orderMetaData.paymentMethod === 'cod'
          ? `Félicitations ${orderMetaData.customerName}! Votre commande ${newOrder.id} est enregistrée en paiement à la livraison (Prévoyez ${amountFormatted} pour le livreur).`
          : `Félicitations ${orderMetaData.customerName}! Votre commande ${newOrder.id} est payée avec succès et en cours de livraison.`;

        setNotification({
          message: notificationMessage,
          type: 'success',
        });
      })
      .catch(() => {
        setNotification({
          message: `Impossible d'enregistrer la commande sur le serveur.`,
          type: 'error',
        });
      });
  };

    // Simulated email dispatch
    const userEmail = activeAccount ? activeAccount.email : 'davsdavid45@gmail.com';
    
    // Local simulation function for console inspection
    const simulateEmailSending = (email: string, id: string, amount: number) => {
      console.log(`%c[SIMULATION SERVICE] Mail de confirmation envoyé avec succès à : ${email}`, 'color: #059669; font-weight: bold; font-size: 11px;');
      console.log(`Données de commande transmises :`, {
        orderId: id,
        montantTotal: amount,
        destinataire: orderMetaData.customerName,
        telephone: orderMetaData.customerPhone,
        modeReglement: orderMetaData.paymentMethod === 'cod' ? 'Paiement à la livraison' : orderMetaData.paymentMethod.toUpperCase(),
        adresse: orderMetaData.deliveryAddress,
        instructions: orderMetaData.deliveryInstruction || "Aucune"
      });
    };

    simulateEmailSending(userEmail, orderId, orderMetaData.totalPrice);

    // Secondary email notification toast presented 4.2 seconds later
    setTimeout(() => {
      setNotification({
        message: `📧 Email de confirmation envoyé à ${userEmail} !`,
        type: 'info',
      });
    }, 4200);
  };

  // Confirm receipt of package
  const handleCompleteDelivery = (orderId: string) => {
    const updated = orders.map((ord) =>
      ord.id === orderId ? { ...ord, status: 'delivered' as const } : ord
    );
    setOrders(updated);
    localStorage.setItem('friperie_orders', JSON.stringify(updated));

    setNotification({
      message: 'Vous avez confirmé la bonne réception de vos vêtements de friperie. Merci à vous !',
      type: 'success',
    });
  };

  // Fast start helper from Hero Banner click
  const handleHeroStartShopping = () => {
    const searchAnchor = document.getElementById('catalog-anchor');
    if (searchAnchor) {
      searchAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter lists matching user requirements
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'Tous') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Free Text Search Match (Title, Brand, Owner)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q)
      );
    }

    // Size dropdown selector
    if (sizeFilter !== 'Tous') {
      result = result.filter((p) => p.size.toLowerCase() === sizeFilter.toLowerCase());
    }

    // Condition dropdown selector
    if (conditionFilter !== 'Tous') {
      result = result.filter((p) => p.state === conditionFilter);
    }

    // Sorting options: Price ascends or descends
    if (priceSort === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sizeFilter, conditionFilter, priceSort]);

  // Unique sizes existing in dynamic dataset
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.size) set.add(p.size);
    });
    return Array.from(set);
  }, [products]);

  // Total quantity of garments stored in active basket card
  const totalBasketCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Total amount computed inside basket card
  const totalBasketAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 dark:text-neutral-100 transition-colors duration-300">
      
      {/* Top Bar Notification Alerts */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main App Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={totalBasketCount}
        onOpenCart={() => setIsCartOpen(true)}
        sellerItemCount={sellerProducts.length}
        activeAccount={activeAccount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />



      {/* RENDER VIEW ACCORDING TO USER NAVIGATION */}
      <main className="flex-grow">
        
        {/* COVER LANDING & GEOLOCALISATEUR VIEW */}
        {currentTab === 'cover' && (
          <CoverPage
            onEnterBoutique={() => setCurrentTab('buy')}
            activeAccount={activeAccount}
            onUpdateAccountSettings={handleUpdateAccountSettings}
            onNotification={(message, type) => setNotification({ message, type })}
          />
        )}
        
        {/* BUY VIEW - BROWSE MARKETPLACE & THE CHIC SECOND-HAND */}
        {currentTab === 'buy' && (
          <div className="space-y-1">
            
            {/* Hero Board Banner */}
            <HomeHero
              onStartShopping={handleHeroStartShopping}
              onOpenSellPortal={() => setCurrentTab('sell')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onNotification={(message, type) => setNotification({ message, type })}
            />

            {/* Catalog list container & categories scroll anchor */}
            <div id="catalog-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
              
              {/* Category selector row chic */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-neutral-50 tracking-tight flex items-center flex-wrap gap-2">
                    <span>Le Catalogue Chic</span>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-250 tracking-wide dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                      BOUTIQUE ACTIVE 🇨🇮
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Un vêtement unique par fiche, premier arrivé premier servi !</p>
                </div>

                {/* Badged horizontal list */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide py-1">
                  {(['Tous', 'Femme', 'Homme', 'Enfant', 'Accessoires', 'Premium'] as Category[]).map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        id={`category-filter-btn-${cat}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl border shrink-0 transition-all ${
                          isActive
                            ? 'bg-vibrant-emerald text-white border-vibrant-emerald shadow-md shadow-vibrant-emerald/10'
                            : 'bg-white text-neutral-600 hover:text-neutral-950 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {cat === 'Tous' ? 'Tout voir' : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced filter & sorting strip option console */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-150 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  
                  {/* Text search container inside filters */}
                  <div className="relative flex-grow max-w-sm flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100/50 focus-within:bg-white focus-within:border-vibrant-emerald pl-3 pr-2 py-1 transition-all">
                    <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                    <input
                      id="search-box-input"
                      type="text"
                      placeholder="Rechercher une chemise, robe, coton..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow bg-transparent text-xs focus:outline-none text-neutral-800 py-1"
                    />
                    <VoiceSearchButton
                      onTranscript={(text) => setSearchQuery(text)}
                      onNotification={(message, type) => setNotification({ message, type })}
                      className="bg-transparent border-none p-1 text-vibrant-orange hover:text-[#EA580C]"
                    />
                  </div>

                  {/* Filter controls triggers */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-toggle-filters"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                        showFilters 
                          ? 'bg-emerald-50 text-vibrant-emerald border-emerald-300' 
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>{showFilters ? 'Fermer filtres' : 'Filtres avancés'}</span>
                    </button>

                    {/* Quick Sort Order selection */}
                    <select
                      id="select-price-order"
                      value={priceSort}
                      onChange={(e) => setPriceSort(e.target.value as any)}
                      className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-vibrant-emerald cursor-pointer"
                    >
                      <option value="default">Trier par : Récents</option>
                      <option value="asc">Prix : Croissant ↑</option>
                      <option value="desc">Prix : Décroissant ↓</option>
                    </select>
                  </div>

                </div>

                {/* Stretched Filters Board section toggled open */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-neutral-100 animate-slide-down">
                    
                    {/* Size selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Taille de l'habit</label>
                      <select
                        id="select-filter-size"
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald cursor-pointer"
                      >
                        <option value="Tous">Toutes tailles</option>
                        {availableSizes.map((sz) => (
                          <option key={sz} value={sz}>
                            Taille {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Condition selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">État du vêtement</label>
                      <select
                        id="select-filter-condition"
                        value={conditionFilter}
                        onChange={(e) => setConditionFilter(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-vibrant-emerald cursor-pointer"
                      >
                        <option value="Tous">Tous états</option>
                        <option value="Comme neuf">Comme neuf</option>
                        <option value="Très bon état">Très bon état</option>
                        <option value="Bon état">Bon état</option>
                        <option value="Satisfaisant">Satisfaisant</option>
                      </select>
                    </div>

                    {/* Quick helper stats */}
                    <div className="sm:col-span-2 flex items-end">
                      <div className="w-full bg-orange-50 p-2.5 rounded-xl border border-vibrant-border text-[11px] text-neutral-800 font-semibold flex items-center justify-between">
                        <span>Articles trouvés : <b className="text-vibrant-emerald">{filteredProducts.length} vêtements</b></span>
                        {(sizeFilter !== 'Tous' || conditionFilter !== 'Tous' || searchQuery !== '') && (
                          <button
                            id="btn-filters-reinit"
                            onClick={() => {
                              setSizeFilter('Tous');
                              setConditionFilter('Tous');
                              setSearchQuery('');
                            }}
                            className="text-vibrant-emerald underline hover:text-emerald-800"
                          >
                            Réinitialiser
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Product list catalog grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-neutral-100 shadow-inner">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-vibrant-emerald flex items-center justify-center mx-auto text-xl font-bold">
                    ☹
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="font-bold text-neutral-900 text-sm">Aucun habit ne correspond</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Essayez de réduire vos spécifications de filtres ou saisissez un autre terme pour trouver le bonheur dans nos dressings d'Abidjan.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onViewDetails={(prod) => setFocusedProduct(prod)}
                      onAddToCart={handleAddToCart}
                      onContactSeller={(prod) => setActiveChatProduct(prod)}
                    />
                  ))}
                </div>
              )}

              {/* Section Informative d'achat */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-sm">
                <div className="md:col-span-2 space-y-3">
                  <span className="text-[10px] bg-[#E0F2FE] border border-[#BAE6FD] uppercase font-bold tracking-wider text-[#0369A1] px-3 py-1.5 rounded-full inline-block font-display">
                    Notre Engagement Qualité
                  </span>
                  <h3 className="text-lg font-black text-neutral-900 uppercase">La Friperie Triée à Abidjan</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Chez <b>Friperie Ivoirienne</b>, nous voulons que vous soyez fier(e) de vos pièces de seconde main. Nos modérateurs et vendeurs s'engagent à ne publier que des articles propres, d'excellente qualité, lavés et prêts à être portés. Pas de couture décousue, pas d'usures inattendues!
                  </p>
                </div>
                <div className="bg-[#FFF7ED] p-4 rounded-2xl border border-vibrant-border flex flex-col justify-center space-y-2">
                  <h4 className="text-xs font-bold text-neutral-850 font-display">Besoin d'aide ?</h4>
                  <p className="text-[11px] text-neutral-500">
                    Notre service client est disponible sur WhatsApp 24h/24 pour assister votre cycle d'achat ou de revente.
                  </p>
                  <a
                    id="btn-support-footer"
                    href="https://wa.me/2250700000000"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-[10px] text-center py-2.5 rounded-xl block tracking-wide"
                  >
                    Parler à un conseiller ☑
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SELL VIEW - EMPTY YOUR CLOSET / VENDER DE SEGUNDA MANO */}
        {currentTab === 'sell' && (
          <SellerDashboard
            onAddProduct={handleAddProduct}
            sellerProducts={sellerProducts}
            onRemoveSellerProduct={handleRemoveSellerProduct}
            activeAccount={activeAccount}
            orders={orders}
          />
        )}

        {/* ORDER TRACKING / SUIVI LIST VIEW */}
        {currentTab === 'history' && (
          <OrderHistory
            orders={orders}
            onCompleteDelivery={handleCompleteDelivery}
          />
        )}

        {/* ACCOUNT REGISTRATION AND PROFILE PORTAL */}
        {currentTab === 'register' && (
          <RegistrationPortal
            activeAccount={activeAccount}
            onRegister={handleRegisterAccount}
            onLogout={handleLogoutAccount}
            onSwitchAccount={handleSwitchAccount}
            savedAccounts={savedAccounts}
          />
        )}

        {/* ADMIN CONTROL PANEL ROUTE */}
        {currentTab === 'admin' && activeAccount?.role === 'admin' && (
          <AdminPanel
            orders={orders}
            products={products}
            activeAccount={activeAccount}
            savedAccounts={savedAccounts}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onDeleteProduct={handleDeleteProduct}
            onAddSystemOrder={handleAddSystemOrder}
          />
        )}

      </main>

      {/* Cart Drawer pop open */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onStartCheckout={(zone, address) => {
          setCheckoutZone(zone);
          setCheckoutAddress(address);
          setIsCheckouting(true);
        }}
        activeAccount={activeAccount}
      />

      {/* Payment checkout modal popup */}
      {isCheckouting && checkoutZone && (
        <CheckoutModal
          totalAmount={totalBasketAmount + checkoutZone.price}
          deliveryZone={checkoutZone}
          deliveryAddress={checkoutAddress}
          cartItemsCount={totalBasketCount}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setIsCheckouting(false)}
          activeAccount={activeAccount}
        />
      )}

      {/* Focused garment detailed view popup */}
      {focusedProduct && (
        <ProductDetails
          product={focusedProduct}
          onClose={() => setFocusedProduct(null)}
          onAddToCart={handleAddToCart}
          onContactSeller={(prod) => setActiveChatProduct(prod)}
        />
      )}

      {/* Simulated Live Seller Messenger */}
      {activeChatProduct && (
        <SellerChatModal
          product={activeChatProduct}
          onClose={() => setActiveChatProduct(null)}
        />
      )}

      {/* Floating Customer Service Pill for desktop */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center justify-center animate-bounce">
        <button
          id="btn-floating-support"
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-vibrant-orange to-vibrant-amber text-neutral-900 font-extrabold text-xs px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#FED7AA]"
        >
          <Headphones className="h-4 w-4 text-stone-900 animate-pulse" />
          <span>Assistance 0556470423</span>
          <span className="w-2 h-2 rounded-full bg-[#059669] inline-block animate-ping"></span>
        </button>
      </div>

      {/* Persistent Bottom Tab Navigation Bar for Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-neutral-150 dark:border-neutral-850 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto px-2 py-2 flex items-center justify-around font-sans">
          
          <button
            id="mobile-nav-buy"
            onClick={() => setCurrentTab('buy')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'buy' || currentTab === 'cover'
                ? 'text-vibrant-emerald font-bold'
                : 'text-neutral-550 dark:text-neutral-400 hover:text-vibrant-emerald'
            }`}
          >
            <Search className="h-5 w-5 shrink-0" />
            <span className="text-[9.5px]">Catalogue</span>
          </button>

          <button
            id="mobile-nav-sell"
            onClick={() => setCurrentTab('sell')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'sell'
                ? 'text-vibrant-emerald font-bold'
                : 'text-neutral-550 dark:text-neutral-400 hover:text-vibrant-emerald'
            }`}
          >
            <Tag className="h-5 w-5 shrink-0 text-vibrant-orange" />
            <span className="text-[9.5px]">Vendre</span>
          </button>

          <button
            id="mobile-nav-cart"
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-neutral-550 dark:text-neutral-400 hover:text-vibrant-emerald relative cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5 shrink-0 text-vibrant-emerald" />
            {totalBasketCount > 0 && (
              <span className="absolute top-0.5 right-1.5 bg-vibrant-orange text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {totalBasketCount}
              </span>
            )}
            <span className="text-[9.5px]">Panier</span>
          </button>

          <button
            id="mobile-nav-support"
            onClick={() => setShowSupportModal(true)}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-vibrant-orange hover:text-[#EA580C] cursor-pointer"
          >
            <Phone className="h-5 w-5 shrink-0 animate-pulse text-amber-500" />
            <span className="text-[9.5px] font-bold">Assistance</span>
          </button>

          <button
            id="mobile-nav-account"
            onClick={() => {
              if (activeAccount && activeAccount.role === 'admin') {
                setCurrentTab('admin');
              } else {
                setCurrentTab('register');
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'register' || currentTab === 'admin'
                ? 'text-vibrant-emerald font-bold'
                : 'text-neutral-550 dark:text-neutral-400 hover:text-vibrant-emerald'
            }`}
          >
            {activeAccount && activeAccount.role === 'admin' ? (
              <ShieldCheck className="h-5 w-5 shrink-0 text-rose-500 animate-pulse" />
            ) : (
              <User className="h-5 w-5 shrink-0" />
            )}
            <span className="text-[9.5px] font-bold">
              {activeAccount && activeAccount.role === 'admin' ? 'Admin' : 'Mon Compte'}
            </span>
          </button>

        </div>
      </div>

      {/* Interactive Mobile Support dialog */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-150 dark:border-neutral-800 overflow-hidden animate-slide-up">
            
            {/* Header Dialog */}
            <div className="bg-gradient-to-r from-vibrant-emerald to-[#059669] p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Service Client Officiel</h3>
                  <p className="text-[10px] text-emerald-100 font-medium">Boutique Ivoire Vintage Abidjan</p>
                </div>
              </div>
              <button
                id="btn-close-support-modal"
                onClick={() => setShowSupportModal(false)}
                className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white cursor-pointer transition-all"
              >
                close
              </button>
            </div>

            {/* Assistance Content Info */}
            <div className="p-6 space-y-6">
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">CONTACT DIRECT RAPIDE</span>
                <p className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-vibrant-orange animate-bounce" />
                  <span>05 56 47 04 23</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Notre équipe est disponible 7j/7 de 8h à 21h par appel direct ou par message WhatsApp pour valider vos commandes ou répondre à vos questions.
                </p>
              </div>

              {/* Action grid layout */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  id="modal-btn-support-call"
                  href="tel:0556470423"
                  className="flex items-center justify-center gap-2 bg-gradient-to-tr from-vibrant-orange to-amber-500 text-stone-900 font-black text-xs py-3 px-4 rounded-2xl shadow-md cursor-pointer hover:scale-[1.01] transition-transform text-center"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>Lancer l'Appel</span>
                </a>
                
                <a
                  id="modal-btn-support-whatsapp"
                  href="https://wa.me/2250556470423?text=Bonjour%20Service%20Client%20Ivoire%20Vintage,%20je%20souhaite%20des%20informations%20sur%20les%20vêtements..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-md cursor-pointer hover:scale-[1.01] transition-transform text-center"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span>Discussion WhatsApp</span>
                </a>
              </div>

              {/* Mini FAQs */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-bold text-neutral-405 tracking-wider block">QUESTIONS FRÉQUENTES (FAQ)</span>
                
                <div className="space-y-2 text-[11px] font-sans">
                  <div className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <p className="font-extrabold text-neutral-850 dark:text-neutral-150">❓ Puis-je essayer les vêtements avant de payer ?</p>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Oui ! Lors de la livraison par notre coursier à Abidjan, vous pouvez déballer et essayer les habits avant de valider votre paiement Wave/Espèces.</p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <p className="font-extrabold text-neutral-850 dark:text-neutral-150">❓ Quels sont les frais de livraison ?</p>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Les frais varient entre 1,000 FCFA et 2,500 FCFA selon votre commune à Abidjan, ou via colis fiable vers l'Intérieur de la Côte d'Ivoire.</p>
                  </div>
                </div>
              </div>

              {/* Close safety button */}
              <button
                id="btn-close-modal-support"
                onClick={() => setShowSupportModal(false)}
                className="w-full bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 dark:hover:bg-neutral-750 text-white py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Retourner à la boutique
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Footer layout */}
      <footer className="bg-neutral-900 py-12 pb-24 md:pb-12 mt-auto text-xs text-neutral-400 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Quick info highlight for customer service 0556470423 */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-vibrant-orange font-bold uppercase tracking-widest text-[9.5px] block">Service Client Privé & Commandes</span>
              <p className="text-neutral-150 font-extrabold text-base mt-0.5">Assistance par Téléphone ou WhatsApp : <a href="tel:0556470423" className="text-vibrant-orange hover:underline">05 56 47 04 23</a></p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Besoin d'un renseignement sur un article ou d'un suivi de colis ? Notre ligne directe reste à votre écoute.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href="tel:0556470423" className="bg-vibrant-emerald hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-colors">
                Appeler
              </a>
              <a href="https://wa.me/2250556470423" target="_blank" rel="noopener noreferrer" className="bg-neutral-800 hover:bg-neutral-700 text-vibrant-orange text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-700 transition">
                Discussion WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div className="text-center md:text-left space-y-1">
              <p className="text-white font-extrabold text-sm tracking-wide uppercase">FRIPERIE IVOIRIENNE CHIC</p>
              <p className="text-[10px] text-neutral-500">Plateforme collaborative de vêtements de seconde main de qualité en Côte d'Ivoire.</p>
            </div>
            <div className="flex gap-4 text-[11px] font-semibold text-neutral-400 font-display">
              <button onClick={() => { setCurrentTab('buy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-vibrant-emerald cursor-pointer">Chiner</button>
              <button onClick={() => { setCurrentTab('sell'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-vibrant-emerald cursor-pointer">Vider mon Dressing</button>
              <button onClick={() => { setCurrentTab('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-vibrant-emerald cursor-pointer">Suivi colis</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-[10px] text-neutral-500">
            <p>© 2026 Friperie Ivoirienne. Abidjan, Côte d'Ivoire. Tous droits réservés.</p>
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
              <span>Intégré :</span>
              <span className="bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded font-bold">Wave</span>
              <span className="bg-orange-950 text-orange-400 px-1.5 py-0.5 rounded font-bold">Orange</span>
              <span className="bg-[#047857]/20 text-[#34D399] px-1.5 py-0.5 rounded font-bold border border-[#047857]/35">MTN</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
