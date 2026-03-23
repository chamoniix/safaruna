import Link from "next/link";
import Image from "next/image";

export default function PilgrimDashboard() {
  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden font-sans text-[var(--deep)] select-none">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-[var(--sand)] flex flex-col justify-between hidden lg:flex relative z-20">
        <div>
          <div className="p-6 border-b border-[var(--sand)]">
            <Link href="/" className="logo text-2xl font-serif font-bold text-[var(--deep)] block" style={{ textDecoration: 'none' }}>
              SAFAR<span className="text-[var(--gold)]">U</span>NA
            </Link>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
            
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-4 mb-2">Mon Espace</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/espace/tableau-de-bord" className="px-4 py-2.5 rounded-lg bg-[var(--gold-pale)] text-[var(--gold-dark)] font-semibold flex items-center gap-3">
                  <span className="text-lg">🏠</span> Tableau de bord
                </Link>
                <Link href="/espace/reservations" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors justify-between">
                  <div className="flex items-center gap-3"><span className="text-lg">📅</span> Mes réservations</div>
                  <span className="bg-[var(--cream)] text-[var(--deep)] text-xs px-2 py-0.5 rounded-full font-bold">1</span>
                </Link>
                <Link href="/espace/messages" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors justify-between">
                  <div className="flex items-center gap-3"><span className="text-lg">💬</span> Messages</div>
                  <span className="bg-[var(--red)] text-white text-xs px-2 py-0.5 rounded-full font-bold">2</span>
                </Link>
                <Link href="/espace/dua" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">📖</span> Mes Du'a
                </Link>
              </nav>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-4 mb-2">Préparer</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/espace/checklist" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">✅</span> Checklist Omra
                </Link>
                <Link href="/guides" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">🔍</span> Trouver un guide
                </Link>
                <Link href="/espace/favoris" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">❤️</span> Guides favoris
                </Link>
              </nav>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-4 mb-2">Apprendre</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/espace/academy" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">🎓</span> Academy
                </Link>
                <Link href="/lieux-saints" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">🕌</span> Lieux Saints
                </Link>
              </nav>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest px-4 mb-2">Compte</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/espace/profil" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">👤</span> Mon Profil
                </Link>
                <Link href="/espace/parametres" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">⚙️</span> Paramètres
                </Link>
                <Link href="/espace/parrainage" className="px-4 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--deep)] font-medium flex items-center gap-3 transition-colors">
                  <span className="text-lg">🎁</span> Parrainage (15€)
                </Link>
              </nav>
            </div>

          </div>
        </div>
        <div className="p-4 border-t border-[var(--sand)] bg-white">
          <button className="w-full px-4 py-3 text-left rounded-xl text-[#C0392B] hover:bg-[#FDECEA] font-medium flex items-center gap-3 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full relative">
        {/* TOPBAR */}
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 border-b border-[var(--sand)] flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[var(--deep)] text-2xl">☰</button>
            <div>
              <h1 className="text-xl font-bold text-[var(--deep)] leading-tight">As-salamu alaykum, Karim</h1>
              <p className="text-xs text-[var(--muted)]">Que la paix soit sur vous.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-[var(--sand)] flex items-center justify-center text-[var(--deep)] hover:bg-[var(--sand)] transition-colors relative">
              🔔
              <span className="w-2.5 h-2.5 bg-[var(--red)] rounded-full border-2 border-white absolute top-0 right-0"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] text-[var(--deep)] flex items-center justify-center font-bold font-serif shadow-sm cursor-pointer">
              KL
            </div>
          </div>
        </header>

        <div className="min-h-full p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-8 pb-20">
          
          {/* WELCOME BANNER */}
          <section className="bg-[var(--deep)] rounded-3xl p-8 relative overflow-hidden shadow-lg border border-black/10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_70%)] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <span className="inline-block px-3 py-1 bg-white/10 text-[var(--gold-light)] text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-white/10">
                  Préparation en cours
                </span>
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">Votre prochaine Omra approche.</h2>
                <p className="text-white/60 mb-6 max-w-lg">
                  Profitez de ce temps pour purifier votre intention, réviser les rituels et préparer votre cœur à cette rencontre divine.
                </p>
                <div className="flex gap-4">
                  <Link href="/espace/checklist" className="px-6 py-3 bg-[var(--gold)] text-[var(--deep)] font-bold rounded-xl hover:bg-[var(--gold-light)] shadow-[0_4px_15px_rgba(201,168,76,0.3)] transition-colors">
                    Ouvrir ma checklist
                  </Link>
                  <Link href="/espace/reservations/1" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                    Détails voyage
                  </Link>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-black/40 backdrop-blur-md border border-[var(--gold)]/30 rounded-2xl p-6 text-center shrink-0 min-w-[280px]">
                <div className="text-xs text-[var(--gold-light)] uppercase tracking-widest font-bold mb-3">Départ Makkah dans</div>
                <div className="flex justify-center gap-4 text-white font-serif">
                  <div className="flex flex-col"><span className="text-4xl font-bold">42</span><span className="text-xs mt-1 text-white/50 font-sans">Jours</span></div>
                  <div className="text-3xl text-[var(--gold-dark)] mt-1">:</div>
                  <div className="flex flex-col"><span className="text-4xl font-bold">18</span><span className="text-xs mt-1 text-white/50 font-sans">Heures</span></div>
                  <div className="text-3xl text-[var(--gold-dark)] mt-1">:</div>
                  <div className="flex flex-col"><span className="text-4xl font-bold">09</span><span className="text-xs mt-1 text-white/50 font-sans">Minutes</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* 4 STAT CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[var(--sand)] flex items-center gap-4 shadow-sm hover:border-[var(--gold-light)] transition-colors cursor-default">
              <div className="w-12 h-12 rounded-full bg-[var(--cream)] flex items-center justify-center text-xl shrink-0">🕋</div>
              <div><p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider">Omras</p><p className="text-2xl font-serif font-bold text-[var(--deep)]">1</p></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[var(--sand)] flex items-center gap-4 shadow-sm hover:border-[var(--gold-light)] transition-colors cursor-default">
              <div className="w-12 h-12 rounded-full bg-[var(--cream)] flex items-center justify-center text-xl shrink-0">🤝</div>
              <div><p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider">Guides</p><p className="text-2xl font-serif font-bold text-[var(--deep)]">1 évalué</p></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[var(--sand)] flex items-center gap-4 shadow-sm hover:border-[var(--gold-light)] transition-colors cursor-default">
              <div className="w-12 h-12 rounded-full bg-[var(--cream)] flex items-center justify-center text-xl shrink-0">🎓</div>
              <div><p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider">Academy</p><p className="text-2xl font-serif font-bold text-[var(--deep)]">3 cours</p></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[var(--sand)] flex items-center gap-4 shadow-sm hover:border-[var(--gold-light)] transition-colors cursor-default">
              <div className="w-12 h-12 rounded-full bg-[var(--green-bg)] flex items-center justify-center text-xl shrink-0">💶</div>
              <div><p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider">Crédit Parrainage</p><p className="text-2xl font-serif font-bold text-[var(--green)]">45.00€</p></div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            
            <div className="xl:col-span-2 space-y-8">
              
              {/* CURRENT RESERVATION */}
              <section className="bg-white rounded-2xl border border-[var(--sand)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--sand)] flex justify-between items-center bg-[#FAFAF9]">
                  <h3 className="font-bold text-[var(--deep)] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span> Réservation confirmée</h3>
                  <span className="text-xs font-mono text-[var(--muted)]">#SAF-2025-ABCD</span>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center font-serif text-2xl font-bold text-[var(--deep)] shadow-sm shrink-0">RM</div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold text-[var(--deep)] mb-1">Rachid Al-Madani</h4>
                    <p className="text-sm text-[var(--muted)] mb-3">Forfait Omra & Histoire • 5 jours</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <span className="px-2.5 py-1 bg-[var(--cream)] text-[var(--deep)] text-xs font-semibold rounded-md border border-[var(--sand)] border-dashed">📍 Makkah & Madinah</span>
                      <span className="px-2.5 py-1 bg-[var(--cream)] text-[var(--deep)] text-xs font-semibold rounded-md border border-[var(--sand)] border-dashed">👥 2 Pers.</span>
                      <span className="px-2.5 py-1 bg-[var(--blue-bg)] text-[var(--blue)] text-xs font-semibold rounded-md">💬 1 Nouveau message</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                    <Link href="/espace/messages/1" className="px-5 py-2.5 bg-[var(--deep)] text-white text-sm font-bold rounded-xl text-center hover:bg-[var(--warm)] transition-colors">
                      Ouvrir la discussion
                    </Link>
                    <Link href="/espace/reservations/1" className="px-5 py-2.5 bg-white border border-[var(--sand)] text-[var(--deep)] text-sm font-semibold rounded-xl text-center hover:bg-[var(--cream)] transition-colors">
                      Détails complets
                    </Link>
                  </div>
                </div>
              </section>

              {/* MESSAGES PREVIEW */}
              <section className="bg-white rounded-2xl border border-[var(--sand)] shadow-sm">
                <div className="px-6 py-4 border-b border-[var(--sand)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--deep)]">Messages récents</h3>
                  <Link href="/espace/messages" className="text-sm font-bold text-[var(--gold-dark)] hover:underline">Voir tout</Link>
                </div>
                <div className="p-0">
                  <Link href="/espace/messages/1" className="flex items-center gap-4 p-5 border-b border-[var(--sand)] hover:bg-[var(--cream)] transition-colors group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[var(--sand)] flex items-center justify-center font-serif font-bold text-[var(--deep)]">RM</div>
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--red)] border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[var(--deep)] text-sm group-hover:text-[var(--gold-dark)] transition-colors">Rachid Al-Madani</h4>
                        <span className="text-xs text-[var(--muted)]">10:42</span>
                      </div>
                      <p className="text-sm text-[var(--deep)] font-semibold truncate">As-salamu alaykum mon frère, avez-vous pu confirmer vos dates de vol ?</p>
                    </div>
                  </Link>
                  <Link href="/espace/messages/2" className="flex items-center gap-4 p-5 hover:bg-[var(--cream)] transition-colors group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[var(--sand)] flex items-center justify-center font-serif font-bold text-[var(--deep)]">FA</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-[var(--deep)] text-sm group-hover:text-[var(--gold-dark)] transition-colors">Fatima Al-Omari</h4>
                        <span className="text-xs text-[var(--muted)]">Hier</span>
                      </div>
                      <p className="text-sm text-[var(--muted)] truncate">BarakAllahu fikum pour votre confiance, à très bientôt insha'Allah.</p>
                    </div>
                  </Link>
                </div>
              </section>
            </div>

            {/* SIDE COLUMN */}
            <div className="space-y-6">
              
              {/* DUA OF THE DAY */}
              <section className="bg-white rounded-2xl border border-[var(--sand)] p-6 shadow-sm relative overflow-hidden group hover:border-[var(--gold)] transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(201,168,76,0.1)_0%,transparent_70%)] pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--muted)]">Du'a du jour</h3>
                  <button className="text-[var(--gold-dark)] text-xl hover:scale-110 transition-transform">📚</button>
                </div>
                <div className="text-center relative z-10">
                  <p className="font-serif text-2xl text-[var(--deep)] leading-loose mb-3" dir="rtl">
                    رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
                  </p>
                  <p className="text-xs text-[var(--muted)] italic border-l-2 border-[var(--gold)] pl-3 text-left">
                    "Seigneur, accorde-nous belle part ici-bas, et belle part aussi dans l'au-delà ; et protège-nous du châtiment du Feu."
                  </p>
                </div>
              </section>

              {/* CHECKLIST WIDGET */}
              <section className="bg-white rounded-2xl border border-[var(--sand)] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[var(--deep)]">Checklist Omra</h3>
                  <span className="text-xs font-bold text-[var(--green)] bg-[var(--green-bg)] px-2 py-1 rounded-md">2/8</span>
                </div>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[var(--gold)] border-[var(--sand)] rounded accent-[var(--gold)]" />
                    <span className="text-sm text-[var(--muted)] line-through">Visa électronique (E-Visa) validé</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[var(--gold)] border-[var(--sand)] rounded accent-[var(--gold)]" />
                    <span className="text-sm text-[var(--muted)] line-through">Réservation des billets d'avion</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1 w-4 h-4 border-[var(--sand)] rounded accent-[var(--gold)]" />
                    <span className="text-sm text-[var(--deep)] font-medium">Acheter la tenue d'ihram</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1 w-4 h-4 border-[var(--sand)] rounded accent-[var(--gold)]" />
                    <span className="text-sm text-[var(--deep)] font-medium">Apprendre les du'a du Tawaf</span>
                  </label>
                </div>
                <Link href="/espace/checklist" className="block text-center text-sm font-bold text-[var(--gold-dark)] mt-5 hover:underline">
                  Voir toute la checklist →
                </Link>
              </section>

              {/* SUGGESTED ACADEMY */}
              <section className="bg-white rounded-2xl border border-[var(--sand)] p-6 shadow-sm">
                <h3 className="font-bold text-[var(--deep)] mb-4">Recommandé pour vous</h3>
                <div className="rounded-xl overflow-hidden border border-[var(--sand)] group cursor-pointer hover:border-[var(--gold-light)] transition-colors">
                  <div className="h-32 bg-[var(--deep)] relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <span className="text-4xl relative z-10">🕋</span>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold-dark)] bg-[var(--gold-pale)] px-2 py-0.5 rounded">Rituels</span>
                      <span className="text-xs text-[var(--muted)]">12 min</span>
                    </div>
                    <h4 className="font-bold text-[var(--deep)] text-sm mb-2 group-hover:text-[var(--gold-dark)] transition-colors">Comment accomplir le Tawaf ?</h4>
                    <div className="w-full bg-[var(--sand)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--green)] h-full w-[40%]"></div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
