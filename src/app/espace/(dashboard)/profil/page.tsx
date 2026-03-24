'use client';

export default function PelerinProfile() {
  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1209] mb-2">Mon Profil Pèlerin</h1>
          <p className="text-[#7A6D5A]">Gérez vos informations et découvrez vos badges spirituels.</p>
        </div>
        <button className="bg-[#1A1209] text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:bg-[#2D1F08] transition-all w-max md:w-auto">
          Enregistrer les modifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GAMIFICATION OVERVIEW */}
        <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
          
          <div className="bg-gradient-to-br from-[#1A1209] to-[#2D1F08] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-[#C9A84C]/30 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C9A84C]/20 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border border-[#C9A84C]/30 flex items-center justify-center font-serif text-3xl font-bold text-[#F0D897] mb-4 shadow-[0_0_30px_rgba(201,168,76,0.2)]">
                KL
              </div>
              <h2 className="font-serif text-2xl font-bold mb-1">Karim Lamrani</h2>
              <div className="text-[10px] text-[#C9A84C] tracking-[0.2em] uppercase font-bold mb-6">Voyageur Spirituel</div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-4">
                <div className="text-left">
                  <div className="text-[10px] uppercase text-white/50 tracking-wider">Niveau</div>
                  <div className="font-bold text-xl text-[#F0D897]">3</div>
                </div>
                <div className="w-[1px] h-8 bg-white/10"></div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-white/50 tracking-wider">Points Noor</div>
                  <div className="font-bold text-xl flex items-center gap-1 justify-end">
                    <span className="text-[#C9A84C]">✨</span> 1,450
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between text-[10px] font-bold text-white/50 mb-1.5 uppercase tracking-wider">
                  <span>Progression (Niveau 4)</span>
                  <span>50 pts manquants</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#C9A84C] to-[#F0D897] w-[95%] rounded-full shadow-[0_0_10px_rgba(201,168,76,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-sm">
            <h3 className="font-serif text-xl border-b border-[#FAF3E0] pb-4 mb-6 text-[#1A1209]">Mes Badges</h3>
            <div className="grid grid-cols-3 gap-4">
              <Badge icon="🎓" name="Étudiant Assidu" desc="3 modules complétés" unlocked />
              <Badge icon="🤲" name="Dhikr Master" desc="7 jours de du'a" unlocked />
              <Badge icon="✈️" name="Prêt au départ" desc="Checklist 100%" />
              <Badge icon="🕌" name="Tawaaf" desc="Omra validée" />
              <Badge icon="📖" name="Sīrah" desc="Histoire validée" />
              <Badge icon="🕋" name="Hajji" desc="Hajj accompli" />
            </div>
          </div>

        </div>

        {/* PROFILE SETTINGS FORM */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8DFC8] shadow-sm">
            <h3 className="font-serif text-xl border-b border-[#FAF3E0] pb-4 mb-6 text-[#1A1209]">Informations Personnelles</h3>
            <form className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#7A6D5A] uppercase tracking-wider mb-2">Prénom</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" defaultValue="Karim" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7A6D5A] uppercase tracking-wider mb-2">Nom</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" defaultValue="Lamrani" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A6D5A] uppercase tracking-wider mb-2">Email de contact</label>
                <div className="relative">
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FAF3E0]/30 text-[#4A4A4A] outline-none cursor-not-allowed" defaultValue="karim.lamrani@example.com" disabled />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1D5C3A] bg-[#E8F5EE] px-2 py-0.5 rounded">Vérifié</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#7A6D5A] uppercase tracking-wider mb-2">Ville de résidence</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" defaultValue="Lyon, France" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7A6D5A] uppercase tracking-wider mb-2">Téléphone (WhatsApp)</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" defaultValue="+33 6 12 34 56 78" />
                </div>
              </div>

              <div className="pt-6 border-t border-[#FAF3E0]">
                <h3 className="font-serif text-xl border-b border-[#FAF3E0] pb-4 mb-6 text-[#1A1209]">Préférences de Voyage</h3>
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 border border-[#E8DFC8] rounded-xl cursor-pointer hover:border-[#C9A84C] transition-colors">
                    <input type="checkbox" className="mt-1 w-5 h-5 accent-[#C9A84C]" defaultChecked />
                    <div>
                      <div className="font-bold text-[#1A1209] text-sm">Mobilité Réduite (PMR)</div>
                      <div className="text-xs text-[#7A6D5A] mt-1">Nécessite une assistance en fauteuil roulant localement ou lors du Tawaaf.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-4 p-4 border border-[#E8DFC8] rounded-xl cursor-pointer hover:border-[#C9A84C] transition-colors">
                    <input type="checkbox" className="mt-1 w-5 h-5 accent-[#C9A84C]" />
                    <div>
                      <div className="font-bold text-[#1A1209] text-sm">Régime Alimentaire Spécial</div>
                      <div className="text-xs text-[#7A6D5A] mt-1">Diabétique, Sans gluten, Allergies sévères.</div>
                    </div>
                  </label>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#7A6D5A] uppercase tracking-wider mb-2">Langues préférées pour un guide</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#FAF3E0] text-[#8B6914] border border-[#C9A84C]/30 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer">Français</span>
                      <span className="bg-[#FAF3E0] text-[#8B6914] border border-[#C9A84C]/30 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer">Arabe</span>
                      <span className="bg-[#FDFBF7] text-[#7A6D5A] border border-[#E8DFC8] px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:border-[#C9A84C]">Anglais</span>
                      <span className="bg-[#FDFBF7] text-[#7A6D5A] border border-[#E8DFC8] px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:border-[#C9A84C]">Darija</span>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}

function Badge({ icon, name, desc, unlocked }: any) {
  return (
    <div className={`flex flex-col items-center text-center group ${unlocked ? 'cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 transition-transform ${unlocked ? 'bg-[#FAF3E0] border-2 border-[#C9A84C] shadow-[0_4px_10px_rgba(201,168,76,0.3)] group-hover:scale-110 group-hover:-translate-y-1' : 'bg-[#FDFBF7] border border-[#E8DFC8]'}`}>
        {icon}
      </div>
      <div className="text-[10px] font-bold text-[#1A1209] leading-tight mb-0.5">{name}</div>
      <div className="text-[8px] text-[#7A6D5A]">{desc}</div>
    </div>
  )
}