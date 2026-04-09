'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type ConvSummary = {
  id: string;
  guideName: string;
  guideSlug: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  updatedAt: string;
};

type Msg = {
  id: string;
  content: string;
  senderId: string;
  isFromMe: boolean;
  createdAt: string;
  readAt: string | null;
};

type ConvDetail = {
  conversation: { id: string; guideName: string; guideSlug: string | null };
  messages: Msg[];
};

function initials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  return (parts[0]?.[0] ?? 'G').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
}

function Skeleton({ w, h = 14 }: { w?: number | string; h?: number }) {
  return <div style={{ height: h, background: '#F0EDE8', borderRadius: 4, width: w ?? '100%' }} />;
}

export default function EspaceMessages() {
  const [convs, setConvs]               = useState<ConvSummary[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [convError, setConvError]       = useState('');

  const [activeId, setActiveId]         = useState<string | null>(null);
  const [detail, setDetail]             = useState<ConvDetail | null>(null);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [msgError, setMsgError]         = useState('');

  const [newMessage, setNewMessage]     = useState('');
  const [sending, setSending]           = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ── Fetch conversation list ── */
  const fetchConvs = () => {
    setLoadingConvs(true); setConvError('');
    fetch('/api/espace/conversations')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setConvs(d.conversations ?? []); setLoadingConvs(false); })
      .catch((e: Error) => { setConvError(e.message); setLoadingConvs(false); });
  };

  useEffect(() => { fetchConvs(); }, []);

  /* ── Fetch messages when active conversation changes ── */
  useEffect(() => {
    if (!activeId) { setDetail(null); return; }
    setLoadingMsgs(true); setMsgError('');
    fetch(`/api/espace/conversations/${activeId}`)
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then(d => { setDetail(d); setLoadingMsgs(false); })
      .catch((e: Error) => { setMsgError(e.message); setLoadingMsgs(false); });
  }, [activeId]);

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detail?.messages]);

  /* ── Send message ── */
  const send = async () => {
    if (!activeId || !newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/espace/conversations/${activeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (!res.ok) throw new Error('Erreur envoi');
      const { message: sent } = await res.json();
      setDetail(prev => prev ? { ...prev, messages: [...prev.messages, sent] } : prev);
      setNewMessage('');
      // Refresh conv list for last-message preview
      fetchConvs();
    } catch { /* silent */ }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ─────────────────────────────────── */
  /* STYLES                              */
  /* ─────────────────────────────────── */
  const SIDEBAR_W = 320;
  const HEADER_H  = 60;  // espace (dashboard) header
  const INPUT_H   = 80;
  const fullH     = `calc(100vh - ${HEADER_H}px)`;
  const msgsH     = `calc(${fullH} - ${HEADER_H}px - ${INPUT_H}px - 40px)`; // 40 = security banner

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showList  = !activeId || (!isMobile);
  const showMsgs  = !!activeId || (!isMobile);

  return (
    <div style={{ fontFamily: 'var(--font-manrope, sans-serif)', display: 'flex', height: fullH, border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* ── LEFT COLUMN — Conversations list ── */}
      {(!activeId || !isMobile) && (
        <div style={{ width: isMobile ? '100%' : SIDEBAR_W, flexShrink: 0, borderRight: '1px solid #E8DFC8', display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E8DFC8', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209' }}>Messages</div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convError && (
              <div style={{ padding: '1rem', fontSize: '0.78rem', color: '#DC2626' }}>{convError}</div>
            )}

            {loadingConvs ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F5F2EC', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F0EDE8', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton w="60%" h={12} />
                    <div style={{ marginTop: '0.4rem' }}><Skeleton w="80%" h={10} /></div>
                  </div>
                </div>
              ))
            ) : convs.length === 0 ? (
              <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.35rem' }}>Aucune conversation pour l&apos;instant</div>
                <div style={{ fontSize: '0.75rem', color: '#7A6D5A', marginBottom: '1.25rem' }}>Contacte un guide depuis sa page profil</div>
                <Link href="/guides" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                  Voir les guides
                </Link>
              </div>
            ) : (
              convs.map(c => {
                const active = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem', width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', borderBottom: '1px solid #F5F2EC', background: active ? '#FAF3E0' : 'white', borderLeft: `3px solid ${active ? '#C9A84C' : 'transparent'}`, transition: 'background 0.12s' }}
                  >
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                      {initials(c.guideName)}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.guideName}</div>
                        <div style={{ fontSize: '0.62rem', color: '#9A8A7A', flexShrink: 0 }}>{c.lastMessageAt ?? c.updatedAt}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <div style={{ fontSize: '0.72rem', color: '#7A6D5A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                          {c.lastMessage ? c.lastMessage.slice(0, 50) + (c.lastMessage.length > 50 ? '…' : '') : 'Aucun message'}
                        </div>
                        {c.unreadCount > 0 && (
                          <span style={{ background: '#DC2626', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 50, flexShrink: 0 }}>{c.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── RIGHT COLUMN — Message window ── */}
      {(!isMobile || activeId) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>

          {!activeId ? (
            /* Empty state */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#7A6D5A' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.875rem' }}>💬</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Sélectionne une conversation</div>
            </div>
          ) : (
            <>
              {/* Conv header */}
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #E8DFC8', display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0, background: 'white' }}>
                {isMobile && (
                  <button onClick={() => setActiveId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.1rem', padding: '0.25rem', flexShrink: 0 }}>←</button>
                )}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                  {detail ? initials(detail.conversation.guideName) : '…'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {detail?.conversation.guideName ?? '…'}
                  </div>
                  {detail?.conversation.guideSlug && (
                    <Link href={`/guides/${detail.conversation.guideSlug}`} style={{ fontSize: '0.65rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>
                      Voir profil →
                    </Link>
                  )}
                </div>
              </div>

              {/* Security banner */}
              <div style={{ background: '#FEF3C7', padding: '0.45rem 1.25rem', flexShrink: 0, fontSize: '0.7rem', color: '#92400E', lineHeight: 1.5 }}>
                🛡 Pour votre sécurité, les coordonnées personnelles sont masquées. Toute réservation se fait via SAFARUMA.
              </div>

              {/* Messages area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
                {loadingMsgs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                        <div style={{ width: 180 + i * 20, height: 40, background: '#F0EDE8', borderRadius: 18 }} />
                      </div>
                    ))}
                  </div>
                ) : msgError ? (
                  <div style={{ fontSize: '0.78rem', color: '#DC2626', padding: '1rem' }}>{msgError}</div>
                ) : detail?.messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#7A6D5A', fontSize: '0.82rem', marginTop: '2rem' }}>
                    Aucun message. Envoie le premier !
                  </div>
                ) : (
                  detail?.messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.isFromMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '0.65rem 0.9rem',
                        borderRadius: m.isFromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: m.isFromMe ? '#1A1209' : '#F5F0E8',
                        color: m.isFromMe ? '#F0D897' : '#1A1209',
                        fontSize: '0.85rem', lineHeight: 1.5, wordBreak: 'break-word',
                      }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#9A8A7A', marginTop: '0.2rem', padding: '0 0.25rem' }}>
                        {m.createdAt}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #E8DFC8', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0, background: 'white' }}>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Écrire un message… (Entrée pour envoyer)"
                  rows={1}
                  style={{
                    flex: 1, padding: '0.65rem 0.875rem', border: '1.5px solid #E8DFC8',
                    borderRadius: 20, fontSize: '0.85rem', color: '#1A1209',
                    fontFamily: 'inherit', resize: 'none', outline: 'none',
                    background: '#FDFBF7', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                  }}
                />
                <button
                  onClick={send}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    padding: '0.65rem 1.25rem', borderRadius: 20, border: 'none',
                    background: (!newMessage.trim() || sending) ? '#E8DFC8' : '#1A1209',
                    color: (!newMessage.trim() || sending) ? '#7A6D5A' : '#F0D897',
                    fontSize: '0.82rem', fontWeight: 700, cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  {sending ? '…' : 'Envoyer'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
