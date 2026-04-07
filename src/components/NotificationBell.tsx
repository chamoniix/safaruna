'use client';

import { useState, useEffect, useRef } from 'react';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  guide:     { icon: '👤', color: '#C9A84C' },
  reminder:  { icon: '📅', color: '#1A4A8A' },
  spiritual: { icon: '🤲', color: '#1D5C3A' },
  promo:     { icon: '🕌', color: '#8B6914' },
  academy:   { icon: '📚', color: '#5A2D82' },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'À l\'instant';
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.readAt).length;

  const stopPolling = useRef(false);

  const fetchNotifs = async () => {
    if (stopPolling.current) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.status === 401) {
        stopPolling.current = true; // Arrêter le polling si non connecté
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => {
      clearInterval(interval);
      stopPolling.current = true;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    setNotifs(ns => ns.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nb-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 340px; background: white;
          border: 1px solid #EDE8DC; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(26,18,9,0.12);
          z-index: 200; overflow: hidden;
          animation: nbFadeIn 0.15s ease;
        }
        @keyframes nbFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) {
          .nb-dropdown { width: calc(100vw - 2rem); right: -1rem; }
        }
        .nb-item { transition: background 0.12s; }
        .nb-item:hover { background: #FAF7F0; }
      `}} />

      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifs(); }}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: '50%',
          border: '1px solid #EDE8DC', background: open ? '#FAF3E0' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0,
        }}
        aria-label="Notifications"
      >
        {/* Bell SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open ? '#8B6914' : '#1A1209'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            width: 16, height: 16, borderRadius: '50%',
            background: '#C0392B', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.5rem', fontWeight: 800, color: 'white', lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="nb-dropdown">
          {/* Header */}
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F0EBD8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: '#C0392B', color: 'white', fontSize: '0.55rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: 50 }}>
                  {unreadCount} nouvelles
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: '0.72rem', color: '#8B6914', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.82rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                Aucune notification pour le moment
              </div>
            ) : (
              notifs.map((n, i) => {
                const conf = TYPE_CONFIG[n.type] || { icon: '📢', color: '#7A6D5A' };
                const isUnread = !n.readAt;
                return (
                  <div
                    key={n.id}
                    className="nb-item"
                    onClick={() => markRead(n.id)}
                    style={{
                      display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem',
                      borderBottom: i < notifs.length - 1 ? '1px solid #F5F0E8' : 'none',
                      cursor: 'pointer', background: isUnread ? 'rgba(201,168,76,0.04)' : 'white',
                      position: 'relative',
                    }}
                  >
                    {/* Unread dot */}
                    {isUnread && (
                      <div style={{ position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
                    )}
                    {/* Icon */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${conf.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                      {conf.icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: isUnread ? 700 : 600, color: '#1A1209', marginBottom: '0.2rem', lineHeight: 1.3 }}>{n.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.5, marginBottom: '0.25rem' }}>{n.message}</div>
                      <div style={{ fontSize: '0.65rem', color: '#9A8A7A', fontWeight: 600 }}>{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div style={{ padding: '0.75rem', borderTop: '1px solid #F0EBD8', textAlign: 'center' }}>
              <button style={{ fontSize: '0.75rem', color: '#8B6914', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
