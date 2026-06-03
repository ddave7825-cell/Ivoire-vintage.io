import React from 'react';
import { Order } from '../types';
import { MapPin, Phone, CheckCircle2, Clock, Truck, ShieldCheck, MessageSquare, ShoppingBag } from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  onCompleteDelivery: (orderId: string) => void;
}

export default function OrderHistory({ orders, onCompleteDelivery }: OrderHistoryProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const getStatusBadge = (status: Order['status'], paymentMethod: Order['paymentMethod']) => {
    switch (status) {
      case 'pending':
        if (paymentMethod === 'cod') {
          return (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-850 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-300">
              <Clock className="h-3 w-3 shrink-0 animate-pulse text-amber-600" />
              <span>Attente de Livraison & Paiement</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-vibrant-orange text-[10px] font-bold px-2 py-1 rounded-md border border-vibrant-border">
            <Clock className="h-3 w-3 shrink-0 animate-pulse" />
            <span>En attente de traitement</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-1 rounded-md border border-sky-200">
            <Truck className="h-3 w-3 shrink-0 animate-bounce" />
            <span>Livreur en route ({Math.random() > 0.5 ? 'Yako Moto' : 'Flash Cargo'})</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>Livré ☑ (Colis Reçu)</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getWhatsAppSupportLink = (orderId: string) => {
    const text = `Bonjour Support Friperie Ivoirienne, je souhaite des nouvelles de ma commande de seconde main réf: ${orderId}`;
    return `https://wa.me/2250700000000?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="order-history-portal" className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6 font-sans">
      <div className="border-b border-vibrant-border/50 pb-3 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-black text-neutral-900 uppercase font-display">Suivi de mes Commandes</h3>
          <p className="text-xs text-neutral-500">
            Consultez en direct le statut de vos expéditions de friperie à Abidjan et à l'intérieur.
          </p>
        </div>
        <div className="bg-orange-50 text-neutral-850 text-xs px-3 py-1.5 rounded-xl font-bold border border-vibrant-border">
          Commandes passées : <span className="font-bold text-vibrant-orange">{orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl p-8 border border-neutral-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 border border-vibrant-border/40 flex items-center justify-center text-vibrant-emerald mx-auto">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-neutral-950 text-base font-display">Aucune commande enregistrée</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Sachez que les commandes passées s'afficheront ici en temps réel pour vous permettre de simuler l'attribution du livreur à moto et de confirmer la réception de main à main.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#FFF7ED]/30 rounded-3xl border border-vibrant-border/50 p-5 shadow-sm space-y-4 animate-fade-in"
            >
              {/* Top row */}
              <div className="flex justify-between items-start flex-wrap gap-3 pb-3 border-b border-vibrant-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-neutral-900 uppercase">Réf : {order.id}</span>
                    {getStatusBadge(order.status, order.paymentMethod)}
                  </div>
                  <p className="text-[10px] text-neutral-400">Date de commande : {new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-neutral-450 text-[10px] font-bold uppercase">
                    {order.paymentMethod === 'cod' ? 'À Régler à la Livraison' : `Total Payé (${order.paymentMethod.toUpperCase()})`}
                  </p>
                  <p className="text-base font-black text-[#059669] font-display">{formatPrice(order.totalPrice)}</p>
                </div>
              </div>

              {/* Items grid info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Visual grid list of bought products */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-neutral-450">Articles achetés :</p>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-white p-2 rounded-xl border border-vibrant-border/30">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-12 rounded-lg object-cover bg-white border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-grow">
                          <p className="text-xs font-bold text-neutral-900 truncate font-display">{item.title}</p>
                          <p className="text-[10px] text-[#059669]/90 font-black mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details */}
                <div className="bg-white p-3.5 rounded-2xl border border-vibrant-border/50 space-y-2 text-xs">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Détails de Livraison & Dispatch</p>
                  <div className="space-y-1.5">
                    <p className="text-neutral-800 font-bold gap-1 flex items-center">
                      <span className="text-neutral-400 font-normal">Destinataire :</span> {order.customerName}
                    </p>
                    <p className="text-neutral-800 font-bold gap-1 flex items-center">
                      <span className="text-neutral-400 font-normal">Contact :</span> +225 {order.customerPhone}
                    </p>
                    <p className="text-neutral-800 font-bold gap-1 flex items-start">
                      <span className="text-neutral-400 font-normal shrink-0">Adresse :</span> 
                      <span className="truncate max-w-[200px]" title={order.deliveryAddress}>{order.deliveryAddress}</span>
                    </p>
                    <p className="text-neutral-800 font-bold gap-1 flex items-center">
                      <span className="text-neutral-400 font-normal">Secteur :</span> {order.deliveryZone}
                    </p>
                    {order.deliveryInstruction && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-neutral-200">
                        <span className="text-[10px] text-orange-600 font-black block uppercase tracking-wider">Instruction Livreur :</span>
                        <p className="text-stone-750 italic font-bold leading-relaxed mt-0.5">"{order.deliveryInstruction}"</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Delivery actions simulated tool flow */}
              <div className="pt-3 border-t border-vibrant-border/40 flex flex-wrap justify-between items-center gap-3">
                <div className="text-[10px] text-neutral-450 flex items-center gap-1 font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0" />
                  <span>Livraison sécurisée avec signature</span>
                </div>

                <div className="flex gap-2">
                  <a
                    id={`btn-order-support-${order.id}`}
                    href={getWhatsAppSupportLink(order.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 border border-vibrant-border/60 hover:bg-orange-50/50 text-neutral-700 text-xs font-bold rounded-xl transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Réclamation</span>
                  </a>

                  {order.status !== 'delivered' && (
                    <button
                      id={`btn-order-complete-${order.id}`}
                      onClick={() => onCompleteDelivery(order.id)}
                      className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Confirmer la réception du colis ☑</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
