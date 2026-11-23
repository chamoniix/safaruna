'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { readAdminGuideContract } from '@/lib/guide-contracts'

type State = Awaited<ReturnType<typeof readAdminGuideContract>>
const statusLabels: Record<string, string> = { pending: 'En attente de signature', completed: 'Signé',
  expired: 'Expiré', declined: 'Refusé', archived: 'Archivé' }
const buttonStyle: React.CSSProperties = { border: '1px solid #E8DFC8', borderRadius: 8,
  padding: '0.6rem 0.875rem', background: 'white', color: '#1A1209', fontWeight: 700, fontSize: '0.8rem' }

export default function GuideContractPanel({ slug }: { slug: string }) {
  const endpoint = `/api/admin/guides/${encodeURIComponent(slug)}/contract`
  const [state, setState] = useState<State | null>(null)
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const lock = useRef(false)
  const load = useCallback(async () => {
    const response = await fetch(endpoint, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Impossible de charger le contrat.')
    setState(data)
  }, [endpoint])
  useEffect(() => { let active = true
    setState(null); setError(''); setMessage('')
    // Do not let a response for another Guide replace the current dossier.
    fetch(endpoint, { cache: 'no-store' }).then(async response => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Impossible de charger le contrat.')
      if (active) setState(data)
    }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Chargement impossible.') })
    return () => { active = false }
  }, [endpoint])

  async function act(action: 'PREPARE' | 'SEND' | 'SYNC') {
    if (lock.current) return
    const contract = state?.contract
    if (action !== 'PREPARE' && !contract) return
    if (action === 'SEND' && !window.confirm(`Envoyer le contrat pour signature à ${contract!.guideEmail} ?`)) return
    lock.current = true; setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'PREPARE' ? { action, ...(address.trim() && { address: address.trim() }) }
          : { action, contractId: contract!.id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Action impossible.')
      setState(data)
      setMessage(action === 'PREPARE' ? 'Contrat préparé sans invitation.'
        : action === 'SEND' ? data.contract?.sentAt ? 'Envoi de l’invitation confirmé par DocuSeal.'
          : 'Envoi demandé. Actualisez pour vérifier son statut.' : 'Statut vérifié auprès de DocuSeal.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Action impossible.')
      // The provider may have accepted the operation despite a lost response.
      // Refresh persisted claims; never re-enable a blind automatic retry.
      try { await load() } catch { setState(null) }
    } finally { lock.current = false; setBusy(false) }
  }
  const contract = state?.contract
  const documentLink = (kind: string) => `${endpoint}?document=${kind}&contractId=${encodeURIComponent(contract!.id)}`
  return <section aria-labelledby="guide-contract-title" aria-busy={busy} data-clarity-mask="true" data-sentry-mask
    style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <h2 id="guide-contract-title" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>Contrat Guide — DocuSeal</h2>
    <p style={{ margin: 0, fontSize: '0.82rem', color: '#4A3F30' }}>Contrat en français avec HOLDINGAI LTD et charte SAFARUMA annexée. La signature et la publication du profil sont deux étapes distinctes.</p>
    {!state && !error && <p role="status">Chargement du contrat…</p>}
    {state && !state.configured && <p role="alert">DocuSeal doit être configuré sur cet environnement avant de préparer ou envoyer un contrat.</p>}
    {state?.preparationBlocker && <p role="alert">{state.preparationBlocker}</p>}
    {state && !contract && <>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>Adresse postale du Guide si connue
        <textarea value={address} maxLength={1000} rows={2} disabled={busy}
          onChange={event => setAddress(event.target.value)} style={{ ...buttonStyle, fontWeight: 400, resize: 'vertical' }} />
      </label>
      <p style={{ margin: 0, fontSize: '0.78rem', color: '#7A6D5A' }}>Si elle n’est pas renseignée ici, le Guide devra compléter son adresse avant de signer.</p>
    </>}
    {contract && <>
      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', margin: 0, overflowWrap: 'anywhere', fontSize: '0.82rem' }}>
        <div><dt>Guide</dt><dd style={{ margin: 0 }}>{contract.guideName}</dd></div>
        <div><dt>Destinataire</dt><dd style={{ margin: 0 }}>{contract.guideEmail}</dd></div>
        <div><dt>Version</dt><dd style={{ margin: 0 }}>{contract.version}</dd></div>
        <div><dt>Statut</dt><dd style={{ margin: 0 }}>{!contract.prepared ? 'Préparation à vérifier'
          : contract.status === 'completed' && !contract.canDownloadSigned ? 'Signature à vérifier'
            : contract.sentAt ? statusLabels[contract.status || ''] || 'À vérifier' : contract.status === 'pending' ? 'Préparé sans invitation' : statusLabels[contract.status || ''] || 'À vérifier'}</dd></div>
      </dl>
      {contract.lastSyncedAt && <p style={{ margin: 0, fontSize: '0.78rem', color: '#7A6D5A' }}>Dernière vérification : {new Date(contract.lastSyncedAt).toLocaleString('fr-FR')}</p>}
      {(contract.preparationUncertain || contract.sendUncertain) && <p role="status" style={{ margin: 0, fontSize: '0.82rem' }}>Une opération est en cours ou son résultat reste à vérifier. Actualisez le statut ; aucun nouvel envoi automatique ne sera effectué.</p>}
      {contract.canDownloadSigned && <p style={{ margin: 0, fontSize: '0.82rem' }}>Autorisation photo : {contract.photoConsent === true ? 'accordée' : contract.photoConsent === false ? 'non accordée' : 'à vérifier dans le contrat signé'}.</p>}
    </>}
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {state && (!contract || contract.canResumePreparation) && <button style={buttonStyle} disabled={busy || !state.configured || Boolean(state.preparationBlocker)} onClick={() => act('PREPARE')}>Préparer sans envoyer</button>}
      {contract && <button style={buttonStyle} disabled={busy || !state?.configured} onClick={() => act('SYNC')}>Actualiser le statut</button>}
      {contract?.prepared && <a style={buttonStyle} href={documentLink('preview')} target="_blank" rel="noopener noreferrer">Voir le document préparé</a>}
      {contract?.canSend && <button style={buttonStyle} disabled={busy || !state?.configured} onClick={() => act('SEND')}>Envoyer pour signature par email</button>}
      {contract?.canDownloadSigned && <>
        <a style={buttonStyle} href={documentLink('contract')}>Télécharger le contrat signé</a>
        <a style={buttonStyle} href={documentLink('audit')}>Télécharger la preuve de signature</a>
      </>}
      {!state && error && <button style={buttonStyle} disabled={busy} onClick={() => { setError(''); load().catch(cause => setError(cause.message)) }}>Recharger le contrat</button>}
    </div>
    {message && <p role="status" style={{ margin: 0, fontSize: '0.82rem', color: '#166534' }}>{message}</p>}
    {error && <p role="alert" style={{ margin: 0, fontSize: '0.82rem', color: '#991B1B' }}>{error}</p>}
  </section>
}
