'use client';

import { useState } from 'react';

const DUAS = [
  {
    id: 1,
    cat: 'omra',
    important: true,
    title: "Talbiyah — En entrant en état d'Ihram",
    arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
    phonetic: "Labbayk, Allahumma labbayk, labbayk la sharika laka labbayk. Innal-hamda wan-ni'mata laka wal-mulk, la sharika lak.",
    translation: "Me voici, Ô Allah, me voici. Me voici, Tu n'as pas d'associé, me voici. En vérité la louange et la grâce T'appartiennent, ainsi que la royauté. Tu n'as pas d'associé.",
    duration: '0:24',
    learned: false,
  },
  {
    id: 2,
    cat: 'omra',
    important: false,
    title: "En entrant à la Mosquée Al-Haram",
    arabic: "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    phonetic: "Bismillahi was-salatu was-salamu 'ala rasulillahi, Allahumma-ftah li abwaba rahmatik.",
    translation: "Au nom d'Allah, que la prière et le salut soient sur le Messager d'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde.",
    duration: '0:15',
    learned: true,
  },
  {
    id: 3,
    cat: 'omra',
    important: false,
    title: "Entre le coin Yéménite et la Pierre Noire",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    phonetic: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    translation: "Seigneur, accorde-nous le bien en ce monde et le bien dans l'au-delà, et protège-nous du châtiment du Feu.",
    source: "Sourate Al-Baqarah (2:201)",
    duration: '0:12',
    learned: false,
  },
  {
    id: 4,
    cat: 'omra',
    important: false,
    title: "Sur le mont Safa et Marwa",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    phonetic: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir.",
    translation: "Il n'y a de divinité digne d'adoration qu'Allah Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est Omnipotent.",
    duration: '0:45',
    learned: false,
  },
  {
    id: 5,
    cat: 'quotidien',
    important: false,
    title: "Le matin — Awaker avec gratitude",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    phonetic: "Alhamdu lillahi-lladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
    translation: "Louange à Allah qui nous a redonné vie après nous avoir fait mourir, et c'est vers Lui que sera la résurrection.",
    duration: '0:10',
    learned: true,
  },
  {
    id: 6,
    cat: 'quotidien',
    important: false,
    title: "Avant de dormir",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    phonetic: "Bismika Allahumma amutu wa ahya.",
    translation: "En Ton nom, Ô Allah, je meurs et je vis.",
    duration: '0:08',
    learned: false,
  },
];

const TABS = [
  { key: 'tous',      label: 'Toutes' },
  { key: 'omra',     label: "De la Omra", badge: 'Essentiel' },
  { key: 'quotidien', label: 'Quotidiennes' },
  { key: 'favoris',  label: 'Mémorisées' },
];

function DuaCard({ dua, onToggleLearned }: { dua: typeof DUAS[0]; onToggleLearned: (id: number) => void }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{
      background: 'white',
      border: `1.5px solid ${dua.important ? '#C9A84C' : '#EDE8DC'}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: dua.important ? '0 4px 20px rgba(201,168,76,0.1)' : '0 1px 4px rgba(26,18,9,0.04)',
    }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F5F0E8', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {dua.important && (
            <span style={{ display: 'inline-block', background: '#FAF3E0', color: '#8B6914', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.18rem 0.55rem', borderRadius: 50, marginBottom: '0.4rem' }}>
              Obligatoire
            </span>
          )}
          <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.3, margin: 0 }}>{dua.title}</h3>
          {dua.source && <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7A6D5A', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.25rem' }}>{dua.source}</div>}
        </div>
        <button
          onClick={() => onToggleLearned(dua.id)}
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: dua.learned ? '#E8F5EE' : 'white',
            border: `1.5px solid ${dua.learned ? '#1D5C3A' : '#EDE8DC'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '0.75rem', color: dua.learned ? '#1D5C3A' : '#7A6D5A',
            fontWeight: 700, transition: 'all 0.15s',
          }}
          title={dua.learned ? 'Mémorisée' : 'Marquer mémorisée'}
        >
          {dua.learned ? '✓' : '○'}
        </button>
      </div>

      {/* Arabic */}
      <div style={{ padding: '1.25rem', background: '#0D0A06', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', color: '#F0D897', lineHeight: 2, direction: 'rtl', textAlign: 'right', margin: 0 }} dir="rtl">
          {dua.arabic}
        </p>
      </div>

      {/* Phonetic + Translation */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.3rem' }}>Translittération</div>
          <p style={{ fontSize: '0.85rem', color: '#4A3728', fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>{dua.phonetic}</p>
        </div>
        <div>
          <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.3rem' }}>Traduction</div>
          <p style={{ fontSize: '0.85rem', color: '#1A1209', lineHeight: 1.65, margin: 0 }}>{dua.translation}</p>
        </div>
      </div>

      {/* Audio player */}
      <div style={{ margin: '0 1.25rem 1.25rem', background: '#1A1209', borderRadius: 12, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{ width: 36, height: 36, borderRadius: '50%', background: playing ? '#C9A84C' : 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: playing ? '#1A1209' : '#C9A84C', fontSize: '0.82rem', transition: 'all 0.15s' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.62rem', color: 'rgba(240,216,151,0.4)', fontFamily: 'monospace', flexShrink: 0 }}>0:00</span>
          <div style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', gap: '2px' }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} style={{ width: 3, borderRadius: 2, height: `${Math.max(20, (Math.sin(i * 0.5) + 1) * 40 + 10)}%`, background: playing && i < 12 ? '#C9A84C' : 'rgba(201,168,76,0.18)', transition: 'background 0.3s' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.62rem', color: 'rgba(240,216,151,0.4)', fontFamily: 'monospace', flexShrink: 0 }}>{dua.duration}</span>
        </div>
      </div>
    </div>
  );
}

export default function DuaTracker() {
  const [activeTab, setActiveTab] = useState('tous');
  const [duas, setDuas] = useState(DUAS);

  const toggleLearned = (id: number) => {
    setDuas(ds => ds.map(d => d.id === id ? { ...d, learned: !d.learned } : d));
  };

  const filtered = duas.filter(d => {
    if (activeTab === 'tous') return true;
    if (activeTab === 'favoris') return d.learned;
    return d.cat === activeTab;
  });

  const learnedCount = duas.filter(d => d.learned).length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .dua-tab { transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .dua-tab:hover { border-color: #C9A84C !important; }
      `}} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.25rem' }}>
            Mon Carnet de Du&apos;a
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>
            Apprenez et mémorisez les invocations essentielles de la Omra.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, padding: '0.875rem 1.25rem', boxShadow: '0 2px 8px rgba(26,18,9,0.04)', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C0392B', marginBottom: '0.2rem' }}>Série</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>🔥 12j</div>
          </div>
          <div style={{ width: 1, background: '#F0EBD8' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D5C3A', marginBottom: '0.2rem' }}>Mémorisées</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{learnedCount}/{duas.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className="dua-tab"
            onClick={() => setActiveTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 1rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: activeTab === t.key ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', background: activeTab === t.key ? '#1A1209' : 'white', color: activeTab === t.key ? '#F0D897' : '#7A6D5A', border: `1.5px solid ${activeTab === t.key ? '#1A1209' : '#EDE8DC'}` }}
          >
            {t.label}
            {t.badge && <span style={{ background: activeTab === t.key ? 'rgba(201,168,76,0.2)' : '#FAF3E0', color: activeTab === t.key ? '#F0D897' : '#8B6914', fontSize: '0.58rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 50 }}>{t.badge}</span>}
            {t.key === 'favoris' && <span style={{ background: activeTab === t.key ? 'rgba(201,168,76,0.2)' : '#E8F5EE', color: activeTab === t.key ? '#F0D897' : '#1D5C3A', fontSize: '0.58rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 50 }}>{learnedCount}</span>}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#7A6D5A' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤲</div>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', color: '#1A1209', marginBottom: '0.4rem' }}>Aucune du&apos;a mémorisée</div>
          <div style={{ fontSize: '0.82rem' }}>Cliquez sur ○ sur chaque du&apos;a pour la marquer comme mémorisée.</div>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(dua => (
          <DuaCard key={dua.id} dua={dua} onToggleLearned={toggleLearned} />
        ))}
      </div>
    </>
  );
}
