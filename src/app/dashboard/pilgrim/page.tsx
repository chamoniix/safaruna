import Link from "next/link";
import Image from "next/image";

export default function PilgrimDashboard() {
  return (
    <div className="flex h-screen bg-[var(--cream)] overflow-hidden font-sans text-[var(--deep)]">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-[var(--sand)] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-[var(--sand)]">
            <Link href="/" className="logo text-2xl font-serif font-bold text-[var(--deep)] block" style={{ textDecoration: 'none' }}>
              SAFAR<span className="text-[var(--gold)]">U</span>NA
            </Link>
          </div>
          <nav className="p-4 flex flex-col gap-2">
            <Link href="/dashboard/pilgrim" className="px-4 py-3 rounded-xl bg-[#FAF3E0] text-[var(--gold-dark)] font-semibold flex items-center gap-3">
              <span>🏠</span> Accueil
            </Link>
            <Link href="/dashboard/pilgrim/bookings" className="px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
              <span>📅</span> Mes Réservations
            </Link>
            <Link href="/dashboard/pilgrim/messages" className="px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
              <span>💬</span> Messages
            </Link>
            <Link href="/dashboard/pilgrim/academy" className="px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
              <span>🎓</span> SAFARUNA Academy
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-[var(--sand)]">
          <button className="w-full px-4 py-3 text-left rounded-xl text-[#C0392B] hover:bg-[#FDECEA] font-medium flex items-center gap-3 transition-colors">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        {/* TOPBAR */}
        <header className="bg-white px-8 py-5 border-b border-[var(--sand)] flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-[var(--deep)]">As-salamu alaykum, Pèlerin</h1>
            <p className="text-sm text-[var(--muted)]">Que la paix soit sur vous. Prêt pour votre voyage spirituel ?</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-[var(--sand)] flex items-center justify-center text-[var(--deep)] hover:bg-[var(--sand)] transition-colors">
              🔔
            </button>
            <div className="w-10 h-10 rounded-full bg-[var(--deep)] text-[var(--gold-light)] flex items-center justify-center font-bold font-serif shadow-md border-2 border-[var(--gold)]">
              PR
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-[var(--sand)] shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🕋</div>
              <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Prochaine Omra</h3>
              <p className="text-2xl font-serif font-semibold text-[var(--deep)]">En attente</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[var(--sand)] shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Academy</h3>
              <p className="text-2xl font-serif font-semibold text-[var(--deep)]">Module 1</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[var(--sand)] shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Statut Pilier</h3>
              <p className="text-2xl font-serif font-semibold text-[var(--deep)]">Nouveau</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* BOOKING CARD AREA */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[var(--deep)]">Votre voyage actuel</h2>
                <Link href="/guides" className="text-sm font-bold text-[var(--gold-dark)] hover:underline">
                  Explorer les guides →
                </Link>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-[var(--sand)] shadow-sm text-center flex flex-col items-center justify-center md:h-[400px]">
                <div className="text-6xl mb-4 opacity-50">🧭</div>
                <h3 className="text-xl font-serif font-bold text-[var(--deep)] mb-2">Aucun voyage prévu</h3>
                <p className="text-[var(--muted)] max-w-md mb-6 leading-relaxed">
                  Il est temps de planifier votre Omra. Les guides de Makkah et Madinah sont prêts à vous accompagner spirituellement.
                </p>
                <Link href="/guides" className="px-6 py-3 bg-[var(--deep)] text-[var(--gold-light)] font-bold rounded-full hover:bg-[var(--warm)] transition-colors shadow-lg shadow-[rgba(26,18,9,0.2)]">
                  Trouver mon guide privé
                </Link>
              </div>
            </div>

            {/* ISLAMIC REMINDERS */}
            <div>
              <h2 className="text-xl font-bold text-[var(--deep)] mb-5">Préparation spirituelle</h2>
              <div className="bg-[var(--deep)] p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden h-[400px] flex flex-col">
                <div className="absolute -top-10 -right-10 text-9xl text-white opacity-[0.03] font-serif font-black select-none pointer-events-none">
                  ﷽
                </div>
                
                <div className="mb-auto relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-xl mb-6">
                    🤲
                  </div>
                  <h3 className="text-[var(--gold-light)] font-bold mb-3 text-lg">Du'a du voyageur</h3>
                  <p className="text-white opacity-90 mb-5 leading-loose font-serif text-right text-2xl" dir="rtl">
                    سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ
                  </p>
                  <p className="text-white opacity-70 text-sm italic mb-4 leading-relaxed bg-[rgba(255,255,255,0.05)] p-4 rounded-xl border-l-2 border-[var(--gold)]">
                    "Gloire à Celui qui nous a soumis ceci alors que nous n'étions pas capables de le dominer."
                  </p>
                </div>

                <div className="mt-8 relative z-10">
                  <button className="w-full py-3.5 bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)] text-[var(--deep)] text-sm font-bold rounded-xl hover:from-white hover:to-white transition-all shadow-md">
                    Ouvrir SAFARUNA Academy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
