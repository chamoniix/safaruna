'use client'
import { useEffect, useState } from 'react'

type Log = {
  id: string
  createdAt: string
  actor: string
  actorRole: string
  action: string
  target?: string
  detail?: string
}

const ACTION_COLORS: Record<string, string> = {
  RESERVATION_CREATED:   '#1D5C3A',
  PAYMENT_CONFIRMED:     '#1D5C3A',
  PLACE_PRICE_UPDATED:   '#C9A84C',
  PLACE_TOGGLED:         '#C9A84C',
  GUIDE_ACTIVATED:       '#2563EB',
  GUIDE_DEACTIVATED:     '#DC2626',
  RESERVATION_CANCELLED: '#DC2626',
  CRON_SENT:             '#7A6D5A',
}

const ACTION_LABELS: Record<string, string> = {
  RESERVATION_CREATED:   'Réservation créée',
  PAYMENT_CONFIRMED:     'Paiement confirmé',
  PLACE_PRICE_UPDATED:   'Prix lieu modifié',
  PLACE_TOGGLED:         'Lieu activé/désactivé',
  GUIDE_ACTIVATED:       'Guide activé',
  GUIDE_DEACTIVATED:     'Guide désactivé',
  RESERVATION_CANCELLED: 'Réservation annulée',
  CRON_SENT:             'Cron notifications',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setLoading(false) })
  }, [])

  const filtered = filter
    ? logs.filter(l => l.action === filter || l.actor.includes(filter))
    : logs

  return (
    <div style={{ padding: '2rem', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: '1.8rem', fontWeight: 600,
            color: '#1A1209', margin: 0,
          }}>
            Journal d&apos;audit
          </h1>
          <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginTop: 4 }}>
            {logs.length} événements enregistrés
          </p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1.5px solid #E8DFC8',
            borderRadius: 8, fontSize: '0.82rem',
            color: '#1A1209', background: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="">Tous les événements</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#7A6D5A', padding: '3rem' }}>
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: 'white', borderRadius: 16,
          border: '1px solid #E8DFC8', color: '#7A6D5A',
        }}>
          Aucun événement pour l&apos;instant.
          Les actions s&apos;enregistreront automatiquement.
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #E8DFC8', overflow: 'hidden',
        }}>
          {/* Header table */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '160px 140px 200px 140px 1fr',
            gap: '1rem', padding: '0.75rem 1.25rem',
            background: '#FAF7F0', borderBottom: '1px solid #E8DFC8',
            fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: '#7A6D5A',
          }}>
            <span>Date</span>
            <span>Acteur</span>
            <span>Action</span>
            <span>Cible</span>
            <span>Détail</span>
          </div>

          {/* Rows */}
          {filtered.map((log, idx) => (
            <div
              key={log.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 140px 200px 140px 1fr',
                gap: '1rem', padding: '0.875rem 1.25rem',
                borderBottom: idx < filtered.length - 1
                  ? '1px solid #F5F0E8' : 'none',
                fontSize: '0.82rem', alignItems: 'center',
              }}
            >
              <span style={{ color: '#7A6D5A', fontSize: '0.75rem' }}>
                {new Date(log.createdAt).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <div>
                <div style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.78rem' }}>
                  {log.actor}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '0.68rem', marginTop: 2 }}>
                  {log.actorRole}
                </div>
              </div>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: `${ACTION_COLORS[log.action] || '#7A6D5A'}18`,
                  color: ACTION_COLORS[log.action] || '#7A6D5A',
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '0.2rem 0.65rem', borderRadius: 50,
                }}>
                  {ACTION_LABELS[log.action] || log.action}
                </span>
              </div>
              <span style={{ color: '#4A3F30', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                {log.target || '—'}
              </span>
              <span style={{ color: '#7A6D5A', fontSize: '0.75rem' }}>
                {log.detail || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
