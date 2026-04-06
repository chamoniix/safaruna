'use client';

import { useState } from 'react';
import Link from 'next/link';

const CONVERSATIONS = [
  {
    id: '1',
    name: 'Rachid Al-Madani',
    initials: 'RM',
    role: 'Guide · Makkah & Madinah',
    online: true,
    unread: 1,
    lastMsg: 'As-salamu alaykum mon frère, avez-vous pu confirmer vos dates de vol ?',
    time: '10:42',
    gradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
    color: '#1A1209',
  },
  {
    id: '2',
    name: 'Fatima Al-Omari',
    initials: 'FA',
    role: 'Guide Femme · Makkah',
    online: false,
    unread: 0,
    lastMsg: 'BarakAllahu fikum pour votre confiance, insha\'Allah ce sera un voyage inoubliable.',
    time: 'Hier',
    gradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
    color: 'white',
  },
];

const MESSAGES_DATA = [
  { id: 1, from: 'guide', text: 'As-salamu alaykum. J\'ai bien reçu votre demande de réservation, je suis disponible à ces dates insha\'Allah !', time: '10:15' },
  { id: 2, from: 'me', text: 'Wa alaykum as-salam. Al Hamdulillah, c\'est parfait. Pouvez-vous me confirmer que vous pourrez venir nous chercher à la gare Haramain ?', time: '10:23' },
  { id: 3, from: 'guide', text: 'Oui bien sûr, mon option "Transport Privé" inclut le trajet depuis la gare Haramain jusqu\'à votre hôtel, puis la visite de tous les sites prévus dans le forfait.', time: '10:38' },
  { id: 4, from: 'guide', text: 'As-salamu alaykum mon frère, avez-vous pu confirmer vos dates de vol ?', time: '10:42', isLast: true },
];

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const conv = CONVERSATIONS.find(c => c.id === activeConv);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .msg-layout {
          display: flex; height: calc(100vh - 120px); min-height: 500px;
          background: white; border-radius: 20px; overflow: hidden;
          border: 1px solid #EDE8DC; box-shadow: 0 2px 12px rgba(26,18,9,0.04);
        }
        .msg-sidebar {
          width: 300px; flex-shrink: 0; border-right: 1px solid #EDE8DC;
          display: flex; flex-direction: column; background: white;
        }
        .msg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #FAF7F0; }
        .msg-conv-item { transition: background 0.12s; cursor: pointer; }
        .msg-conv-item:hover { background: #FAF7F0; }
        .msg-conv-item.active { background: #FDF5E0; }
        .msg-input { resize: none; outline: none; border: none; background: transparent; width: 100%; font-family: inherit; font-size: 0.875rem; color: #1A1209; line-height: 1.5; }
        .msg-input::placeholder { color: rgba(122,109,90,0.5); }
        .msg-send-btn { transition: background 0.15s; }
        .msg-send-btn:hover { background: #2D1F08 !important; }
        @media (max-width: 767px) {
          .msg-layout { height: calc(100vh - 100px); border-radius: 14px; }
          .msg-sidebar { width: 100%; border-right: none; }
          .msg-sidebar.hidden-mobile { display: none; }
          .msg-main.hidden-mobile { display: none; }
          .msg-main { height: 100%; }
        }
        @media (min-width: 768px) {
          .msg-back-btn { display: none !important; }
        }
      `}} />

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: '#1A1209' }}>
          Messagerie
        </h1>
        <span style={{ fontSize: '0.72rem', color: '#7A6D5A', background: '#F0EBD8', padding: '0.25rem 0.75rem', borderRadius: 50, fontWeight: 600 }}>
          {CONVERSATIONS.filter(c => c.unread > 0).length} non lu{CONVERSATIONS.filter(c => c.unread > 0).length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="msg-layout">

        {/* ── SIDEBAR conversations ── */}
        <div className={`msg-sidebar${activeConv ? ' hidden-mobile' : ''}`}>
          {/* Search */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #EDE8DC' }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1209" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Rechercher un guide..."
                style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: 10, border: '1.5px solid #EDE8DC', background: '#FAF7F0', fontSize: '0.82rem', color: '#1A1209', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {CONVERSATIONS.map((c, i) => (
              <div
                key={c.id}
                className={`msg-conv-item${activeConv === c.id ? ' active' : ''}`}
                onClick={() => setActiveConv(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderBottom: i < CONVERSATIONS.length - 1 ? '1px solid #F5F0E8' : 'none' }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: c.color, fontSize: '0.95rem' }}>
                    {c.initials}
                  </div>
                  {c.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#1D9E75', border: '2px solid white' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{c.name}</span>
                    <span style={{ fontSize: '0.65rem', color: c.unread > 0 ? '#8B6914' : '#7A6D5A', fontWeight: c.unread > 0 ? 700 : 400 }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: c.unread > 0 ? '#1A1209' : '#7A6D5A', fontWeight: c.unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.lastMsg}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 800, color: '#1A1209', flexShrink: 0 }}>
                    {c.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN chat ── */}
        <div className={`msg-main${!activeConv ? ' hidden-mobile' : ''}`}>
          {!activeConv ? (
            // Placeholder desktop
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#7A6D5A', gap: '0.75rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0EBD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#1A1209' }}>Sélectionnez une conversation</div>
              <div style={{ fontSize: '0.8rem' }}>Choisissez un guide dans la liste à gauche</div>
            </div>
          ) : conv ? (
            <>
              {/* Chat header */}
              <div style={{ padding: '0.875rem 1.25rem', background: 'white', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <button
                  className="msg-back-btn"
                  onClick={() => setActiveConv(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.2rem', padding: '0.25rem', marginRight: '0.25rem' }}
                >
                  ←
                </button>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: conv.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: conv.color, fontSize: '0.88rem' }}>
                    {conv.initials}
                  </div>
                  {conv.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', border: '2px solid white' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1A1209' }}>{conv.name}</div>
                  <div style={{ fontSize: '0.68rem', color: conv.online ? '#1D9E75' : '#7A6D5A', fontWeight: 600 }}>
                    {conv.online ? 'En ligne' : 'Hors ligne'} · {conv.role}
                  </div>
                </div>
                <Link href={`/guides/${conv.id === '1' ? 'rachid-al-madani' : 'fatima-al-omari'}`} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', background: '#FAF3E0', border: '1px solid rgba(201,168,76,0.3)', padding: '0.3rem 0.75rem', borderRadius: 50, textDecoration: 'none' }}>
                  Profil
                </Link>
              </div>

              {/* Anti-contournement */}
              <div style={{ margin: '0.75rem 1rem', background: '#1A1209', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: '0.75rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: 0 }}>
                  Pour votre sécurité, <strong style={{ color: '#F0D897' }}>toutes les transactions passent par SAFARUMA.</strong> Tout accord direct est contraire à nos CGU.
                </p>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', margin: '0.25rem 0 0.5rem' }}>Aujourd&apos;hui</div>

                {MESSAGES_DATA.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {msg.from === 'guide' && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: conv.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: conv.color, fontSize: '0.65rem', flexShrink: 0 }}>
                        {conv.initials}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%',
                      background: msg.from === 'me' ? '#FAF3E0' : 'white',
                      border: `1px solid ${msg.from === 'me' ? 'rgba(201,168,76,0.3)' : '#EDE8DC'}`,
                      borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '0.65rem 0.875rem',
                      boxShadow: '0 1px 4px rgba(26,18,9,0.06)',
                    }}>
                      <p style={{ fontSize: '0.85rem', color: '#1A1209', lineHeight: 1.55, margin: 0 }}>{msg.text}</p>
                      <div style={{ fontSize: '0.6rem', color: '#7A6D5A', marginTop: '0.3rem', textAlign: msg.from === 'me' ? 'right' : 'left', fontWeight: 600 }}>
                        {msg.time}{msg.from === 'me' && <span style={{ marginLeft: '0.3rem', color: '#C9A84C' }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '0.875rem 1rem', background: 'white', borderTop: '1px solid #EDE8DC' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', background: '#FAF7F0', border: '1.5px solid #EDE8DC', borderRadius: 14, padding: '0.6rem 0.75rem' }}>
                  <textarea
                    className="msg-input"
                    placeholder="Écrivez un message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={1}
                    style={{ minHeight: 36, maxHeight: 100 }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setMessage(''); } }}
                  />
                  <button
                    className="msg-send-btn"
                    onClick={() => setMessage('')}
                    style={{ background: message.trim() ? '#1A1209' : '#E8DFC8', color: message.trim() ? '#F0D897' : '#7A6D5A', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: message.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', flexShrink: 0, transition: 'background 0.15s' }}
                    disabled={!message.trim()}
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
