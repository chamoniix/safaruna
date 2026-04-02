'use client';

import Link from 'next/link';

export default function PelerinMessageThread({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white border border-[#E8DFC8] rounded-2xl shadow-sm overflow-hidden">
      
      {/* THREAD HEADER */}
      <div className="bg-[#FAF7F0] border-b border-[#E8DFC8] p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/espace/messages" className="w-8 h-8 rounded-full border border-[#E8DFC8] bg-white flex items-center justify-center text-[#7A6D5A] hover:bg-[#FAF3E0] transition-colors">
            ←
          </Link>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold text-[#1A1209] shrink-0 bg-gradient-to-br from-[#F0D897] to-[#C9A84C] relative border border-[#C9A84C]">
            رم
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1D5C3A] border-2 border-white"></div>
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#1A1209] leading-none mb-1">Cheikh Rachid Al-Madani</h2>
            <div className="text-xs text-[#1D5C3A] font-bold">En ligne</div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-[10px] text-[#7A6D5A] uppercase tracking-widest font-bold mb-1">Mission liée</div>
          <Link href="/espace/reservations/SAF-2025-012" className="text-sm font-bold text-[#8B6914] bg-[#FAF3E0] px-3 py-1 rounded-lg border border-[#F0D897] hover:bg-[#F0D897] transition-colors">
            SAF-2025-012 (Omra & Histoire)
          </Link>
        </div>
      </div>

      {/* ANTI BYPASS WARNING */}
      <div className="bg-gradient-to-r from-[#1A1209] to-[#3D2A10] p-4 shadow-inner border-y border-[#C9A84C]/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(201,168,76,0.15)_0%,transparent_60%)] pointer-events-none"></div>
        <p className="relative z-10 text-xs text-white/80 leading-relaxed text-center max-w-2xl mx-auto">
          ⚠️ Pour votre sécurité et dans le respect de la charte SAFARUMA, <strong className="text-[#C9A84C]">toutes les transactions doivent passer par la plateforme.</strong> Tout accord direct est contraire à nos CGU et à l'éthique islamique. Allah est témoin de nos engagements.
        </p>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#FDFBF7] space-y-6 flex flex-col">
        
        {/* MESSAGE SYSTEM / DATE */}
        <div className="text-center">
          <span className="bg-[#E8DFC8]/50 text-[#7A6D5A] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Aujourd'hui
          </span>
        </div>

        {/* MESSAGE RECEIVED (Guide) */}
        <div className="flex items-start gap-4 max-w-[80%]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold text-[#1A1209] shrink-0 bg-gradient-to-br from-[#F0D897] to-[#C9A84C]">رم</div>
          <div>
            <div className="bg-white border border-[#E8DFC8] text-[#1A1209] text-sm p-4 rounded-2xl rounded-tl-sm shadow-sm relative">
              Assalamu alaykum mon frère Karim. J'ai bien reçu votre réservation pour le 10 Juin. Avez-vous déjà choisi votre hôtel à Makkah pour que je puisse organiser le point de rendez-vous ?
            </div>
            <div className="text-[10px] text-[#7A6D5A] mt-1 ml-1 font-medium">09:30</div>
          </div>
        </div>

        {/* MESSAGE SENT (Pèlerin) */}
        <div className="flex items-start gap-4 max-w-[80%] self-end flex-row-reverse">
          <div>
            <div className="bg-[#1A1209] text-[#F0D897] text-sm p-4 rounded-2xl rounded-tr-sm shadow-sm">
              Wa aleykoum salam Cheikh ! Oui, nous serons au Swissôtel Al Maqam. Par contre, j'ai une question : est-ce que vous prévoyez un siège auto car nous avons un enfant de 3 ans avec nous ?
            </div>
            <div className="text-[10px] text-[#7A6D5A] mt-1 mr-1 font-medium text-right flex items-center justify-end gap-1">
              09:35 <span className="text-[#1D5C3A] font-bold text-xs">✓✓</span>
            </div>
          </div>
        </div>

        {/* MESSAGE RECEIVED (Guide) */}
        <div className="flex items-start gap-4 max-w-[80%]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold text-[#1A1209] shrink-0 bg-gradient-to-br from-[#F0D897] to-[#C9A84C]">رم</div>
          <div>
            <div className="bg-white border border-[#E8DFC8] text-[#1A1209] text-sm p-4 rounded-2xl rounded-tl-sm shadow-sm relative">
              Al hamdulillah. Oui bien sûr, je prévois un siège auto pour le petit. Je viendrai vous chercher directement à la réception de l'hôtel après la prière du Asr insh'Allah.
            </div>
            <div className="text-[10px] text-[#7A6D5A] mt-1 ml-1 font-medium">09:42</div>
          </div>
        </div>

      </div>

      {/* INPUT AREA */}
      <div className="bg-white border-t border-[#E8DFC8] p-4 sm:p-5">
        <form className="flex gap-3 items-end" onSubmit={(e) => e.preventDefault()}>
          <button type="button" className="p-3 text-[#7A6D5A] hover:text-[#C9A84C] hover:bg-[#FAF3E0] rounded-full transition-colors shrink-0">
            📎
          </button>
          <div className="flex-1 bg-[#FDFBF7] border border-[#E8DFC8] rounded-2xl overflow-hidden focus-within:border-[#C9A84C] focus-within:ring-1 focus-within:ring-[#C9A84C] transition-all">
            <textarea 
              className="w-full bg-transparent p-4 text-sm resize-none focus:outline-none placeholder:text-[#7A6D5A]/50"
              rows={1}
              placeholder="Écrivez votre message à Rachid..."
            ></textarea>
          </div>
          <button type="submit" className="p-3.5 bg-[#C9A84C] text-[#1A1209] rounded-xl font-bold shadow-md hover:bg-[#F0D897] hover:shadow-lg transition-all shrink-0">
            Envoyer ✈
          </button>
        </form>
      </div>

    </div>
  );
}