'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    // Simulate Stripe processing delay
    setTimeout(() => {
      // Simulate success
      router.push(`/espace/confirmation/${params.id}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] select-none">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto px-6 py-24 pt-32">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-[var(--deep)] mb-2">Finaliser votre réservation</h1>
          <p className="text-[var(--muted)]">Veuillez vérifier les informations ci-dessous et procéder au paiement sécurisé.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Info */}
              <section className="bg-white p-8 rounded-2xl border border-[var(--sand)] shadow-sm">
                <h2 className="text-xl font-semibold text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">1. Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="first_name">Prénom</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="first_name" type="text" required defaultValue="Karim" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="last_name">Nom</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="last_name" type="text" required defaultValue="Lamrani" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="email">Email</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="email" type="email" required defaultValue="demo@pelerin.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="phone">Téléphone (WhatsApp)</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="phone" type="tel" required defaultValue="+33 6 12 34 56 78" />
                  </div>
                </div>
              </section>

              {/* Trip Info */}
              <section className="bg-white p-8 rounded-2xl border border-[var(--sand)] shadow-sm">
                <h2 className="text-xl font-semibold text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">2. Votre Omra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="start_date">Date d'arrivée</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="start_date" type="date" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="end_date">Date de départ</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="end_date" type="date" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="guests">Personnes</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none bg-white" id="guests">
                      <option value="1">1 personne (Solo)</option>
                      <option value="2">2 personnes (Couple)</option>
                      <option value="3">3 personnes</option>
                      <option value="4">4 personnes (Famille)</option>
                      <option value="5">5+ personnes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="notes">Message pour votre guide</label>
                  <textarea className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none" id="notes" rows={3} placeholder="Précisez ici vos attentes, si vous avez des personnes âgées, etc."></textarea>
                </div>
              </section>

              {/* Payment Section */}
              <section className="bg-white p-8 rounded-2xl border border-[var(--sand)] shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--sand)] pb-4">
                  <h2 className="text-xl font-semibold text-[var(--deep)]">3. Paiement Sécurisé</h2>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold font-mono">VISA</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold font-mono">MC</span>
                  </div>
                </div>
                
                {/* Stripe Placeholder */}
                <div className="bg-[#FAF9F6] border border-dashed border-[var(--sand)] rounded-xl p-6 mb-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
                  <p className="text-sm font-semibold text-[var(--gold-dark)] mb-4">Plugin Stripe à connecter en production</p>
                  
                  {/* Fake Card Form */}
                  <div className="max-w-sm mx-auto space-y-4 text-left">
                    <div>
                      <label className="block text-xs text-[var(--muted)] mb-1">Numéro de carte</label>
                      <div className="w-full p-3 bg-white border border-[var(--sand)] rounded-lg text-sm text-gray-400 flex justify-between">
                        <span>XXXX XXXX XXXX XXXX</span>
                        <span>💳</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-[var(--muted)] mb-1">Expiration</label>
                        <div className="w-full p-3 bg-white border border-[var(--sand)] rounded-lg text-sm text-gray-400">MM/AA</div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-[var(--muted)] mb-1">CVC</label>
                        <div className="w-full p-3 bg-white border border-[var(--sand)] rounded-lg text-sm text-gray-400">123</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consents */}
                <div className="space-y-4 mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" required className="mt-1 w-4 h-4 text-[var(--gold)] rounded border-[var(--sand)] focus:ring-[var(--gold)]" />
                    <span className="text-sm text-[var(--muted)] group-hover:text-[var(--deep)] transition-colors">J'accepte les Conditions Générales de Vente (CGV) et la politique d'annulation de SAFARUNA.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group bg-[var(--gold-pale)] p-3 rounded-lg border border-[var(--sand)]">
                    <input type="checkbox" required className="mt-1 w-4 h-4 text-[var(--gold)] rounded border-[var(--sand)] focus:ring-[var(--gold)]" />
                    <span className="text-sm text-[var(--gold-dark)] font-medium">Je m'engage devant Allah à ce que toute réservation actuelle et future avec ce guide passe par la plateforme SAFARUNA, conformément à la charte de confiance.</span>
                  </label>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-[var(--red-bg)] text-[var(--red)] text-sm rounded-xl border border-red-100 flex items-start gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-4 bg-[var(--deep)] text-[var(--gold-light)] font-bold text-lg rounded-xl hover:bg-[var(--warm)] transition-all shadow-[0_8px_20px_rgba(26,18,9,0.2)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[var(--gold-light)] border-t-transparent rounded-full animate-spin"></div>
                      Traitement sécurisé...
                    </>
                  ) : (
                    <>Confirmer et payer 450€</>
                  )}
                </button>
              </section>

            </form>
          </div>

          {/* RIGHT COLUMN: RECAP */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-2xl border border-[var(--sand)] shadow-lg overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]"></div>
                
                <div className="p-6 border-b border-[var(--sand)] bg-gradient-to-b from-[var(--cream)] to-white">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center font-serif text-xl font-bold text-[var(--deep)] shadow-sm">
                      RM
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--deep)] text-lg">Rachid Al-Madani</h3>
                      <p className="text-sm text-[var(--muted)] flex items-center gap-1">
                        <span className="text-[var(--gold)]">★★★★★</span> 4.97 (214 avis)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5 border-b border-[var(--sand)]">
                  <div>
                    <h4 className="font-bold text-[var(--deep)] text-base mb-1">Forfait Omra & Histoire</h4>
                    <p className="text-sm text-[var(--muted)]">5 Jours accompagnés à Makkah et Madinah.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm text-[var(--deep)]">
                      <span className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center text-[var(--gold-dark)]">📅</span>
                      <span>Dates à confirmer</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--deep)]">
                      <span className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center text-[var(--gold-dark)]">👥</span>
                      <span>1 Pèlerin</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--deep)]">
                      <span className="w-8 h-8 rounded-lg bg-[var(--cream)] flex items-center justify-center text-[var(--gold-dark)]">🗣️</span>
                      <span>Guide Francophone</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#FAFAF9]">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-[var(--muted)] mb-4">Détail du prix</h4>
                  
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between text-[var(--deep)]">
                      <span>Tarif journalier (1 × 76€ × 5j)</span>
                      <span>380 €</span>
                    </div>
                    <div className="flex justify-between text-[var(--deep)]">
                      <span>Option: Transport Privé</span>
                      <span>50 €</span>
                    </div>
                    <div className="flex justify-between text-[var(--deep)]">
                      <span>Frais de service SAFARUNA</span>
                      <span>20 €</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[var(--sand)] pt-4 flex justify-between items-center">
                    <div>
                      <span className="block font-bold text-lg text-[var(--deep)]">Total TTC</span>
                      <span className="text-xs text-[var(--muted)]">TVA incluse</span>
                    </div>
                    <span className="font-serif text-3xl font-bold text-[var(--deep)]">450 €</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-[var(--cream)] rounded-2xl p-6 border border-[var(--sand)]">
                <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--gold-dark)] mb-4">La garantie SAFARUNA</h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="text-[var(--green)] mt-0.5">✓</span>
                    <span className="text-sm text-[var(--deep)]"><strong className="block">Paiement 100% sécurisé</strong>Vos fonds sont conservés en sécurité jusqu'à la fin de la mission.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-[var(--green)] mt-0.5">✓</span>
                    <span className="text-sm text-[var(--deep)]"><strong className="block">Annulation flexible</strong>Remboursement intégral jusqu'à 48h avant le début.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-[var(--green)] mt-0.5">✓</span>
                    <span className="text-sm text-[var(--deep)]"><strong className="block">Guide de remplacement</strong>En cas d'imprévu, nous vous trouvons un autre guide sans frais.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}