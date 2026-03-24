'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAvailable, setIsAvailable] = useState(true);

  // Helper to determine active link
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-[var(--cream)] text-[var(--deep)] font-sans">
      {/* SIDEBAR */}
      <aside className="w-[250px] bg-[var(--deep)] flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-y-auto hidden md:flex">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-white">
            SAFAR<span className="text-[var(--gold)]">U</span>NA
          </Link>
          <span className="bg-[var(--gold)] text-[var(--deep)] text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">Guide</span>
        </div>
        
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center font-serif text-lg font-bold text-[var(--deep)] relative shrink-0">
            رم
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--deep)] ${isAvailable ? 'bg-[#27AE60]' : 'bg-gray-400'}`}></div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">Rachid Al-Madani</div>
            <div className="text-xs text-[var(--gold)] mt-0.5">★★★★★ 4.97 (214)</div>
            <div className="flex items-center gap-1.5 mt-1.5 cursor-pointer" onClick={() => setIsAvailable(!isAvailable)}>
              <div className={`w-7 h-3.5 rounded-full relative transition-colors ${isAvailable ? 'bg-[var(--green)]' : 'bg-white/15'}`}>
                <div className={`absolute top-[2px] w-2.5 h-2.5 rounded-full bg-white transition-all ${isAvailable ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </div>
              <span className={`text-[10px] ${isAvailable ? 'text-[#6EC68A]' : 'text-white/50'}`}>{isAvailable ? 'Disponible' : 'Indisponible'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 text-sm">
          <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 px-6 py-2.5">Tableau de bord</div>
          <Link href="/guide/tableau-de-bord" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/tableau-de-bord') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
            <span className="w-4 text-center">🏠</span> Accueil
          </Link>
          <Link href="/guide/demandes" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/demandes') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
            <span className="w-4 text-center">📥</span> Demandes <span className="ml-auto bg-[var(--red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">3</span>
          </Link>
          <Link href="/guide/missions" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/missions') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
            <span className="w-4 text-center">📋</span> Mes missions
          </Link>
          <Link href="/guide/messages" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/messages') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
            <span className="w-4 text-center">💬</span> Messages <span className="ml-auto bg-[var(--red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">5</span>
          </Link>

          <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 px-6 py-2.5 mt-2">Gestion</div>
          <Link href="/guide/calendrier" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/calendrier') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
             <span className="w-4 text-center">📅</span> Calendrier
          </Link>
          <Link href="/guide/revenus" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/revenus') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
             <span className="w-4 text-center">💰</span> Mes revenus
          </Link>
          <Link href="/guide/avis" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/avis') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
             <span className="w-4 text-center">⭐</span> Mes avis
          </Link>
          
          <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 px-6 py-2.5 mt-2">Mon profil</div>
          <Link href="/guide/profil" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/profil') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
             <span className="w-4 text-center">👤</span> Modifier profil
          </Link>
          <Link href="/guide/forfaits" className={`flex items-center gap-3 px-6 py-2 border-l-2 transition-colors ${isActive('/guide/forfaits') ? 'text-[var(--gold-light)] bg-[var(--gold)]/10 border-[var(--gold)]' : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'}`}>
             <span className="w-4 text-center">📦</span> Mes forfaits
          </Link>
        </nav>

        <div className="p-6 border-t border-white/10 flex flex-col gap-2">
          <Link href="/charte" className="flex items-center gap-2 text-xs text-white/30 hover:text-white/70 transition-colors">
            <span>🔒</span> Charte SAFARUNA
          </Link>
          <button className="flex items-center gap-2 text-xs text-white/30 hover:text-white/70 transition-colors text-left">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-[250px] flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-[var(--cream)]/95 backdrop-blur-md border-b border-[var(--sand)] px-8 py-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Tableau de bord guide</h2>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full border border-[var(--sand)] bg-white flex items-center justify-center hover:border-[var(--gold)] transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--red)] border-2 border-white"></span>
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--deep)] text-[var(--gold-light)] hover:bg-[var(--warm)] transition-colors hidden sm:block">
              Partager profil
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--gold)] text-[var(--deep)] hover:bg-[var(--gold-dark)] hover:text-white transition-colors">
              + Dispo
            </button>
          </div>
        </header>

        <main className="p-6 sm:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
