'use client';

import { useState, useEffect } from 'react';

type Notif = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `il y a ${d}j`;
  if (h > 0) return `il y a ${h}h`;
  return `il y a ${Math.floor(diff / 60000)}min`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { setNotifs(d.notifications ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    const now = new Date().toISOString();
    setNotifs(ns => ns.map(n => ({ ...n, readAt: n.readAt ?? now })));
  };

  const unreadCount = notifs.filter(n => !n.readAt).length;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 16px 40px', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span style={{ display: 'block', fontSize: 9, color: 'rgba(26,18,9,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 500 }}>Espace</span>
          <span style={{ display: 'block', fontFamily: 'var(--font-cormorant, serif)', fontSize: 22, color: '#1A1209', fontWeight: 600 }}>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ fontSize: 11, fontWeight: 600, color: '#C9A84C', background: 'none', border: '0.5px solid rgba(201,168,76,0.4)', borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ height: 68, background: 'rgba(26,18,9,0.04)', borderRadius: 12 }} />)}
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: 'center' as const, padding: '48px 24px', color: 'rgba(26,18,9,0.4)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
          Aucune notification pour le moment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => { if (!n.readAt) markRead(n.id); }}
              style={{
                background: n.readAt ? '#FFFFFF' : 'rgba(201,168,76,0.06)',
                border: `0.5px solid ${n.readAt ? 'rgba(26,18,9,0.06)' : 'rgba(201,168,76,0.25)'}`,
                borderRadius: 12, padding: '12px 14px',
                display: 'flex', gap: 12,
                cursor: n.readAt ? 'default' : 'pointer',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.readAt ? 'transparent' : '#C9A84C', flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1209', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(26,18,9,0.6)', lineHeight: 1.4 }}>{n.message}</div>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(26,18,9,0.35)', flexShrink: 0, marginTop: 2 }}>{formatRelativeTime(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
