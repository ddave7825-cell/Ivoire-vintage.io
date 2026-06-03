import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, X, Check, ArrowRight, Phone, MessageSquare, ShieldAlert, Share2 } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onContactSeller: (product: Product) => void;
}

export default function ProductDetails({
  product,
  onClose,
  onAddToCart,
  onContactSeller,
}: ProductDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  // WhatsApp helper
  const getWhatsAppLink = () => {
    const text = `Bonjour! Je suis intéressé(e) par l'article "${product.title}" (${formatPrice(product.price)}) vu sur Friperie Ivoirienne Chic. Est-il toujours disponible?`;
    return `https://wa.me/225${product.sellerPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const shareData = {
      title: product.title,
      text: `Découvre cet article "${product.title}" (${formatPrice(product.price)}) sur Ivoire Vintage !`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Web Share canceled or failed, falling back to copy', err);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Could not copy product link', err);
      });
  };

  return (
    <div id="product-detail-modal" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-8 animate-scale-in">
        
        {/* Close Button */}
        <button
          id="btn-close-details"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md border border-neutral-100 transition-transform hover:scale-105"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Images Presentation */}
          <div className="bg-neutral-50 p-6 flex flex-col justify-center gap-4 border-r border-neutral-100">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-white shadow-inner">
              <img
                src={product.images[activeImageIdx] || 'https://picsum.photos/seed/clothing/600/600'}
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${
                      idx === activeImageIdx ? 'border-vibrant-emerald' : 'border-transparent bg-white'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Meta */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Category, Brand, State metadata row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-vibrant-emerald text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {product.category}
                </span>
                <span className="bg-normal-50 text-neutral-750 text-xs font-bold px-2.5 py-1 rounded-full border border-vibrant-border bg-white">
                  État: {product.state}
                </span>
                {product.brand && (
                  <span className="bg-[#FEF3C7] text-vibrant-orange text-xs font-bold px-2.5 py-1 rounded-full border border-vibrant-border">
                    Marque: {product.brand}
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 id="details-product-title" className="text-xl md:text-2xl font-black text-neutral-900 leading-tight font-display">
                  {product.title}
                </h1>
                
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-extrabold text-[#059669] font-display">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-neutral-400 line-through">
                      uf. {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-xs text-vibrant-orange font-bold bg-orange-50 px-2 py-0.5 rounded border border-vibrant-border/50">
                      Économisez {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-vibrant-border/30" />

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Description</h3>
                <p id="details-product-desc" className="text-sm text-neutral-700 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Sizing Information */}
              <div className="bg-orange-50 p-3 rounded-2xl border border-vibrant-border flex justify-between items-center text-sm">
                <span className="font-bold text-neutral-800">Taille de l'habit :</span>
                <span className="font-extrabold text-base bg-vibrant-emerald text-white px-3 py-1 rounded-xl shadow-xs">
                  {product.size}
                </span>
              </div>

              <hr className="border-vibrant-border/30" />

              {/* Seller Information & WhatsApp Direct */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="text-neutral-400 font-medium">Vendeur vérifié</p>
                    <p className="font-bold text-neutral-950">{product.sellerName}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-neutral-400 font-medium">Lieu</p>
                    <p className="font-bold text-[#059669] text-[11px] font-display">{product.sellerCity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    id="btn-seller-whatsapp"
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    id="btn-seller-call"
                    href={`tel:+225${product.sellerPhone}`}
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-neutral-300 transition-all shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Appeler</span>
                  </a>
                </div>

                <button
                  id="btn-seller-in-app-chat"
                  onClick={() => onContactSeller(product)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer border border-slate-700 hover:scale-[1.01]"
                >
                  <MessageSquare className="h-4 w-4 text-vibrant-orange animate-pulse" />
                  <span>Contacter le vendeur (Messagerie Privée)</span>
                </button>
              </div>

            </div>

            {/* Direct Add to Cart Action */}
            <div className="mt-6 pt-4 border-t border-neutral-150 flex gap-3">
              <button
                id="btn-share-product"
                onClick={handleShare}
                className={`px-4.5 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#059669] text-white border-[#047857]'
                    : 'bg-orange-50 hover:bg-[#FED7AA]/35 text-vibrant-orange hover:text-[#EA580C] border-vibrant-border/60'
                }`}
                title="Partager l'article"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 animate-scale-in" />
                    <span>Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>Partager</span>
                  </>
                )}
              </button>

              <button
                id="btn-add-to-cart-focused"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-grow bg-vibrant-emerald hover:bg-[#059669] border border-vibrant-emerald text-white py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ajouter l'habit au panier</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
