'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GuideDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <>
      {/* AVAILABILITY TOGGLE BANNER */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between mb-6 border"
        style={{
          background: isAvailable ? 'rgba(29,92,58,0.08)' : 'rgba(122,109,90,0.08)',
          borderColor: isAvailable ? 'rgba(29,92,58,0.2)' : 'rgba(122,109,90,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: isAvailable ? '#27AE60' : '#aaa',
              boxShadow: isAvailable ? '0 0 0 4px rgba(39,174,96,0.2)' : 'none',
            }}
          ></div>
          <div>
            <div className="text-sm font-bold" style={{ color: isAvailable ? '#1D5C3A' : '#7A6D5A' }}>
              {isAvailable ? 'Vous êtes disponible' : 'Vous êtes indisponible'}
            </div>
            <div className="text-xs" style={{ color: isAvailable ? 'rgba(29,92,58,0.7)' : 'rgba(122,109,90,0.7)' }}>
              {isAvailable
                ? 'Les pèlerins peuvent vous contacter et réserver.'
                : 'Votre profil est masqué dans les résultats de recherche.'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAvailable(!isAvailable)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
          style={{
            background: isAvailable ? '#1D5C3A' : '#1A1209',
            color: isAvailable ? 'white' : '#F0D897',
          }}
        >
          <div
            style={{
              width: 32,
              height: 16,
              borderRadius: 50,
              background: isAvailable ? 'rgba(255,255,255,0.3)' : 'rgba(240,216,151,0.3)',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'white',
                transition: 'left 0.2s',
                left: isAvailable ? 18 : 3,
              }}
            ></div>
          </div>
          {isAvailable ? 'Passer indisponible' : 'Passer disponible'}
        </button>
      </div>

      {/* EARNINGS BANNER */}
      <div className="bg-[var(--deep)] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 right-12 md:right-48 font-serif text-8xl md:text-[140px] text-[var(--gold)]/10 font-bold select-none pointer-events-none" style={{ direction: 'rtl' }}>رزق</div>

        <div className="relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">Bonjour, <em className="text-[var(--gold)] italic">Cheikh Rachid</em> 🌙</h2>
          <p className="text-white/40 text-sm">Voici vos revenus et performances ce mois-ci.</p>
        </div>

        <div className="relative z-10 md:text-right">
          <div className="font-serif text-5xl md:text-6xl font-semibold text-[var(--gold-light)] leading-none mb-2">3 840 €</div>
          <div className="text-white/40 text-xs mb-2">Revenus · Avril 2026</div>
          <div className="inline-flex items-center gap-1.5 bg-[#1D5C3A]/40 text-[#6EC68A] text-xs font-bold px-3 py-1 rounded-full">
            ↑ +24% vs mars
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <KPICard icon="📥" value="3" label="Nouvelles demandes" trend="↑ À traiter" trendUp />
        <KPICard icon="✅" value="8" label="Missions ce mois" trend="↑ +3 vs mars" trendUp />
        <KPICard icon="⭐" value="4.97" label="Note moyenne" trend="↑ Stable" trendUp />
        <KPICard icon="⚡" value="1h 20" label="Temps de réponse" trend="↑ Excellent" trendUp />
        <KPICard icon="🔄" value="68%" label="Taux de retour" trend="↑ +8%" trendUp />
      </div>

      {/* PROCHAINE MISSION ET NOUVELLES DEMANDES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROCHAINE MISSION */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl">Prochaine mission confirmée</h2>
              <Link href="/guide/missions" className="text-xs font-bold text-[var(--gold-dark)] hover:underline">Toutes les missions →</Link>
            </div>
            
            <div className="bg-[var(--deep)] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(201,168,76,0.12)_0%,transparent_60%)] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]/60 mb-1">Mission confirmée</div>
                  <h3 className="font-serif text-2xl mb-1">Forfait Omra & Histoire · 5 jours</h3>
                  <div className="text-xs text-white/45">📅 10 juin 2025 · Makkah + Madinah</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-4xl font-semibold text-[var(--gold-light)] leading-none">47</div>
                  <div className="text-[10px] text-white/35">jours restants</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 mb-4 relative z-10 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[var(--gold-pale)] flex items-center justify-center font-bold text-[var(--deep)] text-sm shrink-0">KL</div>
                <div>
                  <div className="font-semibold text-sm">Karim Lamrani</div>
                  <div className="text-xs text-white/40">🇫🇷 Lyon · 2 personnes · Français</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                <span className="text-[10px] bg-white/10 text-white/60 px-2.5 py-1 rounded-md">🚗 Voiture 7 places</span>
                <span className="text-[10px] bg-white/10 text-white/60 px-2.5 py-1 rounded-md">🚄 Train Haramain</span>
                <span className="text-[10px] bg-white/10 text-white/60 px-2.5 py-1 rounded-md">⛰️ Jabal Uhud</span>
                <span className="text-[10px] bg-white/10 text-white/60 px-2.5 py-1 rounded-md">📖 Livret du'a</span>
              </div>

              <div className="flex gap-3 relative z-10">
                <button className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--gold)] text-[var(--deep)] hover:bg-[var(--gold-light)] transition-colors">💬 Contacter Karim</button>
                <button className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-white/70 hover:bg-white/20 transition-colors">📋 Détails complets</button>
              </div>
            </div>
          </section>

          {/* NOUVELLES DEMANDES */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl flex items-center gap-2">Nouvelles demandes <span className="bg-[var(--red-bg)] text-[var(--red)] text-[10px] font-bold px-2 py-0.5 rounded-full">3</span></h2>
              <Link href="/guide/demandes" className="text-xs font-bold text-[var(--gold-dark)] hover:underline">Tout voir →</Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-[var(--sand)] p-4 sm:p-6 space-y-4 shadow-sm">
              <DemandeCard 
                initials="SM" name="Safia Merabet" details="🇧🇪 Bruxelles · 6 personnes · 🇫🇷 Français" 
                status="Nouvelle" statusColor="blue" price="2 520€" commission="2 218€" 
                tags={['📅 12–22 juillet 2025', 'Grand Voyage 10j', '🚌 Van demandé', '👩 Guide femme préféré']}
                urgent
              />
              <DemandeCard 
                initials="OD" name="Omar Diallo" details="🇨🇦 Montréal · Solo · 🇫🇷 Français" 
                status="En attente" statusColor="orange" price="280€" commission="246€" 
                tags={['📅 3–5 août 2025', 'Omra Essentielle 3j', '🚗 Voiture incluse']}
              />
              <DemandeCard 
                initials="AB" name="Aïcha Benali" details="🇫🇷 Marseille · 4 personnes · 🇫🇷 Français + 🇩🇿 Darija" 
                status="Nouvelle" statusColor="blue" price="1 680€" commission="1 478€" 
                tags={['📅 20–24 sept 2025', 'Omra & Histoire 5j', '🚗 Voiture + train']}
              />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* CALENDRIER */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl">Calendrier de juin</h2>
              <Link href="/guide/calendrier" className="text-xs font-bold text-[var(--gold-dark)] hover:underline">Vue complète →</Link>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--sand)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <button className="w-7 h-7 rounded-full border border-[var(--sand)] flex items-center justify-center text-xs hover:bg-[var(--cream)] transition-colors">‹</button>
                <span className="text-sm font-bold">Juin 2025</span>
                <button className="w-7 h-7 rounded-full border border-[var(--sand)] flex items-center justify-center text-xs hover:bg-[var(--cream)] transition-colors">›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['L','M','M','J','V','S','D'].map(d => <div key={d} className="text-[10px] font-bold text-[var(--muted)]">{d}</div>)}
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square flex items-center justify-center text-xs font-medium rounded-md bg-[var(--green-bg)] text-[var(--green)]">1</div>
                {Array.from({length: 8}, (_,i) => <div key={`d1-${i}`} className="aspect-square flex items-center justify-center text-xs font-medium rounded-md bg-[var(--green-bg)] text-[var(--green)]">{i+2}</div>)}
                {Array.from({length: 5}, (_,i) => <div key={`d2-${i}`} className="aspect-square flex items-center justify-center text-xs font-bold rounded-md bg-[var(--deep)] text-[var(--gold-light)]">{i+10}</div>)}
                {Array.from({length: 5}, (_,i) => <div key={`d3-${i}`} className="aspect-square flex items-center justify-center text-xs font-medium rounded-md bg-[var(--green-bg)] text-[var(--green)]">{i+15}</div>)}
                {Array.from({length: 5}, (_,i) => <div key={`d4-${i}`} className="aspect-square flex items-center justify-center text-xs font-bold rounded-md bg-[var(--deep)] text-[var(--gold-light)]">{i+20}</div>)}
                {Array.from({length: 3}, (_,i) => <div key={`d5-${i}`} className="aspect-square flex items-center justify-center text-xs font-medium rounded-md bg-[var(--orange-bg)] text-[var(--orange)]">{i+25}</div>)}
                {Array.from({length: 3}, (_,i) => <div key={`d6-${i}`} className="aspect-square flex items-center justify-center text-xs font-medium rounded-md bg-[var(--green-bg)] text-[var(--green)]">{i+28}</div>)}
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><div className="w-2 h-2 rounded-full bg-[var(--green)]"></div>Disponible</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><div className="w-2 h-2 rounded-full bg-[var(--deep)]"></div>Réservé</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]"><div className="w-2 h-2 rounded-full bg-[var(--orange)]"></div>En attente</div>
              </div>
            </div>
          </section>

          {/* PERFORMANCES */}
          <section>
            <h2 className="font-serif text-xl mb-4">Mes performances</h2>
            <div className="bg-white rounded-2xl border border-[var(--sand)] p-5 shadow-sm space-y-4">
              <PerfBar label="Taux d'acceptation" val="94%" color="green" pct={94} />
              <PerfBar label="Satisfaction client" val="4.97" color="green" pct={99} />
              <PerfBar label="Temps de réponse" val="1h20" color="gold" pct={90} />
              <PerfBar label="Taux de complétion" val="100%" color="green" pct={100} />
              <PerfBar label="Taux de fidélisation" val="68%" color="blue" pct={68} />
            </div>
          </section>

           {/* COMPLETUDE PROFIL */}
           <section>
            <h2 className="font-serif text-xl mb-4">Complétude du profil</h2>
            <div className="bg-white rounded-2xl border border-[var(--sand)] p-5 shadow-sm">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--sand)" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--gold)" strokeWidth="6" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - 0.84)} strokeLinecap="round" />
                  </svg>
                  <span className="font-serif font-bold text-[var(--deep)]">84%</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--deep)] mb-1">Profil à 84%</h4>
                  <p className="text-[10px] text-[var(--muted)] leading-relaxed">Complétez pour apparaître en tête des recherches et recevoir 2× plus de demandes.</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-[var(--orange)] bg-[var(--orange-bg)] p-2 px-3 rounded-lg cursor-pointer hover:brightness-95 transition-all">
                  <span>📹</span> Ajouter une vidéo de présentation (+15% de réservations)
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--orange)] bg-[var(--orange-bg)] p-2 px-3 rounded-lg cursor-pointer hover:brightness-95 transition-all">
                  <span>🏅</span> Uploader votre diplôme islamique
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

// Subcomponents

function KPICard({ icon, value, label, trend, trendUp }: any) {
  return (
    <div className="bg-white border border-[var(--sand)] rounded-2xl p-4 sm:p-5 text-center shadow-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-serif text-3xl font-semibold text-[var(--deep)] leading-none mb-1.5">{value}</div>
      <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-bold mb-1">{label}</div>
      <div className={`text-[10px] font-semibold ${trendUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{trend}</div>
    </div>
  )
}

function DemandeCard({ initials, name, details, status, statusColor, price, commission, tags, urgent }: any) {
  return (
    <div className={`border rounded-xl p-4 sm:p-5 transition-colors ${urgent ? 'border-[var(--orange)] bg-[#FEF0E6]' : 'border-[var(--sand)] hover:border-[var(--gold)]'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold text-[var(--deep)] shrink-0 bg-gradient-to-br from-[#F0D897] to-[#C9A84C]">{initials}</div>
          <div>
            <div className="text-sm font-bold text-[var(--deep)]">{name}</div>
            <div className="text-[10px] text-[var(--muted)]">{details}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${statusColor === 'blue' ? 'bg-[var(--blue-bg)] text-[var(--blue)]' : 'bg-[var(--orange-bg)] text-[var(--orange)]'}`}>
            {statusColor === 'blue' ? '🔴 ' : '⏳ '}{status}
          </div>
          <div className="font-serif text-lg font-semibold text-[var(--deep)] leading-none">{price}</div>
          <div className="text-[10px] text-[var(--muted)]">Votre part : {commission}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((t: string) => <span key={t} className="text-[10px] bg-white/50 border border-[var(--sand)]/50 text-[var(--muted)] px-2 py-0.5 rounded-md">{t}</span>)}
      </div>
      <div className="flex gap-2">
        <button className="bg-[var(--green)] hover:bg-[#184d30] text-white text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors">✓ Accepter</button>
        <button className="bg-[var(--blue-bg)] hover:bg-[var(--blue)] hover:text-white text-[var(--blue)] text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors">💬 Message</button>
        <button className="bg-transparent border border-[var(--sand)] text-[var(--muted)] hover:border-[var(--red)] hover:text-[var(--red)] text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors">Décliner</button>
      </div>
    </div>
  )
}

function PerfBar({ label, val, color, pct }: any) {
  let bg = 'bg-[var(--gold)]';
  if (color === 'green') bg = 'bg-[var(--green)]';
  if (color === 'blue') bg = 'bg-[#1A4A8A]';

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[var(--muted)] w-32 shrink-0">{label}</span>
      <div className="flex-1 mx-3 h-1.5 bg-[var(--sand)] rounded-full overflow-hidden">
        <div className={`h-full ${bg} rounded-full`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="text-xs font-bold text-[var(--deep)] w-8 text-right shrink-0">{val}</span>
    </div>
  )
}
