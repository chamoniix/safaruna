import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function MessagesPage() {
  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden font-sans text-[var(--deep)] select-none">
      
      {/* SIDEBAR - CONVERSATIONS */}
      <aside className="w-[340px] bg-white border-r border-[var(--sand)] flex flex-col h-full shrink-0 z-20">
        <div className="p-4 border-b border-[var(--sand)]">
          <div className="flex justify-between items-center mb-4">
            <Link href="/espace/tableau-de-bord" className="text-sm font-bold text-[var(--muted)] hover:text-[var(--gold-dark)]">← Retour</Link>
            <h2 className="font-serif font-bold text-xl text-[var(--deep)]">Messagerie</h2>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Chercher un guide..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--cream)] border border-[var(--sand)] rounded-xl text-sm focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold-pale)] transition-shadow"
            />
            <span className="absolute left-3.5 top-2.5 text-[var(--muted)]">🔍</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {/* Active Conversation */}
          <Link href="/espace/messages/1" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--cream)] border border-[var(--gold-light)]/50 cursor-pointer">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center font-serif font-bold text-[var(--deep)] shadow-sm">RM</div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--green)] border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className="font-bold text-[var(--deep)] text-sm truncate">Rachid Al-Madani</h4>
                <span className="text-xs font-semibold text-[var(--deep)]">10:42</span>
              </div>
              <p className="text-sm font-semibold text-[var(--deep)] truncate">As-salamu alaykum mon frère...</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] shrink-0"></div>
          </Link>

          {/* Past Conversation */}
          <Link href="/espace/messages/2" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--cream)] cursor-pointer mt-1 transition-colors">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-[var(--sand)] flex items-center justify-center font-serif font-bold text-[var(--deep)] shadow-sm">FA</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className="font-bold text-[var(--deep)] text-sm truncate">Fatima Al-Omari</h4>
                <span className="text-xs text-[var(--muted)]">Hier</span>
              </div>
              <p className="text-sm text-[var(--muted)] truncate">BarakAllahu fikum pour votre confian...</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full bg-[#f9f8f5] relative">
        
        {/* CHAT HEADER */}
        <header className="bg-white/90 backdrop-blur px-6 py-4 border-b border-[var(--sand)] flex justify-between items-center shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center font-serif font-bold text-[var(--deep)] relative shadow-sm">
              RM
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--green)] border border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-[var(--deep)]">Rachid Al-Madani</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--green)] font-semibold">En ligne</span>
                <span className="text-[10px] text-[var(--muted)]">• Makkah</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-[var(--deep)] hover:bg-[var(--cream)] rounded-lg transition-colors" title="Voir réservation">📄</button>
            <Link href="/guides/1" className="p-2 text-[var(--deep)] hover:bg-[var(--cream)] rounded-lg transition-colors border border-[var(--sand)] text-sm font-semibold">Profil</Link>
          </div>
        </header>

        {/* MESSAGES CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-32">
          
          {/* ANTI-CONTOURNEMENT MESSAGE - MANDATORY */}
          <div className="max-w-xl mx-auto mb-8 bg-gradient-to-r from-[var(--deep)] to-[#2D1F08] p-4 rounded-2xl border border-[var(--gold-dark)] shadow-md flex items-start gap-3">
             <span className="text-2xl mt-1">⚠️</span>
             <div>
               <p className="text-white text-sm leading-relaxed">
                 Pour votre sécurité et dans le respect de la charte SAFARUNA, <strong className="text-[var(--gold-light)]">toutes les transactions doivent passer par la plateforme.</strong> Tout accord direct est contraire à nos CGU et à l'éthique islamique. Allah est témoin de nos engagements.
               </p>
             </div>
          </div>

          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <div className="text-center text-xs font-bold text-[var(--muted)] uppercase tracking-widest my-4">Aujourd'hui</div>
            
            <div className="flex justify-end mb-2">
              <div className="max-w-[75%] bg-[var(--gold-pale)] text-[var(--deep)] p-4 rounded-2xl rounded-tr-sm shadow-sm border border-[var(--sand)]">
                <p className="text-sm">As-salamu alaykum. J'ai bien reçu votre demande de réservation, je suis disponible à ces dates insha'Allah !</p>
                <div className="text-[10px] text-[var(--muted)] mt-1.5 text-right font-semibold">10:15</div>
              </div>
            </div>

            <div className="flex justify-start mb-2">
               <div className="w-8 h-8 rounded-full bg-[var(--sand)] flex items-center justify-center font-serif font-bold text-[var(--deep)] text-xs shrink-0 self-end mb-1 mr-2 opacity-80">KL</div>
               <div className="max-w-[75%] bg-white text-[var(--deep)] p-4 rounded-2xl rounded-tl-sm shadow-sm border border-[var(--sand)]">
                <p className="text-sm">Wa alaykum as-salam. Al Hamdulillah, c'est parfait. Pouvez-vous me confirmer que vous pourrez venir nous chercher à la gare TGV de Makkah ?</p>
                <div className="text-[10px] text-[var(--muted)] mt-1.5 text-left font-semibold">10:23 <span className="text-[var(--blue)]">✓✓</span></div>
              </div>
            </div>

            <div className="flex justify-end mb-2">
              <div className="max-w-[75%] bg-[var(--gold-pale)] text-[var(--deep)] p-4 rounded-2xl rounded-tr-sm shadow-sm border border-[var(--sand)]">
                <p className="text-sm">Oui bien sûr, mon option "Transport Privé" inclut le trajet depuis la gare Haramain jusqu'à votre hôtel, puis la visite de tous les sites prévus dans le forfait.</p>
                <div className="text-[10px] text-[var(--muted)] mt-1.5 text-right font-semibold">10:38</div>
              </div>
            </div>

            <div className="flex justify-end mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-[75%] bg-[var(--gold-pale)] text-[var(--deep)] p-4 rounded-2xl rounded-tr-sm shadow-sm border border-[var(--sand)] border-l-4 border-l-[var(--gold)]">
                <p className="text-sm font-semibold">As-salamu alaykum mon frère, avez-vous pu confirmer vos dates de vol ?</p>
                <div className="text-[10px] text-[var(--muted)] mt-1.5 text-right font-semibold">10:42</div>
              </div>
            </div>
            
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-white px-4 py-4 md:px-6 md:py-5 border-t border-[var(--sand)] absolute bottom-0 left-0 right-0">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <button className="p-3 text-[var(--muted)] hover:text-[var(--gold-dark)] hover:bg-[var(--gold-pale)] rounded-xl transition-colors shrink-0">
               📎
            </button>
            <div className="flex-1 relative">
              <textarea 
                className="w-full bg-[var(--cream)] border border-[var(--sand)] rounded-2xl px-5 py-3.5 pr-12 text-sm focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold-pale)] resize-none"
                placeholder="Écrivez un message respectueux..."
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
              ></textarea>
            </div>
            <button className="px-5 py-3.5 bg-[var(--deep)] text-[var(--gold-light)] font-bold rounded-xl hover:bg-[var(--warm)] transition-colors shrink-0 shadow-md">
              Envoyer
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}