'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PelerinLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to determine active link
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] text-[#1A1209] font-sans">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-[#E8DFC8] flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-y-auto hidden md:flex">
        <div className="px-8 py-6 flex items-center justify-between border-b border-[#FAF3E0]">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#1A1209]">
            SAFAR<span className="text-[#C9A84C]">U</span>NA
          </Link>
        </div>
        
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF3E0] flex items-center justify-center font-serif text-xl font-bold text-[#C9A84C] shrink-0 border border-[#F0D897]">
            KL
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#1A1209] truncate">Karim Lamrani</div>
            <Link href="/espace/profil" className="text-xs text-[#7A6D5A] hover:text-[#C9A84C] transition-colors mt-0.5 inline-block">Voir le profil</Link>
          </div>
        </div>

        <nav className="flex-1 py-4 text-sm font-medium">
          <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#7A6D5A]/60 px-8 py-3">Mon voyage</div>
          <Link href="/espace/tableau-de-bord" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/tableau-de-bord') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
            <span className="w-5 text-center text-lg">🏠</span> Accueil
          </Link>
          <Link href="/espace/reservations" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/reservations') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
            <span className="w-5 text-center text-lg">🌴</span> Mes Réservations
          </Link>
          <Link href="/espace/messages" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/messages') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
            <span className="w-5 text-center text-lg">💬</span> Messages <span className="ml-auto bg-[#1A4A8A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">1</span>
          </Link>

          <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#7A6D5A]/60 px-8 py-3 mt-4">Spiritualité & Préparation</div>
          <Link href="/espace/academy" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/academy') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">🎓</span> Safaruna Academy
          </Link>
          <Link href="/espace/dua" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/dua') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">🤲</span> Mon carnet de Du'a
          </Link>
          <Link href="/espace/checklist" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/checklist') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">📋</span> Ma Checklist
          </Link>
          <Link href="/espace/favoris" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/favoris') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">❤️</span> Mes Favoris
          </Link>

          <div className="border-t border-[#E8DFC8] my-4 mx-8"></div>
          
          <Link href="/espace/profil" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/profil') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">👤</span> Modifier mon profil
          </Link>
          <Link href="/espace/parrainage" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/parrainage') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">🎁</span> Parrainage <span className="ml-auto text-[10px] font-bold text-[#1D5C3A] bg-[#E8F5EE] px-2 py-0.5 rounded-full">50€ offerts</span>
          </Link>
          <Link href="/espace/parametres" className={`flex items-center gap-3 px-8 py-2.5 transition-colors ${isActive('/espace/parametres') ? 'text-[#8B6914] bg-[#FAF3E0] font-bold' : 'text-[#7A6D5A] hover:text-[#1A1209] hover:bg-[#FAF7F0]'}`}>
             <span className="w-5 text-center text-lg">⚙️</span> Paramètres
          </Link>
        </nav>

        <div className="p-6 border-t border-[#E8DFC8]">
          <button className="flex items-center gap-3 text-sm font-bold text-[#C0392B] hover:text-[#A93226] transition-colors w-full">
            <span className="w-5 text-center text-lg">🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8DFC8] px-6 py-4 flex items-center justify-between lg:px-10">
          <h2 className="font-serif text-xl md:text-2xl text-[#1A1209]">Espace Pèlerin</h2>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full border border-[#E8DFC8] bg-white flex items-center justify-center hover:border-[#C9A84C] transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#C0392B] border-2 border-white"></span>
            </button>
            <Link href="/guides" className="hidden sm:inline-block px-5 py-2 rounded-full text-sm font-bold bg-[#1A1209] text-white hover:bg-[#2D1F08] transition-colors shadow-md hover:shadow-lg">
              Trouver un guide
            </Link>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
