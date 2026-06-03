import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { X, Send, CheckCheck, Smile, HelpCircle, Sparkles, MessageSquare, User } from 'lucide-react';

interface SellerChatModalProps {
  product: Product;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}

export default function SellerChatModal({ product, onClose }: SellerChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message from the seller when chat opens
  useEffect(() => {
    setMessages([
      {
        id: 'initial',
        sender: 'seller',
        text: `Salutations ! 😊 Je suis ${product.sellerName}, le vendeur de l'article "${product.title}". Merci de l'intérêt porté à ma fiche ! Comment puis-je vous aider ?`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [product]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'buyer',
      text: textToSend,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Trigger simulated seller reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyText = generateSellerReply(textToSend);
      const replyTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [
        ...prev,
        {
          id: `seller-${Date.now()}`,
          sender: 'seller',
          text: replyText,
          timestamp: replyTime,
        },
      ]);
    }, 1200 + Math.random() * 800); // Realistic reading & typing delay
  };

  const generateSellerReply = (query: string): string => {
    const q = query.toLowerCase();

    // Availability queries
    if (q.includes('dispo') || q.includes('disponible') || q.includes('prend') || q.includes('acheter')) {
      return `Oui, l'article est tout à fait disponible ! Je l'ai mis de côté pour l'instant. Vous pouvez l'ajouter à votre panier et passer commande sur le site, notre coursier vous livrera très rapidement. 📦✨`;
    }

    // Price / negotiation queries
    if (q.includes('négocier') || q.includes('laisser') || q.includes('prix') || q.includes('reduction') || q.includes('rabais') || q.includes('dernier prix')) {
      return `Le prix de ${product.price.toLocaleString('fr-FR')} FCFA est déjà super promotionnel et ultra attractif par rapport au prix d'origine (${product.originalPrice ? product.originalPrice.toLocaleString('fr-FR') + ' FCFA' : 'neuf'}). Vu la qualité "${product.state}", c'est une excellente affaire ! Mais si vous prenez un de mes autres habits, on pourra faire un geste chic ! 😉`;
    }

    // Condition / Quality queries
    if (q.includes('etat') || q.includes('état') || q.includes('neuf') || q.includes('tache') || q.includes('usé') || q.includes('sale') || q.includes('abim')) {
      return `L'état de l'habit est '${product.state}'. J'en prends extrêmement soin (lavé, repassé, stocké sous housse). Il n'a aucun défaut caché ! Vous pourrez bien sûr le déplier et l'inspecter avec le livreur pour vous en assurer avant de payer. 👍`;
    }

    // Sizing/Fitting queries
    if (q.includes('taille') || q.includes('grand') || q.includes('petit') || q.includes('mesure') || q.includes('essayer') || q.includes('coupe') || q.includes('serré')) {
      return `C'est une taille ${product.size}. La coupe est standard et s'ajuste parfaitement. Notez qu'avec le mode "Paiement à la livraison", vous pourrez essayer d'abord sans stress sur place et le rendre au coursier si jamais ça ne vous convient pas. C'est garanti 100% serein ! 👗🕺`;
    }

    // Delivery queries
    if (q.includes('livraison') || q.includes('livrer') || q.includes('coursier') || q.includes('frais') || q.includes('reçois') || q.includes('zone')) {
      return `La livraison s'opère par notre service de coursiers Friperie Chic. Nous livrons dans toutes les communes d'Abidjan (Cocody, Marcory, Yopougon, Riviera, etc.) et également à l'intérieur ! Vous payez à la réception en espèces ou par Wave Direct.`;
    }

    // Default polite answers
    const defaultReplies = [
      `C'est bien noté ! Je fais attention aux moindres détails. Ma friperie est lavée avec soin avant envoi. Souhaitez-vous que je valide la réservation pour cet article en attendant son achat ?`,
      `Merci pour ces précisions ! L'article est soigneusement plié et prêt à être remis au livreur de la plateforme. N'hésitez pas si vous avez une autre question pratique.`,
      `Excellente question ! C'est un de mes habits préférés, très élégant et confortable. C'est pourquoi je le revends sur Friperie Ivoirienne Chic. Vous allez l'adorer ! 😊`,
    ];

    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  };

  const quickQuestions = [
    { text: "Est-il toujours disponible ? 🏷️", query: "Est-il disponible ou déjà réservé ?" },
    { text: "Peut-on négocier le prix ? 💸", query: "Le prix de l'article est-il négociable ?" },
    { text: "Détails sur l'état exact ? ✨", query: "Pouvez-vous m'en dire plus sur son état ?" },
    { text: "S'allie-t-il bien à la taille ? 📏", query: "La taille est-elle ajustée ou ample ?" },
  ];

  return (
    <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[90vh] animate-scale-in">
        
        {/* Header section with Seller Info */}
        <div className="p-4 bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-vibrant-orange flex items-center justify-center text-xs font-black shadow-inner border border-white/20 uppercase shrink-0">
              {product.sellerName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">{product.sellerName}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-neutral-300 font-mono flex items-center gap-1">
                <span>Vendeur de {product.sellerCity}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">En Ligne</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product mini banner for context */}
        <div className="px-4 py-2.5 bg-orange-50 border-b border-vibrant-border/40 flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-vibrant-border"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-neutral-900 truncate leading-tight">{product.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-vibrant-emerald font-mono">{product.price.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded border">Taille {product.size}</span>
            </div>
          </div>
          <div className="text-[10px] text-vibrant-orange bg-amber-100/60 font-semibold px-2 py-0.5 rounded border border-vibrant-border/30">
            {product.state}
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-neutral-50/50 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className="max-w-[85%] flex flex-col">
                <div
                  className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'buyer'
                      ? 'bg-vibrant-emerald text-white rounded-br-none shadow-sm'
                      : 'bg-white text-neutral-850 border border-neutral-200/80 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span
                  className={`text-[9px] text-neutral-400 mt-1 font-mono flex items-center gap-1 ${
                    msg.sender === 'buyer' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.timestamp}
                  {msg.sender === 'buyer' && <CheckCheck className="h-3 w-3 text-emerald-500 shrink-0" />}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[85%] flex flex-col">
                <div className="p-3 bg-white text-neutral-500 border border-neutral-200/50 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400 italic">{product.sellerName} écrit</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions buttons row */}
        {messages.length === 1 && !isTyping && (
          <div className="px-4 py-2 bg-white border-t border-neutral-100">
            <p className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5 flex items-center gap-0.5">
              <HelpCircle className="h-3 w-3 text-vibrant-orange" /> Suggestions de questions rapides :
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.query)}
                  className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-[10.5px] font-bold px-3 py-1.5 rounded-xl border border-neutral-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <div className="p-3 bg-white border-t border-neutral-150 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Écrivez votre message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputText);
                }
              }}
              className="w-full pl-3 pr-10 py-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-vibrant-emerald focus:bg-white transition-all text-neutral-900"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              title="Ajouter un emoji"
              onClick={() => setInputText((prev) => prev + ' 😊')}
            >
              <Smile className="h-4.5 w-4.5" />
            </button>
          </div>

          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              inputText.trim()
                ? 'bg-vibrant-emerald hover:bg-[#059669] text-white shrink-0 hover:scale-105'
                : 'bg-neutral-100 text-neutral-400 shrink-0 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
