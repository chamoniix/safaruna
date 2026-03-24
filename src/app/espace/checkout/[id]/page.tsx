'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate Stripe payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="bg-white rounded-3xl p-10 border border-[#E8DFC8] shadow-lg">
            <div className="w-24 h-24 mx-auto bg-[#E8F5EE] rounded-full flex items-center justify-center mb-6 border-4 border-[#1D5C3A]/20">
              <span className="text-[#1D5C3A] text-5xl">✓</span>
            </div>
            <h1 className="text-3xl font-serif text-[#1A1209] mb-4">Paiement réussi !</h1>
            <p className="text-[#7A6D5A] mb-8 leading-relaxed">
              BarakAllahu fik. Votre réservation <strong>{params.id}</strong> est confirmée. 
              Votre guide Cheikh Rachid a été notifié et vous attend insha'Allah !
            </p>
            <Link href="/espace/tableau-de-bord" className="bg-[#C9A84C] text-[#1A1209] font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] hover:bg-[#F0D897] transition-all inline-block">
              Accéder à mon espace pèlerin
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 pt-28">
        <Link href={`/guides`} className="text-sm font-bold text-[#7A6D5A] hover:text-[#C9A84C] transition-colors mb-6 inline-block">
          ← Retour à la réservation
        </Link>
        
        <h1 className="text-3xl font-serif text-[#1A1209] mb-10">Confirmez et payez</h1>

        <div className="flex flex-col-reverse lg:flex-row gap-10">
          
          {/* CHEKCOUT FORM */}
          <div className="flex-1 space-y-8">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFC8] shadow-sm">
              <h2 className="font-serif text-xl text-[#1A1209] mb-6 border-b border-[#FAF3E0] pb-4">Mode de paiement — Carte Bancaire</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#4A4A4A]">Nom sur la carte</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" placeholder="KARIM LAMRANI" required />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-[#4A4A4A]">Numéro de carte</label>
                  <div className="relative">
                    <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] font-mono tracking-widest focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" placeholder="0000 0000 0000 0000" required maxLength={19} />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale opacity-60">💳</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#4A4A4A]">Date d'expiration</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] font-mono tracking-widest focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" placeholder="MM/AA" required maxLength={5} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#4A4A4A]">CVC</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] font-mono tracking-widest focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" placeholder="123" required maxLength={4} />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#FAF3E0]">
                  <p className="text-xs text-[#7A6D5A] mb-6 flex items-start gap-2">
                    <span className="text-[#C9A84C]">🔒</span>
                    Vos paiements sont sécurisés par Stripe. SAFARUNA ne stocke aucune donnée bancaire sensible.
                  </p>
                  
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] ${isProcessing ? 'bg-[#FAF3E0] text-[#8B6914] cursor-not-allowed' : 'bg-[#C9A84C] text-[#1A1209] hover:bg-[#F0D897] hover:shadow-[0_6px_20px_rgba(201,168,76,0.5)]'}`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#8B6914]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement sécurisé...
                      </span>
                    ) : (
                      <span className="text-lg">Payer 320,00 €</span>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:w-[400px] shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-[#E8DFC8] shadow-sm sticky top-28">
              
              <div className="flex gap-4 items-center mb-6 pb-6 border-b border-[#FAF3E0]">
                <div className="w-16 h-16 rounded-full bg-[#1A1209] overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Guide" className="w-full h-full object-cover opacity-80" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1209]">Rachid Al-Madani</h3>
                  <div className="text-xs text-[#7A6D5A] mt-1">Makkah · Guide Certifié</div>
                  <div className="text-xs text-[#C9A84C] font-bold mt-1">★★★★★ 4.97 (214 avis)</div>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <h4 className="font-serif text-xl text-[#1A1209]">Détails de la réservation</h4>
                
                <div className="flex items-start gap-4">
                  <div className="text-lg mt-0.5">📅</div>
                  <div>
                    <div className="font-bold text-[#1A1209] text-sm">Dates de service</div>
                    <div className="text-sm text-[#7A6D5A]">10 au 14 Juin 2025 (5 jours)</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-lg mt-0.5">👥</div>
                  <div>
                    <div className="font-bold text-[#1A1209] text-sm">Pèlerins</div>
                    <div className="text-sm text-[#7A6D5A]">2 pèlerins</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-lg mt-0.5">📦</div>
                  <div>
                    <div className="font-bold text-[#1A1209] text-sm">Forfait choisi</div>
                    <div className="text-sm text-[#7A6D5A]">Ziyara & Omra Essentielle</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-lg mt-0.5">🚗</div>
                  <div>
                    <div className="font-bold text-[#1A1209] text-sm">Transport</div>
                    <div className="text-sm text-[#7A6D5A]">Voiture 4 places (+80€)</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#FAF3E0] space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#7A6D5A]">Forfait (2 personnes)</span>
                  <span className="font-bold text-[#1A1209]">240,00 €</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#7A6D5A]">Transport optionnel</span>
                  <span className="font-bold text-[#1A1209]">80,00 €</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#7A6D5A]">Frais de service SAFARUNA</span>
                  <span className="text-[#1D5C3A] font-bold">Inclus dans le prix</span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E8DFC8] flex justify-between items-center">
                <span className="font-serif text-xl font-bold text-[#1A1209]">Total</span>
                <span className="font-serif text-3xl font-bold text-[#1A1209]">320,00 €</span>
              </div>
              <div className="text-right mt-1 text-[10px] text-[#7A6D5A] uppercase tracking-wider font-bold">
                TTC
              </div>
              
              <div className="bg-[#FAF7F0] text-[#7A6D5A] p-4 rounded-xl text-xs mt-6 leading-relaxed border border-[#E8DFC8]">
                <strong>Garantie d'annulation :</strong> Remboursement intégral si annulé au moins 7 jours avant le départ. Aucun frais caché.
              </div>

            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}