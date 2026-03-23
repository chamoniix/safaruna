import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  // Mock Reservation ID based on params
  const reservationNumber = `SAF-2025-${params.id.slice(0, 4).toUpperCase() || 'A1B2'}`;

  return (
    <div className="min-h-screen bg-[var(--cream)] select-none">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-6 py-24 pt-32 text-center">
        
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-[var(--sand)] shadow-lg relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[var(--green)]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--green-bg)] rounded-full mix-blend-multiply opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--gold-pale)] rounded-full mix-blend-multiply opacity-50 pointer-events-none"></div>

          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto bg-[var(--green-bg)] rounded-full flex items-center justify-center mb-8 relative z-10 shadow-sm border border-[var(--green)]/20">
            <span className="text-[var(--green)] text-5xl">✓</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-[var(--deep)] mb-4 relative z-10">
            Réservation confirmée<br />
            <em className="text-[var(--gold-dark)] block mt-2 text-2xl font-normal">— Alhamdulillah ! —</em>
          </h1>
          
          <p className="text-[var(--muted)] mb-10 text-lg relative z-10">
            Qu'Allah facilite votre Omra et accepte vos œuvres.
          </p>

          <div className="bg-[var(--cream)] rounded-2xl p-6 border border-[var(--sand)] text-left mb-8 relative z-10">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--muted)] mb-5 border-b border-[var(--sand)] pb-3">Récapitulatif de votre mission</h4>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <dt className="text-[var(--muted)] mb-1">Guide assigné</dt>
                <dd className="font-bold text-[var(--deep)] text-base">Rachid Al-Madani</dd>
              </div>
              
              <div>
                <dt className="text-[var(--muted)] mb-1">N° de réservation</dt>
                <dd className="font-mono font-bold text-[var(--gold-dark)] text-base">#{reservationNumber}</dd>
              </div>
              
              <div>
                <dt className="text-[var(--muted)] mb-1">Dates confirmées</dt>
                <dd className="font-medium text-[var(--deep)] text-base">À définir avec le guide</dd>
              </div>
              
              <div>
                <dt className="text-[var(--muted)] mb-1">Forfait & Montant</dt>
                <dd className="font-bold text-[var(--deep)] text-base">Omra & Histoire — 450€</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[var(--blue-bg)] text-[var(--blue)] p-4 rounded-xl text-sm font-medium mb-10 flex items-start gap-3 text-left border border-[var(--blue)]/20 relative z-10">
            <span className="text-lg">📱</span>
            <p><strong>Prochaine étape :</strong> Votre guide vous contactera dans les 2 heures sur WhatsApp pour préparer votre arrivée et fixer les dates exactes de la mission.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link 
              href="/espace/reservations/1"
              className="py-4 px-8 bg-[var(--deep)] text-[var(--gold-light)] font-bold rounded-xl hover:bg-[var(--warm)] transition-transform hover:-translate-y-0.5 shadow-md flex-1 text-center"
            >
              Voir ma réservation
            </Link>
            <Link 
              href="/espace/checklist"
              className="py-4 px-8 bg-transparent text-[var(--deep)] font-bold rounded-xl border-2 border-[var(--sand)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)] transition-all flex-1 text-center"
            >
              Préparer mon Omra
            </Link>
          </div>

        </div>

        <div className="mt-8">
          <Link href="/espace/tableau-de-bord" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--gold-dark)] transition-colors inline-block">
            ← Retour au tableau de bord
          </Link>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}