'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Banknote, LoaderCircle, X } from 'lucide-react'
import type { readReservationGuideTransfers } from '@/lib/guide-transfers'
import styles from './GuideTransferPanel.module.css'

type TransferData = Awaited<ReturnType<typeof readReservationGuideTransfers>>
type Item = TransferData['items'][number]
type Command = { action: 'PREPARE' | 'CONFIRM' | 'CORRECT'; input: Record<string, unknown> }
const endpoint = '/api/admin/reservations/guide-transfers'
const money = (cents: number | null) => cents === null ? 'Montant indisponible' : (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const date = (value: string | null) => value ? new Date(value).toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh', dateStyle: 'short', timeStyle: 'short' }) : '—'
const localDate = (value: string | null) => value ? new Date(new Date(value).getTime() + 3 * 3600000).toISOString().slice(0, 16) : ''

export default function GuideTransferPanel({ reservationId }: { reservationId: string }) {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" className={styles.trigger} onClick={() => setOpen(true)}><Banknote size={15} /> Virements Guide</button>
    {open && <TransferDialog reservationId={reservationId} onClose={() => setOpen(false)} />}
  </>
}

function TransferDialog({ reservationId, onClose }: { reservationId: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const inFlight = useRef(false)
  const [data, setData] = useState<TransferData | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [version, setVersion] = useState(0)

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setData(null)
    try {
      const response = await fetch(`${endpoint}?reservationId=${encodeURIComponent(reservationId)}`, { cache: 'no-store', signal })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Chargement impossible.')
      if (!signal?.aborted) { setData(result); setVersion(value => value + 1) }
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : 'Chargement impossible.')
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [reservationId])

  useEffect(() => {
    dialog.current?.showModal()
    const controller = new AbortController()
    void reload(controller.signal)
    return () => controller.abort()
  }, [reload])

  async function send(command: Command) {
    if (inFlight.current || loading || !data) return
    inFlight.current = true
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command), signal: AbortSignal.timeout(20000),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Enregistrement non confirmé.')
      setMessage(command.action === 'PREPARE' ? 'Enregistrement préparé. Validation Superadmin en attente.'
        : command.action === 'CONFIRM' ? 'Envoi du virement enregistré. Cela ne confirme pas sa réception par le Guide.'
          : 'Correction enregistrée. Les anciennes valeurs restent dans le journal d’audit.')
    } catch (cause) {
      setError(`${cause instanceof Error ? cause.message : 'Réponse non reçue.'} Vérifiez l’état rechargé avant toute nouvelle action.`)
    } finally {
      // A lost response may follow a committed write: read back, never retry POST.
      await reload()
      inFlight.current = false
      setBusy(false)
    }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="guide-transfers-title"
    onCancel={event => { event.preventDefault(); if (!inFlight.current) onClose() }}>
    <div className={styles.header}>
      <div><h2 id="guide-transfers-title">Virements aux Guides</h2><p>{data?.refNumber ?? 'Réservation'}</p></div>
      <button type="button" className={styles.close} aria-label="Fermer les virements" disabled={busy} onClick={onClose}><X size={22} /></button>
    </div>
    <p className={styles.notice}>Suivi d’un virement déjà effectué depuis votre banque. Aucun argent n’est envoyé depuis cet écran.</p>
    <p className={styles.help}>Versements en EUR, trois jours ouvrés après la fin du séjour (lundi à jeudi). Le délai de réception dépend ensuite de la banque du Guide. Un email est prévu à la confirmation ; les corrections ultérieures actualisent le dashboard sans nouvel email.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {message && <p role="status" className={styles.success}>{message}</p>}
    <div aria-busy={loading || busy}>
      {loading ? <p role="status" className={styles.loading}><LoaderCircle size={22} className={styles.spinner} /> Chargement des virements…</p>
        : data ? data.items.length ? data.items.map(item => <TransferItem key={`${item.earningId}-${version}`} item={item} busy={busy} send={send} />)
          : <p>Aucun revenu Guide enregistré pour cette réservation.</p>
        : <button type="button" className={styles.button} disabled={busy} onClick={() => { setError(''); void reload() }}>Réessayer le chargement</button>}
    </div>
  </dialog>
}

function TransferItem({ item, busy, send }: { item: Item; busy: boolean; send: (command: Command) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [reference, setReference] = useState(item.record?.bankReference ?? '')
  const [sentAt, setSentAt] = useState(localDate(item.record?.sentAt ?? null))
  const [reason, setReason] = useState('')
  const [review, setReview] = useState<Command | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [formError, setFormError] = useState('')
  const [loadedAt] = useState(() => Date.now())
  const { record, preparation } = item
  const dueInFuture = preparation ? new Date(preparation.dueAt).getTime() > loadedAt : false
  const frozen = item.reviewRequired || Boolean(item.blockedReason)
  const paid = record?.status === 'PAID' && Boolean(record.confirmedAt)

  function reviewForm(event: React.FormEvent) {
    event.preventDefault()
    setFormError('')
    const parsedDate = new Date(`${sentAt}+03:00`)
    const dueAt = record?.dueAt ?? preparation?.dueAt
    if (!reference.trim() || !Number.isFinite(parsedDate.getTime()) || parsedDate.getTime() > Date.now()
      || (dueAt && parsedDate < new Date(dueAt)) || (record && !reason.trim())) {
      setFormError('Vérifiez la référence, la date réelle d’envoi (après l’échéance, pas dans le futur) et le motif de correction.'); return
    }
    setAcknowledged(false)
    setReview({ action: record ? 'CORRECT' : 'PREPARE', input: {
      ...(record ? { transferId: record.id, revision: record.revision, reason: reason.trim() }
        : { earningId: item.earningId, sourceRevision: preparation!.sourceRevision }),
      bankReference: reference.trim(), sentAt: parsedDate.toISOString(),
    } })
  }

  return <section className={styles.item}>
    <div className={styles.itemHeader}><h3>{item.guideName}</h3><strong>{money(item.amountCents)}</strong></div>
    <p className={styles.status}>{item.reviewRequired ? 'Vérification Superadmin nécessaire' : paid ? 'Virement envoyé — enregistrement confirmé'
      : record ? 'Enregistrement en attente de validation Superadmin' : 'Aucun virement enregistré'}</p>
    {item.blockedReason && <div className={styles.error}>{item.blockedReason}
      {item.reviewRequired && <p>L’enregistrement original est conservé. Aucune modification, suppression ou nouvelle préparation possible ici.</p>}
    </div>}
    {record && <dl className={styles.details}>
      <div><dt>Référence bancaire</dt><dd>{record.bankReference}</dd></div>
      <div><dt>Envoi déclaré (Arabie saoudite)</dt><dd>{date(record.sentAt)}</dd></div>
      <div><dt>Préparé par</dt><dd>{record.preparedByEmail}</dd></div>
      <div><dt>Confirmé par</dt><dd>{record.confirmedByEmail ?? 'En attente'}</dd></div>
      {record.confirmedAt && <div><dt>Confirmation (Arabie saoudite)</dt><dd>{date(record.confirmedAt)}</dd></div>}
    </dl>}
    {paid && <p className={item.email?.status === 'FAILED' ? styles.error : styles.help}>
      Email de confirmation : {!item.email ? 'aucun envoi enregistré'
        : item.email.deliveredAt ? 'livraison confirmée par Brevo'
          : item.email.status === 'ACCEPTED' ? 'accepté par Brevo, livraison non confirmée'
            : ['QUEUED', 'SENDING', 'RETRY_PENDING'].includes(item.email.status) ? 'en attente de confirmation d’envoi'
              : `état ${item.email.status} — vérifier le suivi des emails`}. Aucun renvoi n’est déclenché par une correction.
    </p>}
    {preparation && <dl className={styles.details}>
      <div><dt>Titulaire approuvé</dt><dd>{preparation.accountHolder}</dd></div>
      <div><dt>Banque / IBAN masqué</dt><dd>{preparation.bankName} · •••• {preparation.ibanLast4}</dd></div>
      <div><dt>Échéance (Arabie saoudite)</dt><dd>{date(preparation.dueAt)}</dd></div>
    </dl>}
    {dueInFuture && <p className={styles.notice}>Échéance non atteinte : enregistrement indisponible pour le moment.</p>}
    {!frozen && review ? <div className={styles.review}>
      <h4>Vérifier avant {review.action === 'CONFIRM' ? 'validation' : 'enregistrement'}</h4>
      <p>{item.guideName} · <strong>{money(item.amountCents)}</strong> · EUR</p>
      <p>Référence : <strong>{String(review.input.bankReference ?? record?.bankReference ?? '')}</strong><br />
        Envoi déclaré : {date(String(review.input.sentAt ?? record?.sentAt ?? ''))} (Arabie saoudite)</p>
      {review.action === 'CORRECT' && <p>Motif : {String(review.input.reason)}</p>}
      <label className={styles.ack}><input type="checkbox" checked={acknowledged} disabled={busy} onChange={event => setAcknowledged(event.target.checked)} />
        Je confirme ces informations pour un virement réellement effectué. Cette action n’envoie aucun argent.</label>
      <div className={styles.actions}>
        <button type="button" className={styles.button} disabled={busy} onClick={() => setReview(null)}>Retour</button>
        <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy || !acknowledged} onClick={() => void send(review)}>
          {busy && <LoaderCircle size={17} className={styles.spinner} />}{busy ? 'Enregistrement…' : review.action === 'CONFIRM' ? 'Confirmer l’enregistrement' : 'Enregistrer'}</button>
      </div>
    </div> : !frozen && <>
      {(preparation && !dueInFuture || editing && item.canCorrect) && <form onSubmit={reviewForm}>
        <fieldset disabled={busy} className={styles.fields}>
          <label>Référence fournie par la banque<input required maxLength={200} value={reference} onChange={event => setReference(event.target.value)} /></label>
          <label>Date et heure réelles d’envoi (Arabie saoudite, UTC+3)<input required type="datetime-local" value={sentAt} onChange={event => setSentAt(event.target.value)} /></label>
          {record && <label>Motif de correction<textarea required maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} /></label>}
          {formError && <p role="alert" className={styles.error}>{formError}</p>}
          <div className={styles.actions}><button type="submit" className={`${styles.button} ${styles.primary}`}>Vérifier le récapitulatif</button>
            {record && <button type="button" className={styles.button} onClick={() => setEditing(false)}>Annuler la correction</button>}</div>
        </fieldset>
      </form>}
      {record && !editing && <div className={styles.actions}>
        {item.canConfirm && <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy} onClick={() => {
          setAcknowledged(false); setReview({ action: 'CONFIRM', input: { transferId: record.id, revision: record.revision } })
        }}>Vérifier et confirmer</button>}
        {item.canCorrect && <button type="button" className={styles.button} disabled={busy} onClick={() => setEditing(true)}>Corriger la référence ou la date</button>}
      </div>}
    </>}
  </section>
}
