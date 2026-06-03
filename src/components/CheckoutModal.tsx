import React, { useState } from 'react';
import { PaymentMethod, DeliveryZone, Order, UserAccount } from '../types';
import { Check, CreditCard, ShieldCheck, AlertCircle, RefreshCw, Loader2, ArrowRight, Banknote, Truck, WifiOff } from 'lucide-react';

interface CheckoutModalProps {
  totalAmount: number; // product sum + shipping in FCFA
  deliveryZone: DeliveryZone;
  deliveryAddress: string;
  cartItemsCount: number;
  onPaymentSuccess: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  onClose: () => void;
  activeAccount: UserAccount | null;
}

export default function CheckoutModal({
  totalAmount,
  deliveryZone,
  deliveryAddress,
  cartItemsCount,
  onPaymentSuccess,
  onClose,
  activeAccount,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [phoneNumber, setPhoneNumber] = useState(
    activeAccount && activeAccount.role === 'client' ? activeAccount.phone : ''
  );
  const [ownerName, setOwnerName] = useState(
    activeAccount && activeAccount.role === 'client' ? activeAccount.fullName : ''
  );
  const [deliveryInstruction, setDeliveryInstruction] = useState('');
  const [otpToken, setOtpToken] = useState(''); // Orange Money OTP or similar
  const [phoneError, setPhoneError] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Payment progress controller
  const [paymentState, setPaymentState] = useState<'idle' | 'push_sent' | 'processing' | 'completed' | 'failed'>('idle');
  const [simulatedProgress, setSimulatedProgress] = useState('');

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const validateInputs = () => {
    let isValid = true;

    // Check Phone: Côte d'Ivoire numbers have 10 digits, usually starting with 01, 05, or 07
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone) {
      setPhoneError('Le numéro de téléphone est requis');
      isValid = false;
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      setPhoneError('Veuillez entrer un numéro ivoirien valide à 10 chiffres (ex: 0708091011)');
      isValid = false;
    } else if (!/^(01|05|07)/.test(cleanPhone)) {
      setPhoneError('Le numéro doit commencer par 01, 05 ou 07 en Côte d\'Ivoire');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // Check customer name
    if (!ownerName.trim()) {
      setOwnerError('Le nom du destinataire de la commande est requis');
      isValid = false;
    } else if (ownerName.trim().length < 3) {
      setOwnerError('Veuillez entrer votre nom complet pour la livraison');
      isValid = false;
    } else {
      setOwnerError('');
    }

    // If Orange Money, check for simulated OTP Code is requested
    if (paymentMethod === 'orange' && paymentState === 'push_sent' && !otpToken) {
      setOtpError('Le code de paiement généré par le *144*82# est requis');
      isValid = false;
    } else {
      setOtpError('');
    }

    return isValid;
  };

  const handleStartPayment = () => {
    if (!validateInputs()) return;

    if (paymentMethod === 'cod') {
      setPaymentState('processing');
      setSimulatedProgress("Enregistrement de votre commande en paiement à la livraison...");
      
      setTimeout(() => {
        setPaymentState('completed');
        setSimulatedProgress("Votre commande a bien été validée en option Paiement à la livraison !");
      }, 1500);
    } else if (paymentMethod === 'orange') {
      setPaymentState('push_sent');
      setSimulatedProgress("Veuillez composer le *144*82# sur votre téléphone pour générer le code d'autorisation Orange Money.");
    } else {
      setPaymentState('push_sent');
      const provider = paymentMethod.toUpperCase();
      setSimulatedProgress(`Une demande de paiement de ${formatPrice(totalAmount)} a été envoyée sur votre compte ${provider} (+225 ${phoneNumber}).`);
      
      // Auto progress mimicking real-world callback webhooks
      setTimeout(() => {
        setPaymentState('processing');
        setSimulatedProgress(`Notification de débit validée par l'opérateur ${provider}. Génération de la facture de friperie...`);
        
        setTimeout(() => {
          setPaymentState('completed');
          setSimulatedProgress("Paiement reçu avec succès !");
        }, 1800);
      }, 3000);
    }
  };

  const handleConfirmPaymentOTP = () => {
    if (paymentMethod === 'orange' && !otpToken) {
      setOtpError("Veuillez entrer le code d'autorisation");
      return;
    }
    setOtpError('');
    triggerVerification();
  };

  const triggerVerification = () => {
    setPaymentState('processing');
    setSimulatedProgress("Vérification de la transaction auprès de la passerelle de paiement...");

    // Simulate server side verification after 2 seconds
    setTimeout(() => {
      setPaymentState('completed');
      setSimulatedProgress("Paiement reçu avec succès !");
    }, 2500);
  };

  const handleFinalizeOrder = () => {
    // Collect order meta for success Callback
    onPaymentSuccess({
      customerName: ownerName,
      customerPhone: phoneNumber,
      deliveryZone: deliveryZone.name,
      deliveryAddress: deliveryAddress,
      items: [], // will be filled in the page state
      totalPrice: totalAmount,
      paymentMethod: paymentMethod,
      phoneNumberPayment: phoneNumber,
      deliveryInstruction: deliveryInstruction.trim() || undefined,
    });
  };

  const getMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case 'wave':
        return 'border-sky-300 bg-sky-50 text-sky-800';
      case 'orange':
        return 'border-orange-300 bg-orange-50 text-orange-800';
      case 'mtn':
        return 'border-amber-300 bg-amber-50 text-amber-900';
      case 'moov':
        return 'border-emerald-300 bg-emerald-50 text-emerald-800';
      case 'cod':
        return 'border-orange-300 bg-orange-50/70 text-orange-900';
    }
  };

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-100 my-8">
        {/* Header */}
        <div className="p-5 border-b border-vibrant-border flex items-center justify-between bg-orange-50/45">
          <div>
            <h3 className="font-extrabold text-neutral-900 text-sm uppercase tracking-wide font-display">Paiement de la Commande</h3>
            <p className="text-[10px] text-neutral-500 font-bold">Sélectionnez le mode de règlement de votre dressing</p>
          </div>
          {paymentState === 'idle' && (
            <button
              id="btn-close-checkout-modal"
              onClick={onClose}
              className="text-neutral-550 hover:text-vibrant-emerald text-xs font-bold p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-vibrant-border cursor-pointer transition-all"
            >
              Fermer
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          
          {/* STEP 1: SELECT AND CONFIGURE */}
          {paymentState === 'idle' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Order total preview */}
              <div className="bg-orange-50/35 p-4 rounded-2xl border border-vibrant-border flex justify-between items-center text-xs">
                <div>
                  <p className="text-neutral-555 font-bold">Montant total de votre commande :</p>
                  <p className="text-[10px] text-neutral-500 font-medium">{cartItemsCount} habits + Livraison {deliveryZone.name.split(' (')[0]}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#059669] block font-display">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Method choice */}
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-950 font-medium">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold uppercase text-[9.5px] text-amber-800 tracking-wider mb-0.5">Assistance Immédiate / Suivi Colis</p>
                    <p className="leading-tight">
                      Une question ? Notre service client est joignable 7j/7 au <a href="tel:0556470423" className="font-extrabold text-vibrant-orange hover:underline">05 56 47 04 23</a>. Veuillez sélectionner <b>Paiement à la livraison</b> ci-dessous pour valider votre commande en toute tranquillité.
                    </p>
                  </div>
                </div>

                <label className="text-[10px] uppercase font-black text-neutral-400 block tracking-wider">Modes de règlement en ligne (Actuellement indisponibles) :</label>
                <div className="grid grid-cols-2 gap-2 opacity-55">
                  
                  {/* WAVE - Disabled */}
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 text-left select-none cursor-not-allowed"
                    title="Paiement Wave en ligne indisponible"
                  >
                    <div className="relative w-6 h-6 rounded-lg bg-neutral-300 font-extrabold text-white text-[10px] flex items-center justify-center shrink-0">
                      W
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-500 block leading-none">Wave Money</span>
                      <span className="text-[9px] text-rose-600 font-extrabold block mt-0.5">Bientôt dispo 🔒</span>
                    </div>
                  </div>

                  {/* ORANGE - Disabled */}
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 text-left select-none cursor-not-allowed"
                    title="Paiement Orange Money en ligne indisponible"
                  >
                    <div className="w-6 h-6 rounded-lg bg-neutral-300 font-extrabold text-white text-[10px] flex items-center justify-center shrink-0">
                      O
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-500 block leading-none">Orange Money</span>
                      <span className="text-[9px] text-rose-600 font-extrabold block mt-0.5">Bientôt dispo 🔒</span>
                    </div>
                  </div>

                  {/* MTN - Disabled */}
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 text-left select-none cursor-not-allowed"
                  >
                    <div className="w-6 h-6 rounded-lg bg-neutral-300 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      M
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-500 block leading-none">MTN MoMo</span>
                      <span className="text-[9px] text-rose-600 font-extrabold block mt-0.5">Bientôt dispo 🔒</span>
                    </div>
                  </div>

                  {/* MOOV - Disabled */}
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 text-left select-none cursor-not-allowed"
                  >
                    <div className="w-6 h-6 rounded-lg bg-neutral-300 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      Moov
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-500 block leading-none">Moov Money</span>
                      <span className="text-[9px] text-rose-600 font-extrabold block mt-0.5">Bientôt dispo 🔒</span>
                    </div>
                  </div>

                </div>

                <label className="text-[10px] uppercase font-black text-slate-800 dark:text-neutral-300 block tracking-wider pt-2">Sélectionner l'unique mode de paiement actif :</label>
                <div className="grid grid-cols-1">
                  {/* CASH ON DELIVERY (COD) / PAIEMENT À LA LIVRAISON */}
                  <button
                    id="btn-method-cod"
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-vibrant-orange bg-orange-55/40 ring-1 ring-vibrant-orange'
                        : 'border-neutral-200 hover:bg-orange-50/15'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-vibrant-orange text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      <Banknote className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-black text-neutral-900 block leading-none font-display">Paiement à la livraison (En Espèces ou Wave au Coursier)</span>
                      <span className="text-[9.5px] text-[#C2410C] font-semibold block mt-1 tracking-tight">Réglez de main à main en espèces ou par transfert Wave direct au livreur chic</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone and full name fields */}
              <div className="space-y-3">
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block">Nom complet du destinataire</label>
                  <input
                    id="checkout-owner-name-input"
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Kouame Koffi David"
                    className="w-full bg-white border border-vibrant-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800"
                  />
                  {ownerError && <p className="text-[10px] font-bold text-rose-600">{ownerError}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block">Numéro de téléphone de livraison (10 chiffres)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-450 font-bold">+225</span>
                    <input
                      id="checkout-phone-input"
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="0708091011"
                      className="w-full bg-white border border-vibrant-border rounded-xl pl-12 pr-3 py-2.5 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800"
                    />
                  </div>
                  {phoneError && <p className="text-[10px] font-bold text-rose-600">{phoneError}</p>}
                  <p className="text-[10px] text-neutral-400 font-semibold">Le livreur vous appellera sur ce numéro à l'arrivée (commence par 01, 05 ou 07).</p>
                </div>

                {/* Specific instructions for the delivery person */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-50 block">Instructions pour le livreur (Indication d'accès)</label>
                  <textarea
                    id="checkout-delivery-instruction"
                    rows={2}
                    value={deliveryInstruction}
                    onChange={(e) => setDeliveryInstruction(e.target.value)}
                    placeholder="Ex: Maison à portail bleu, appeler 15 minutes avant le passage, laisser au poste de garde..."
                    className="w-full bg-white border border-vibrant-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-vibrant-emerald text-neutral-800 resize-none"
                  />
                  <p className="text-[9px] text-neutral-400">Ces précisions seront directement transmises au coursier pour faciliter la remise.</p>
                </div>

              </div>

              {/* Secure statement */}
              <div className="p-3 bg-white rounded-xl border border-vibrant-border flex items-start gap-2 text-[10px] text-neutral-500">
                {paymentMethod === 'cod' ? (
                  <Truck className="h-4 w-4 text-vibrant-orange shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                )}
                <span>
                  {paymentMethod === 'cod' 
                    ? "Engagement de commande : veuillez vous assurer de préparer la somme d'argent exacte ou d'avoir du réseau pour payer à l'arrivée."
                    : "Vos informations sont sécurisées. Le débit final de votre compte nécessite de valider la demande USSD avec votre code PIN secret."
                  }
                </span>
              </div>

              {/* Trigger payment action button */}
              <button
                id="btn-process-mobile-money"
                onClick={handleStartPayment}
                className="w-full bg-vibrant-emerald hover:bg-[#059669] text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-4 cursor-pointer"
              >
                <span>{paymentMethod === 'cod' ? 'Confirmer ma commande' : 'Lancer la transaction'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          )}

          {/* STEP 2: AUTORIZE POP-UP & OTP (Pushed notification) */}
          {paymentState === 'push_sent' && (
            <div className="space-y-4 text-center py-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-vibrant-orange flex items-center justify-center mx-auto animate-pulse">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-900 font-display">Demande envoyée !</h4>
                <p className="text-xs text-neutral-500 font-bold">Un signal a été envoyé au +225 {phoneNumber} via {paymentMethod.toUpperCase()}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-vibrant-border text-left space-y-2">
                <label className="text-[10px] uppercase font-bold text-vibrant-orange block font-display">Instructions de validation</label>
                <p className="text-xs text-neutral-850 font-bold leading-relaxed">
                  {simulatedProgress}
                </p>
              </div>

              {/* Orange Money Token prompt code */}
              {paymentMethod === 'orange' && (
                <div className="space-y-2 text-left pt-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 block">Saisir le Code d'autorisation reçu (4 chiffres)</label>
                  <input
                    id="orange-otp-token-input"
                    type="text"
                    maxLength={4}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 8431"
                    className="w-full bg-[#FFF7ED] border border-vibrant-border rounded-xl px-4 py-3 text-center text-sm font-black font-mono tracking-widest text-[#F97316] focus:outline-none focus:border-vibrant-orange"
                  />
                  {otpError && <p className="text-[10px] font-bold text-rose-600">{otpError}</p>}
                </div>
              )}

              {paymentMethod === 'orange' && (
                <button
                  id="btn-submit-otp-orange"
                  onClick={handleConfirmPaymentOTP}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-3 rounded-xl mt-4 cursor-pointer uppercase tracking-wider"
                >
                  Vérifier l'autorisation Orange Money
                </button>
              )}

            </div>
          )}

          {/* STEP 3: PROCESSING TRANSACTION STATE */}
          {paymentState === 'processing' && (
            <div className="space-y-4 text-center py-8 animate-fade-in">
              <Loader2 className="h-10 w-10 text-vibrant-emerald animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-900 font-display">Traitement en cours...</h4>
                <p className="text-xs text-neutral-500 font-bold">{simulatedProgress}</p>
              </div>
              <p className="text-[10px] text-rose-600 font-bold">Ne fermez pas cette page.</p>
            </div>
          )}

          {/* STEP 4: PAYMENT SUCCESSFUL STATE */}
          {paymentState === 'completed' && (
            <div className="space-y-4 text-center py-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] text-vibrant-emerald flex items-center justify-center mx-auto border border-[#10B981]/30 shadow-xs">
                <Check className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-neutral-900 font-display">
                  {paymentMethod === 'cod' ? 'COMMANDE ENREGISTRÉE !' : 'PAIEMENT CONFIRMÉ !'}
                </h4>
                <p className="text-xs text-[#059669] font-bold">
                  {paymentMethod === 'cod' 
                    ? 'Le colis sera préparé immédiatement par notre équipe.'
                    : 'Votre transaction mobile a été validée avec succès.'}
                </p>
              </div>

              {/* Receipt card info */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150 text-left text-xs space-y-2">
                <p className="text-[10px] uppercase font-bold text-neutral-400">Récapitulatif de Commande</p>
                <div className="divide-y divide-neutral-200/60 space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Mode de paiement:</span>
                    <span className="font-bold text-neutral-800">
                      {paymentMethod === 'cod' ? '💵 Paiement à la livraison' : `📱 ${paymentMethod.toUpperCase()}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Flux de livraison:</span>
                    <span className="font-semibold text-neutral-800">{deliveryZone.name.split(' (')[0]}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">{paymentMethod === 'cod' ? 'Montant à payer au coursier :' : 'Montant débité :'}</span>
                    <span className="font-extrabold text-[#059669]">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Destinataire:</span>
                    <span className="font-semibold text-neutral-800 truncate max-w-[150px]">{ownerName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Téléphone de livraison:</span>
                    <span className="font-semibold text-neutral-850">+225 {phoneNumber}</span>
                  </div>
                  {deliveryInstruction.trim() && (
                    <div className="py-2 mt-2 bg-orange-50/50 p-2.5 rounded-lg border border-vibrant-border text-[10px] text-neutral-600">
                      <span className="font-bold text-vibrant-orange uppercase block mb-0.5">Instruction pour le livreur :</span>
                      <p className="italic font-medium">"{deliveryInstruction}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proceed */}
              <button
                id="btn-finalize-checkout"
                onClick={handleFinalizeOrder}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Finaliser ma commande</span>
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
