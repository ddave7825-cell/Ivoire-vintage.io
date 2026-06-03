import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Eye, Tag, MapPin, MessageSquare } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onContactSeller?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onContactSeller,
}: ProductCardProps) {
  // Format price helper
  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  // State badge styling
  const getStateBadgeColor = (state: Product['state']) => {
    switch (state) {
      case 'Comme neuf':
        return 'bg-[#D1FAE5] text-vibrant-emerald border-vibrant-emerald/30';
      case 'Très bon état':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Bon état':
        return 'bg-[#FEF3C7] text-vibrant-orange border-vibrant-border/60';
      case 'Satisfaisant':
        return 'bg-neutral-50 text-neutral-600 border-neutral-200/60';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200/60';
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-3xl overflow-hidden border border-vibrant-border/40 hover:border-vibrant-border hover:shadow-xl hover:shadow-vibrant-orange/5 transition-all duration-300 flex flex-col"
    >
      {/* Product Image and Hover actions */}
      <div className="relative aspect-4/3 sm:aspect-3/4 overflow-hidden bg-neutral-50 group">
        <img
          src={product.images[0] || 'https://picsum.photos/seed/clothing/400/500'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* State Badge */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-xs ${getStateBadgeColor(
            product.state
          )}`}
        >
          {product.state}
        </span>

        {/* Size Badge */}
        <span className="absolute bottom-3 right-3 bg-neutral-900/85 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          Taille : {product.size}
        </span>

        {/* Hot Actions on hover desktop overlay */}
        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            id={`btn-card-view-${product.id}`}
            onClick={() => onViewDetails(product)}
            className="p-3 bg-white hover:bg-neutral-100 text-neutral-900 rounded-full transition-transform hover:scale-110 shadow-md cursor-pointer"
            title="Savoir plus"
          >
            <Eye className="h-5 w-5" />
          </button>
          {onContactSeller && (
            <button
              id={`btn-card-chat-${product.id}`}
              onClick={() => onContactSeller(product)}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-transform hover:scale-110 shadow-md cursor-pointer border border-slate-700"
              title="Discuter avec le vendeur"
            >
              <MessageSquare className="h-5 w-5 text-vibrant-orange animate-pulse" />
            </button>
          )}
          <button
            id={`btn-card-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            className="p-3 bg-vibrant-emerald hover:bg-[#059669] text-white rounded-full transition-transform hover:scale-110 shadow-md cursor-pointer"
            title="Ajouter au Panier"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand & Origin */}
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            <span className="truncate max-w-[120px] text-vibrant-orange font-bold">{product.brand || 'Sans Marque'}</span>
            <div className="flex items-center gap-0.5 text-neutral-500 font-medium">
              <MapPin className="h-3 w-3 shrink-0 text-vibrant-emerald" />
              <span className="truncate max-w-[80px]">{product.sellerCity.split(',')[0]}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            id={`title-card-${product.id}`}
            onClick={() => onViewDetails(product)}
            className="text-sm font-bold text-neutral-900 hover:text-vibrant-emerald cursor-pointer line-clamp-1 mb-2 transition-colors font-display"
          >
            {product.title}
          </h3>
        </div>

        {/* Price Tag Details */}
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-[#059669] font-display">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Quick Buy Button for Touch Viewports */}
          <button
            id={`btn-card-quick-buy-${product.id}`}
            onClick={() => onAddToCart(product)}
            className="md:hidden flex items-center justify-center p-2.5 bg-orange-50 hover:bg-orange-100 text-vibrant-emerald rounded-xl transition-colors border border-vibrant-border/80"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
