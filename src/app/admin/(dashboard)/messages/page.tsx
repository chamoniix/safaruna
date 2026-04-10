'use client';

import { useState, useEffect, useRef } from 'react';

type ConvSummary = {
  id: string; pelerinName: string; guideName: string;
  lastMessage: string; lastMessageAt: string; totalMessages: number; updatedAt: string;
};
type ConvDetail = {
  id: string;
  pelerin: { name: string; email: string };
  guide: { name: string; email: string };
  messages: {
    id: string; content: string; senderName: string; senderRole: string;
    isFromGuide: boolean; createdAt: string; readAt: string | null;
  }[];
};

export default function AdminMessages() {
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConvDetail | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Pre-select from ?conv= query param
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const convId = p.get('conv');
    if (convId) setActiveId(convId);
  }, []);

  useEffect(() => {
    setLoadingConvs(true);
    fetch('/api/admin/messages')
      .then(r => r.json())
      .then(d => { setConversations(d.conversations || []); setStats(d.stats || { total: 0, today: 0 }); })
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (!activeId) { setDetail(null); return; }
    setLoadingDetail(true);
    fetch(`/api/admin/messages/${activeId}`)
      .then(r => r.json())
      .then(d => setDetail(d))
      .finally(() => setLoadingDetail(false));
  }, [activeId]);

  useEffect(() => {
    if (detail) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [detail]);

  const filtered = conversations.filter(c =>
    !search ||
    c.pelerinName.toLowerCase().includes(search.toLowerCase()) ||
    c.guideName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 60px - 4rem)', minHeight: 0 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
        {[
          { label: 'Total conversations', value: stats.total, color: '#1A1209', bg: 'white' },
          { label: "Actives aujourd'hui", value: stats.today, color: '#1D5C3A', bg: '#D1FAE5' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #E8DFC8', borderRadius: 10, padding: '0.875rem 1.25rem', minWidth: 140 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{loadingConvs ? '—' : s.value}</div>
          </div>
        ))}
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>

        {/* Left — conversation list */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #F0EBE0', flexShrink: 0 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pèlerin, guide…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', border: '1px solid #E8DFC8', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'inherit', color: '#1A1209', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '0.875rem', borderBottom: '1px solid #F0EBE0' }}>
                  <div style={{ height: 12, background: '#F0EDE8', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 10, background: '#F0EDE8', borderRadius: 4, width: '70%' }} />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.82rem' }}>Aucune conversation</div>
            ) : (
              filtered.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  style={{ padding: '0.875rem', borderBottom: '1px solid #F0EBE0', cursor: 'pointer', background: activeId === c.id ? '#FAF3E0' : 'white', borderLeft: activeId === c.id ? '3px solid #C9A84C' : '3px solid transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, fontFamily: 'var(--font-cormorant, serif)' }}>
                      {c.pelerinName.slice(0, 1)}→{c.guideName.slice(0, 1)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.pelerinName}</div>
                      <div style={{ fontSize: '0.68rem', color: '#7A6D5A' }}>→ {c.guideName}</div>
                    </div>
                    <span style={{ background: '#E8DFC8', color: '#7A6D5A', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 10, flexShrink: 0 }}>{c.totalMessages}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage || '—'}</div>
                  <div style={{ fontSize: '0.62rem', color: '#C9A84C', marginTop: 2 }}>{c.lastMessageAt}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — detail */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden' }}>
          {!activeId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
              Sélectionne une conversation pour la lire
            </div>
          ) : loadingDetail ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : detail ? (
            <>
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F0EBE0', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>
                  {detail.pelerin.name} → {detail.guide.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#7A6D5A', marginTop: 2 }}>
                  {detail.pelerin.email} · {detail.guide.email}
                </div>
              </div>
              {/* Moderation banner */}
              <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '0.4rem 1.25rem', fontSize: '0.72rem', color: '#92400E', fontWeight: 600, flexShrink: 0 }}>
                Mode lecture seule — Modération SAFARUMA
              </div>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {detail.messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.isFromGuide ? 'flex-end' : 'flex-start', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ display: 'inline-block', background: m.isFromGuide ? '#D1FAE5' : '#DBEAFE', color: m.isFromGuide ? '#1D5C3A' : '#1E40AF', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.15rem 0.45rem', borderRadius: 10 }}>
                        {m.isFromGuide ? 'GUIDE' : 'PÈLERIN'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{m.senderName}</span>
                    </div>
                    <div style={{ maxWidth: '75%', background: m.isFromGuide ? '#F0FAF5' : '#F0F4FF', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.83rem', color: '#1A1209', lineHeight: 1.6 }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                      {m.createdAt}{m.readAt && ` · Lu le ${m.readAt}`}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
