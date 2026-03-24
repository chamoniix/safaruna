'use client';

import Link from 'next/link';

export default function PelerinDashboard() {
  return (
    <>
      {/* HEADER BANNER - NEXT TRIP COUNTDOWN */}
      <div className="bg-[#1A1209] rounded-[24px] p-8 md:p-12 mb-10 overflow-hidden relative shadow-lg">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C9A84C] via-[#C9A84C] to-transparent pointer-events-none"></div>
        <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 font-serif text-[180px] text-[#C9A84C]/5 leading-none select-none pointer-events-none">الحج</div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="inline-block bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#F0D897] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              VOTRE PROCHAIN VOYAGE
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white mb-2">Omra & Histoire</h1>
            <p className="text-white/60 font-medium">Départ le Vendredi 10 Juin 2025</p>
          </div>
          <div className="text-right">
            <div className="font-serif text-7xl md:text-[90px] text-[#F0D897] leading-none tracking-tight">47</div>
            <div className="text-white/50 text-sm font-bold tracking-widest uppercase mt-2">Jours restants</div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 relative z-10">
          <Link href="/espace/reservations/SAF-2025-012" className="bg-[#C9A84C] text-[#1A1209] px-6 py-3 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] hover:bg-[#F0D897] hover:shadow-[0_6px_20px_rgba(201,168,76,0.5)] transition-all">
            Plan de vol & Détails
          </Link>
          <Link href="/espace/messages" className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full text-sm font-bold hover:bg-white/20 transition-all">
            Contacter mon Guide
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COL GAUCHE - 2 SPAN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ACADEMY WIDGET */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl text-[#1A1209]">Safaruna Academy</h2>
              <Link href="/espace/academy" className="text-sm font-bold text-[#8B6914] hover:underline">Reprendre &rarr;</Link>
            </div>
            <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 shadow-[0_2px_10px_rgba(26,18,9,0.02)] flex flex-col sm:flex-row gap-6 hover:border-[#C9A84C] transition-colors cursor-pointer group">
              <div className="w-full sm:w-48 aspect-video bg-[#1A1209] rounded-xl relative overflow-hidden group-hover:shadow-lg transition-all shrink-0">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                    <span className="text-white text-xl ml-1">▶</span>
                  </div>
                </div>
                <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Kaaba" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">12:45</div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[10px] text-[#A93226] bg-[#FDECEA] font-bold tracking-widest uppercase px-2 py-0.5 rounded inline-block w-max mb-2">Module 2</div>
                <h3 className="font-serif text-xl text-[#1A1209] mb-2 group-hover:text-[#8B6914] transition-colors">Les rites de l'Omra : étape par étape</h3>
                <p className="text-sm text-[#7A6D5A] line-clamp-2 mb-4">Comprenez le Tawaaf, le Sa'i et les règles spirituelles de l'Ihram avant d'arriver au Meeqat.</p>
                
                <div className="w-full">
                  <div className="flex justify-between text-[10px] font-bold text-[#7A6D5A] mb-1.5">
                    <span>Progression</span>
                    <span>45%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#FAF3E0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1D5C3A] w-[45%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DUA TRACKER WIDGET */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-2xl text-[#1A1209]">Mes Du'a Quotidiens</h2>
              <Link href="/espace/dua" className="text-sm font-bold text-[#8B6914] hover:underline">Voir le carnet &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm">
                <div className="w-8 h-8 bg-[#E8F5EE] text-[#1D5C3A] rounded-full flex items-center justify-center mb-3">✓</div>
                <h4 className="font-bold text-[#1A1209] mb-1">Du'a du matin (Dhikr)</h4>
                <p className="text-xs text-[#7A6D5A] mb-4">Maintient la protection et la barakah.</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#FAF3E0] rounded-full"><div className="h-full bg-[#1D5C3A] w-full rounded-full"></div></div>
                  <span className="text-[10px] font-bold text-[#1D5C3A]">3/3 lus</span>
                </div>
              </div>

              <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm cursor-pointer hover:border-[#C9A84C] group">
                <div className="w-8 h-8 border-2 border-[#E8DFC8] text-[#E8DFC8] rounded-full flex items-center justify-center mb-3 group-hover:border-[#C9A84C] group-hover:text-[#C9A84C] transition-colors">2</div>
                <h4 className="font-bold text-[#1A1209] mb-1">Du'a en entrant au Masjid</h4>
                <p className="text-xs text-[#7A6D5A] mb-4">À réciter en posant le pied droit.</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#FAF3E0] rounded-full"><div className="h-full bg-[#C9A84C] w-0 rounded-full group-hover:w-full transition-all duration-1000"></div></div>
                  <span className="text-[10px] font-bold text-[#7A6D5A]">Non lu</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* COL DROITE - 1 SPAN */}
        <div className="space-y-8">
          
          {/* MESSAGES */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-[#1A1209]">Derniers messages</h2>
              <Link href="/espace/messages" className="text-[10px] font-bold text-[#8B6914] uppercase tracking-wider hover:underline">Tout voir</Link>
            </div>
            
            <div className="bg-white border border-[#E8DFC8] rounded-2xl p-1 shadow-sm">
              <Link href="/espace/messages/1" className="flex items-center gap-4 p-4 hover:bg-[#FAF7F0] rounded-xl transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F0D897] to-[#C9A84C] flex items-center justify-center font-serif text-lg font-bold text-[#1A1209]">رم</div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1D5C3A] border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-[#1A1209] text-sm truncate">Cheikh Rachid</span>
                    <span className="text-xs text-[#7A6D5A]">09:42</span>
                  </div>
                  <p className="text-xs text-[#7A6D5A] truncate">Wa aleykoum salam, oui bien sûr, je prévois un siège auto pour le petit.</p>
                </div>
              </Link>
              
              <div className="h-[1px] bg-[#E8DFC8] mx-4"></div>
              
              <Link href="/espace/messages/2" className="flex items-center gap-4 p-4 hover:bg-[#FAF7F0] rounded-xl transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border border-[#E8DFC8] bg-white flex items-center justify-center text-xl">🔔</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-[#1A1209] text-sm truncate">L'équipe Safaruna</span>
                    <span className="text-xs text-[#7A6D5A]">Hier</span>
                  </div>
                  <p className="text-xs text-[#7A6D5A] font-semibold truncate text-[#1A4A8A]">Votre reçu de paiement est disponible.</p>
                </div>
              </Link>
            </div>
          </section>

          {/* CHECKLIST MINI */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-[#1A1209]">Préparation</h2>
              <span className="text-xs font-bold text-[#1D5C3A] px-2 py-0.5 bg-[#E8F5EE] rounded">6/12</span>
            </div>
            <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-sm space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#C9A84C]" defaultChecked />
                <span className="text-sm text-[#7A6D5A] line-through">Demander le visa électronique (eVisa)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#C9A84C]" />
                <span className="text-sm font-medium text-[#1A1209] group-hover:text-[#C9A84C] transition-colors">Acheter l'Ihram (2 pièces)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#C9A84C]" />
                <span className="text-sm font-medium text-[#1A1209] group-hover:text-[#C9A84C] transition-colors">Couper ses ongles & Tondre/raser</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#C9A84C]" />
                <span className="text-sm font-medium text-[#1A1209] group-hover:text-[#C9A84C] transition-colors">Résilier/régler ses dettes avant départ</span>
              </label>
              <Link href="/espace/checklist" className="block text-center text-xs font-bold text-[#8B6914] mt-2 pt-2 border-t border-[#E8DFC8] hover:underline">
                Voir toute la checklist
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
