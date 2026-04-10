'use client';
import { useState, useEffect } from 'react';

type GuideRow = { id: string; slug: string | null; name: string; commissionRate: number; totalReservations: number; totalRevenue: number };

export default function AdminCommissions() {
  const [guides, setGuides]         = useState<GuideRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [rates, setRates]           = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState<string | null>(null);
  const [feedback, setFeedback]     = useState<Record<string, { ok: boolean; msg: string }>>({});

  const fetchGuides = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/commissions');
    const data = await res.json();
    const list: GuideRow[] = data.guides || [];
    setGuides(list);
    const init: Record<string, string> = {};
    list.forEach(g => { init[g.id] = String(Math.round(g.commissionRate * 100)); });
    setRates(init);
    setLoading(false);
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleSave = async (guideId: string) => {
    const pct = Number(rates[guideId]);
    if (isNaN(pct) || pct < 5 || pct > 50) {
      setFeedback(f => ({ ...f, [guideId]: { ok: false, msg: 'Taux invalide (5-50%)' } }));
      return;
    }
    setSaving(guideId);
    const res = await fetch('/api/admin/commissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guideId, commissionRate: pct / 100 }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback(f => ({ ...f, [guideId]: { ok: true, msg: 'Sauvegardé' } }));
      await fetchGuides();
    } else {
      setFeedback(f => ({ ...f, [guideId]: { ok: false, msg: data.error || 'Erreur' } }));
    }
    setSaving(null);
    setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[guideId]; return n; }), 3000);
  };

  const card: React.CSSProperties = { background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>Gestion des commissions</h1>
      </div>

      {/* Info card */}
      <div style={{ ...card, padding: '1rem 1.5rem', background: '#FEF9E7', border: '1px solid #FCD34D' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Taux standard SAFARUMA : 15%</div>
        <div style={{ fontSize: '0.78rem', color: '#78350F', lineHeight: 1.6 }}>
          Modifiable guide par guide pour des arrangements spéciaux. Le taux s'applique à la prochaine réservation créée — les réservations existantes ne sont pas rétroactivement modifiées.
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: '#F5F2EC', borderBottom: '1px solid #E8DFC8' }}>
                {['Guide', 'Taux actuel', 'Réservations', 'Revenus générés', 'Modifier'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={{ padding: '0.875rem' }}><div style={{ height: 12, background: '#F0EDE8', borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : guides.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>Aucun guide</td></tr>
              ) : (
                guides.map((g, i) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #F0EBE0', background: i % 2 === 0 ? 'white' : '#FAFAF8' }}>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{g.name}</td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                        {Math.round(g.commissionRate * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.82rem', color: '#4A3F30', textAlign: 'center' }}>{g.totalReservations}</td>
                    <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap' }}>{g.totalRevenue} €</td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E8DFC8', borderRadius: 8, overflow: 'hidden' }}>
                          <input
                            type="number" min={5} max={50} step={1}
                            value={rates[g.id] ?? ''}
                            onChange={e => setRates(r => ({ ...r, [g.id]: e.target.value }))}
                            style={{ width: 52, padding: '0.35rem 0.5rem', border: 'none', fontSize: '0.82rem', fontFamily: 'inherit', color: '#1A1209', outline: 'none', textAlign: 'center' }}
                          />
                          <span style={{ padding: '0.35rem 0.5rem', background: '#F5F2EC', fontSize: '0.78rem', color: '#7A6D5A', borderLeft: '1px solid #E8DFC8' }}>%</span>
                        </div>
                        <button
                          onClick={() => handleSave(g.id)}
                          disabled={saving === g.id}
                          style={{ padding: '0.4rem 0.875rem', background: saving === g.id ? '#9CA3AF' : '#1A1209', color: '#F0D897', border: 'none', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, cursor: saving === g.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                        >
                          {saving === g.id ? '…' : 'Sauvegarder'}
                        </button>
                        {feedback[g.id] && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: feedback[g.id].ok ? '#1D5C3A' : '#DC2626' }}>
                            {feedback[g.id].msg}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
