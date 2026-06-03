import React, { useState, useEffect } from 'react';
import { CartItem, DeliveryZone, UserAccount } from '../types';
import { DELIVERY_ZONES } from '../data';
import { X, Trash2, ChevronRight, ShoppingCart, MapPin, Milestone, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onStartCheckout: (deliveryZone: DeliveryZone, deliveryAddress: string) => void;
  activeAccount: UserAccount | null;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onStartCheckout,
  activeAccount,
}: CartDrawerProps) {
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [addressDetail, setAddressDetail] = useState('');
  const [addressError, setAddressError] = useState('');

  // Auto-fill delivery configurations if registered VIP Client is online
  useEffect(() => {
    if (isOpen && activeAccount && activeAccount.role === 'client') {
      const idx = DELIVERY_ZONES.findIndex((z) => z.name === activeAccount.commune);
      if (idx !== -1) {
        setSelectedZoneIdx(idx);
      }
      if (activeAccount.address) {
        setAddressDetail(activeAccount.address);
      }
    }
  }, [isOpen, activeAccount]);

  if (!isOpen) return null;

  const currentZone = DELIVERY_ZONES[selectedZoneIdx];

  // Calculations
  const subTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? currentZone.price : 0;
  const totalPrice = subTotal + deliveryFee;

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const handleCheckoutClick = () => {
    if (!addressDetail.trim() || addressDetail.length < 5) {
      setAddressError('Veuillez préciser votre adresse de livraison exacte (ex: Cocody Angré carrefour oscar, immeuble bleu)');
      return;
    }
    setAddressError('');
    onStartCheckout(currentZone, addressDetail);
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      {/* Background closer */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Drawer Container */}
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        
        {/* Header */}
        <div className="p-4 border-b border-vibrant-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-vibrant-emerald" />
            <h2 className="text-base font-black text-neutral-900 uppercase font-display">Mon Panier Chic</h2>
            <span className="bg-vibrant-amber text-neutral-950 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {cartItems.length} {cartItems.length > 1 ? 'habits' : 'habit'}
            </span>
          </div>
          <button
            id="btn-close-cart-drawer"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-vibrant-emerald rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-vibrant-border/50 flex items-center justify-center text-vibrant-emerald">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base font-display">Votre panier est encore vide</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Découvrez des pièces uniques de seconde main et ajoutez-les dans votre panier pour les sécuriser !
                </p>
              </div>
              <button
                id="btn-empty-cart-back"
                onClick={onClose}
                className="bg-vibrant-emerald hover:bg-[#059669] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Continuer les achats
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Listing */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 bg-[#FFF7ED]/40 p-3 rounded-2xl border border-vibrant-border/30 relative group"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Meta */}
                    <div className="flex-grow min-w-0 pr-6">
                      <h4 className="text-sm font-bold text-neutral-950 truncate font-display">{item.product.title}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Taille: {item.product.size} • État: {item.product.state}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-extrabold text-[#059669] font-display">
                          {formatPrice(item.product.price)}
                        </span>

                        {/* Quantity Multiplier controls */}
                        <div className="flex items-center border border-vibrant-border/50 rounded-lg bg-white overflow-hidden">
                          <button
                            id={`btn-cart-minus-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-orange-50 text-neutral-500 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            id={`btn-cart-plus-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-orange-50 text-neutral-500 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trash Absolute button */}
                    <button
                      id={`btn-cart-trash-${item.product.id}`}
                      onClick={() => onRemoveItem(item.product.id)}
                      className="absolute top-3 right-3 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Enlever du panier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Shipping settings section */}
              <div className="bg-orange-50 p-4 rounded-2xl border border-vibrant-border space-y-3">
                <div className="flex items-center justify-between gap-2 text-neutral-850 text-sm font-bold flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-vibrant-emerald" />
                    <span className="font-display">Options de livraison (Côte d'Ivoire)</span>
                  </div>
                  {activeAccount && activeAccount.role === 'client' && (
                    <span className="bg-vibrant-emerald/10 text-[#047857] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-vibrant-emerald/20 flex items-center gap-1.5 shrink-0">
                      <Sparkles className="h-3 w-3 text-vibrant-emerald" />
                      Client VIP
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block">Commune / Ville d'Abidjan</label>
                  <select
                    id="select-delivery-commune"
                    value={selectedZoneIdx}
                    onChange={(e) => setSelectedZoneIdx(Number(e.target.value))}
                    className="w-full bg-white border border-vibrant-border rounded-xl px-3 py-2.5 text-xs text-neutral-850 focus:outline-none focus:border-vibrant-emerald cursor-pointer font-bold"
                  >
                    {DELIVERY_ZONES.map((zone, idx) => (
                      <option key={idx} value={idx}>
                        {zone.name} ({formatPrice(zone.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block">Adresse de livraison précise</label>
                  <textarea
                    id="textarea-delivery-address"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="Ex: Cocody Angré 22e Arrondissement, à côté de la pharmacie, Immeuble Grace escalier B, 3ème étage"
                    className="w-full bg-white border border-vibrant-border rounded-xl px-3 py-2 text-xs text-neutral-850 focus:outline-none focus:border-vibrant-emerald min-h-[60px]"
                  ></textarea>
                  {addressError && (
                    <p className="text-[10px] font-semibold text-rose-600 mt-1">{addressError}</p>
                  )}
                  <div className="text-[10px] text-neutral-500 font-bold">
                    Délai estimé : <span className="text-vibrant-orange">{currentZone.time}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-vibrant-border/50 space-y-4 bg-orange-50/20">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 font-bold">
                <span>Nombre d'articles:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-bold">
                <span>Sous-total:</span>
                <span className="font-semibold text-neutral-800">{formatPrice(subTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-bold">
                <span>Livraison ({currentZone.name.split(' ')[0]}):</span>
                <span className="font-semibold text-neutral-800">{formatPrice(deliveryFee)}</span>
              </div>
              <hr className="border-vibrant-border/30" />
              <div className="flex justify-between text-base font-black text-neutral-900">
                <span>Total à payer:</span>
                <span className="text-[#059669] font-black font-display">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Launch Payment CTA */}
            <button
              id="btn-trigger-checkout"
              onClick={handleCheckoutClick}
              className="w-full bg-vibrant-emerald hover:bg-[#059669] text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none uppercase tracking-wide cursor-pointer"
            >
              <span>Passer au paiement mobile</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
