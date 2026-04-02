'use client';

import { useState } from 'react';

export default function DuaTracker() {
  const [activeTab, setActiveTab] = useState('quotidien');

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1209] mb-2">Mon Carnet de Du'a</h1>
          <p className="text-[#7A6D5A]">Suivez vos invocations quotidiennes et apprenez celles du Hajj &amp; de la Omra.</p>
        </div>
        
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 flex items-center gap-6 shadow-[0_2px_10px_rgba(26,18,9,0.02)]">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#A93226] mb-1">Série actuelle</div>
            <div className="font-serif text-2xl font-bold text-[#1A1209] flex items-center gap-2">
              <span className="text-[#C9A84C]">🔥</span> 12 jours
            </div>
          </div>
          <div className="w-[1px] h-10 bg-[#FAF3E0]"></div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#1D5C3A] mb-1">Du'a mémorisées</div>
            <div className="font-serif text-2xl font-bold text-[#1A1209]">
              4 / 15
            </div>
          </div>
        </div>
      </div>

      {/* TABS — pill style */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {([
          { key: 'quotidien', label: 'Dhikr & Quotidien' },
          { key: 'omra',      label: 'Spécifiques de Omra', badge: 'Essentiel' },
          { key: 'favoris',   label: 'Mes Favoris' },
        ] as { key: string; label: string; badge?: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1.2rem', borderRadius: 50, fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              background: activeTab === t.key ? '#1A1209' : 'white',
              color: activeTab === t.key ? '#F0D897' : '#7A6D5A',
              border: `1px solid ${activeTab === t.key ? '#1A1209' : '#EDE8DC'}`,
            }}
          >
            {t.label}
            {t.badge && (
              <span style={{ background: activeTab === t.key ? 'rgba(201,168,76,0.25)' : '#FAF3E0', color: activeTab === t.key ? '#F0D897' : '#8B6914', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 50 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* DUA LIST */}
      <div className="space-y-6">
        
        <DuaCard 
          title="Invocation en entrant à la mosquée"
          arabic="بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ"
          phonetic="Bismillahi was-salatu was-salamu 'ala rasulillahi, Allahumma-ftah li abwaba rahmatik."
          translation="Au nom d'Allah, que la prière et le salut soient sur le Messager d'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde."
          audioDuration="0:15"
          learned={true}
        />

        <DuaCard 
          title="Talbiyah (En entrant en état d'Ihram)"
          arabic="لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ"
          phonetic="Labbayk, Allahumma labbayk, labbayk la sharika laka labbayk. Innal-hamda wan-ni'mata laka wal-mulk, la sharika lak."
          translation="Me voici, Ô Allah, me voici. Me voici, Tu n'as pas d'associé, me voici. En vérité la louange et la grâce T'appartiennent, ainsi que la royauté. Tu n'as pas d'associé."
          audioDuration="0:24"
          important={true}
        />

        <DuaCard 
          title="Invocation entre le coin Yéménite et la Pierre Noire"
          arabic="رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ"
          phonetic="Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar."
          translation="Seigneur, accorde-nous le bien en ce monde et le bien dans l'au-delà, et protège-nous du châtiment du Feu."
          source="Sourate Al-Baqarah (2:201)"
          audioDuration="0:12"
        />

        <DuaCard 
          title="Invocation sur le mont Safa et Marwa"
          arabic="إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ... لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
          phonetic="Innas-Safa wal-Marwata min sha'a'irillah... La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir."
          translation="Certes, As-Safa et Al-Marwa sont parmi les lieux sacrés d'Allah... Il n'y a de divinité digne d'adoration qu'Allah Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est Omnipotent."
          audioDuration="0:45"
        />

      </div>
    </>
  );
}

function DuaCard({ title, arabic, phonetic, translation, source, audioDuration, important, learned }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(learned);

  return (
    <div className={`bg-white border rounded-2xl p-6 md:p-8 transition-colors ${important ? 'border-[#C9A84C] shadow-[0_4px_20px_rgba(201,168,76,0.1)]' : 'border-[#E8DFC8] shadow-sm hover:border-[#C9A84C]'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          {important && <div className="text-[10px] font-bold tracking-widest uppercase text-[#8B6914] bg-[#FAF3E0] px-2 py-1 rounded-md inline-block mb-3">Obligatoire</div>}
          <h3 className="font-serif text-xl md:text-2xl text-[#1A1209] font-bold">{title}</h3>
          {source && <p className="text-xs font-bold text-[#7A6D5A] mt-2 uppercase tracking-wide">{source}</p>}
        </div>
        <button 
          onClick={() => setIsSaved(!isSaved)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${isSaved ? 'bg-[#E8F5EE] text-[#1D5C3A] border border-[#1D5C3A]/20' : 'bg-white border border-[#E8DFC8] text-[#7A6D5A] hover:bg-[#FAF7F0]'}`}
        >
          {isSaved ? '✓' : '🔖'}
        </button>
      </div>

      {/* ARABIC TEXT */}
      <div className="mb-6 text-right">
        <p className="font-serif text-3xl md:text-4xl text-[#1A1209] leading-loose text-right" style={{ direction: 'rtl' }} dir="rtl">
          {arabic}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#7A6D5A] mb-1">Translittération</div>
          <p className="text-sm md:text-base text-[#1A1209] italic font-medium">{phonetic}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#7A6D5A] mb-1">Traduction</div>
          <p className="text-sm md:text-base text-[#1A1209]">{translation}</p>
        </div>
      </div>

      {/* AUDIO PLAYER — dark premium */}
      <div style={{ background: '#1A1209', borderRadius: 14, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ width: 40, height: 40, background: isPlaying ? '#C9A84C' : 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: isPlaying ? '#1A1209' : '#C9A84C', fontSize: '0.85rem', transition: 'all 0.15s' }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'rgba(240,216,151,0.5)', flexShrink: 0 }}>{isPlaying ? '0:03' : '0:00'}</span>
          <div style={{ flex: 1, height: 32, display: 'flex', alignItems: 'center', gap: 2 }}>
            {Array.from({length: 40}).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 3, borderRadius: 2,
                  height: `${Math.max(20, (Math.sin(i * 0.4) + 1) * 40 + 15)}%`,
                  background: isPlaying && i < 15 ? '#C9A84C' : 'rgba(201,168,76,0.2)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'rgba(240,216,151,0.5)', flexShrink: 0 }}>{audioDuration}</span>
        </div>
      </div>

    </div>
  );
}