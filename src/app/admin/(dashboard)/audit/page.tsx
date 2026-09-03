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
  ip?: string
  requestId?: string
  userAgent?: string
  before?: unknown
  after?: unknown
}

const ACTION_COLORS: Record<string, string> = {
  RESERVATION_CREATED:   '#1D5C3A',
  PAYMENT_CONFIRMED:     '#1D5C3A',
  PLACE_PRICE_UPDATED:   '#C9A84C',
  PLACE_TOGGLED:         '#C9A84C',
  GUIDE_ACTIVATED:       '#2563EB',
  GUIDE_DEACTIVATED:     '#DC2626',
  GUIDE_SUSPENDED:       '#DC2626',
  GUIDE_IDENTITY_UPDATED:'#2563EB',
  GUIDE_PROFILE_UPDATED: '#2563EB',
  GUIDE_PROFILE_CHANGE_REQUESTED: '#C9A84C',
  GUIDE_PROFILE_CHANGE_APPROVED: '#1D5C3A',
  GUIDE_PROFILE_CHANGE_REJECTED: '#DC2626',
  GUIDE_INTERVIEW_UPDATED:'#2563EB',
  GUIDE_LANGUAGE_ADDED:  '#2563EB',
  GUIDE_LANGUAGE_DELETED:'#DC2626',
  GUIDE_PLACE_TOGGLED:   '#C9A84C',
  GUIDE_APPLICATION_APPROVED: '#1D5C3A',
  GUIDE_APPLICATION_REJECTED: '#DC2626',
  GUIDE_ACTIVATED_WITH_NEW_ACCESS: '#1D5C3A',
  GUIDE_CREATED_BY_ADMIN: '#2563EB',
  ADMIN_ACCOUNT_BOOTSTRAPPED: '#7C3AED',
  RESERVATION_STATUS_UPDATED: '#C9A84C',
  RESERVATION_GUIDE_TRANSFERRED: '#2563EB',
  PAYMENT_SESSION_EXPIRED: '#DC2626',
  RESERVATION_CANCELLED: '#DC2626',
  MEMBER_REVIEW_SUBMITTED: '#7C3AED',
  MEMBER_REVIEW_UPDATED: '#C9A84C',
  EXPERIENCE_REVIEW_MODERATED: '#1D5C3A',
  REVIEW_SUBMITTED: '#7C3AED',
  REVIEW_UPDATED_PENDING: '#C9A84C',
  REVIEW_MODERATED: '#1D5C3A',
  CRON_SENT:             '#7A6D5A',
}

const ACTION_LABELS: Record<string, string> = {
  RESERVATION_CREATED:   'Réservation créée',
  PAYMENT_CONFIRMED:     'Paiement confirmé',
  PLACE_PRICE_UPDATED:   'Prix lieu modifié',
  PLACE_TOGGLED:         'Lieu activé/désactivé',
  GUIDE_ACTIVATED:       'Guide activé',
  GUIDE_DEACTIVATED:     'Guide désactivé',
  GUIDE_SUSPENDED:       'Guide suspendu',
  GUIDE_IDENTITY_UPDATED:'Identité guide modifiée',
  GUIDE_PROFILE_UPDATED: 'Profil guide modifié',
  GUIDE_PROFILE_CHANGE_REQUESTED: 'Modification de profil demandée',
  GUIDE_PROFILE_CHANGE_APPROVED: 'Modification de profil publiée',
  GUIDE_PROFILE_CHANGE_REJECTED: 'Modification de profil rejetée',
  GUIDE_INTERVIEW_UPDATED:'Entretien guide modifié',
  GUIDE_LANGUAGE_ADDED:  'Langue guide ajoutée',
  GUIDE_LANGUAGE_DELETED:'Langue guide supprimée',
  GUIDE_PLACE_TOGGLED:   'Lieu guide activé/désactivé',
  GUIDE_APPLICATION_APPROVED: 'Candidature guide validée',
  GUIDE_APPLICATION_REJECTED: 'Candidature guide rejetée',
  GUIDE_ACTIVATED_WITH_NEW_ACCESS: 'Guide activé avec de nouveaux accès',
  GUIDE_CREATED_BY_ADMIN: 'Guide créé par un administrateur',
  ADMIN_ACCOUNT_BOOTSTRAPPED: 'Compte administrateur initialisé',
  RESERVATION_STATUS_UPDATED: 'Statut réservation modifié',
  RESERVATION_GUIDE_TRANSFERRED: 'Réservation transférée',
  PAYMENT_SESSION_EXPIRED: 'Session de paiement expirée',
  RESERVATION_CANCELLED: 'Réservation annulée',
  MEMBER_REVIEW_SUBMITTED: 'Avis membre envoyé',
  MEMBER_REVIEW_UPDATED: 'Avis membre modifié',
  EXPERIENCE_REVIEW_MODERATED: 'Avis SAFARUMA modéré',
  REVIEW_SUBMITTED: 'Avis Guide envoyé',
  REVIEW_UPDATED_PENDING: 'Avis Guide modifié',
  REVIEW_MODERATED: 'Avis Guide modéré',
  CRON_SENT:             'Cron notifications',
}

function formatAuditValue(value: unknown): string {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [networkVisible, setNetworkVisible] = useState(false)

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Impossible de charger le journal.')
        setLogs(data.logs || [])
        setNetworkVisible(Boolean(data.networkVisible))
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Impossible de charger le journal.'))
      .finally(() => setLoading(false))
  }, [])

  const actionOptions = Array.from(new Set(logs.map(log => log.action))).sort()

  const filtered = filter
    ? logs.filter(l => l.action === filter || l.actor.includes(filter))
    : logs

  return (
    <div className="admin-audit-page" style={{ padding: 0, fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="admin-audit-header" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1rem', gap: '1rem',
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
          {!networkVisible && !loading && (
            <p style={{ color: '#7A6D5A', fontSize: '0.72rem', margin: '3px 0 0' }}>Vue opérationnelle — les données réseau sont réservées au Superadmin.</p>
          )}
        </div>
        <select
          className="admin-audit-filter"
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
          {actionOptions.map(action => (
            <option key={action} value={action}>{ACTION_LABELS[action] || action}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {error ? (
        <div style={{ textAlign: 'center', color: '#DC2626', padding: '3rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 16 }}>
          {error}
        </div>
      ) : loading ? (
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
        <div className="admin-audit-table" style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #E8DFC8', overflowX: 'auto',
        }}>
          <div className="admin-audit-table-inner" style={{ minWidth: networkVisible ? 1180 : 980 }}>
            {/* Header table */}
            <div className="admin-audit-table-header" style={{
              display: 'grid',
              gridTemplateColumns: networkVisible ? '150px 190px 210px 150px 140px minmax(300px, 1fr)' : '150px 190px 210px 150px minmax(300px, 1fr)',
              gap: '1rem', padding: '0.75rem 1.25rem',
              background: '#FAF7F0', borderBottom: '1px solid #E8DFC8',
              fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              color: '#7A6D5A',
            }}>
              <span>Date</span>
              <span>Auteur</span>
              <span>Action</span>
              <span>Cible</span>
              {networkVisible && <span>Réseau</span>}
              <span>Détail et modifications</span>
            </div>

            {/* Rows */}
            {filtered.map((log, idx) => (
              <div
                key={log.id}
                className="admin-audit-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: networkVisible ? '150px 190px 210px 150px 140px minmax(300px, 1fr)' : '150px 190px 210px 150px minmax(300px, 1fr)',
                  gap: '1rem', padding: '0.875rem 1.25rem',
                  borderBottom: idx < filtered.length - 1
                    ? '1px solid #F5F0E8' : 'none',
                  fontSize: '0.82rem', alignItems: 'start',
                }}
              >
                <span className="admin-audit-cell" data-label="Date" style={{ color: '#7A6D5A', fontSize: '0.75rem' }}>
                  {new Date(log.createdAt).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                </span>
                <div className="admin-audit-cell" data-label="Auteur">
                  <div style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.78rem', overflowWrap: 'anywhere' }}>
                    {log.actor}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.68rem', marginTop: 2 }}>
                    {log.actorRole}
                  </div>
                </div>
                <div className="admin-audit-cell" data-label="Action">
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
                <span className="admin-audit-cell" data-label="Cible" style={{ color: '#4A3F30', fontSize: '0.72rem', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                  {log.target || '—'}
                </span>
                {networkVisible && (
                  <div className="admin-audit-cell" data-label="Réseau" style={{ color: '#4A3F30', fontSize: '0.72rem' }}>
                    <div style={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>{log.ip || '—'}</div>
                    {log.requestId && <div style={{ color: '#9CA3AF', marginTop: 3, overflowWrap: 'anywhere' }}>ID : {log.requestId}</div>}
                  </div>
                )}
                <div className="admin-audit-cell admin-audit-detail" data-label="Détail et modifications" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
                  {(log.before != null || log.after != null) && (
                    <div className="admin-audit-changes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', color: '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, marginBottom: 3 }}>Avant</span>
                        <pre style={{ margin: 0, padding: '0.5rem', borderRadius: 6, background: '#FFF7ED', color: '#9A3412', fontSize: '0.67rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'monospace' }}>{formatAuditValue(log.before)}</pre>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', color: '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, marginBottom: 3 }}>Après</span>
                        <pre style={{ margin: 0, padding: '0.5rem', borderRadius: 6, background: '#ECFDF5', color: '#166534', fontSize: '0.67rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'monospace' }}>{formatAuditValue(log.after)}</pre>
                      </div>
                    </div>
                  )}
                  {log.detail && (
                    <details>
                      <summary style={{ color: '#7A6D5A', fontSize: '0.72rem', cursor: 'pointer' }}>Contexte technique</summary>
                      <pre style={{ margin: '0.4rem 0 0', padding: '0.5rem', borderRadius: 6, background: '#F8F6F2', color: '#4A3F30', fontSize: '0.67rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'monospace' }}>{formatAuditValue(log.detail)}</pre>
                    </details>
                  )}
                  {!log.detail && log.before == null && log.after == null && <span style={{ color: '#9CA3AF' }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 700px) {
          .admin-audit-header {
            align-items: stretch !important;
            flex-direction: column;
          }
          .admin-audit-filter {
            width: 100%;
            min-height: 44px;
          }
          .admin-audit-table {
            overflow: visible !important;
            border: 0 !important;
            background: transparent !important;
          }
          .admin-audit-table-inner {
            min-width: 0 !important;
          }
          .admin-audit-table-header {
            display: none !important;
          }
          .admin-audit-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
            margin-bottom: 0.75rem;
            padding: 1rem !important;
            border: 1px solid #E8DFC8 !important;
            border-radius: 12px;
            background: white;
          }
          .admin-audit-cell::before {
            display: block;
            margin-bottom: 0.2rem;
            color: #7A6D5A;
            content: attr(data-label);
            font-size: 0.6rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .admin-audit-changes {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
