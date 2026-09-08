'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, LoaderCircle, Upload, X } from 'lucide-react'
import styles from './GuidePhotoEditor.module.css'

type PhotoState = { image: string | null; version: string; canPublish: boolean }
type Props = { slug: string; name: string; email: string | null; registeredAt: string; initials: string }
const MAX_BYTES = 4_000_000

export default function GuidePhotoEditor({ slug, name, email, registeredAt, initials }: Props) {
  const [photo, setPhoto] = useState<PhotoState | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const inFlight = useRef(false)
  const endpoint = `/api/admin/guides/${encodeURIComponent(slug)}/photo`

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint, { cache: 'no-store', signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Impossible de charger la photo.')
      if (!signal?.aborted) setPhoto(data)
    } catch (cause) {
      if (!signal?.aborted) {
        setPhoto(null)
        setError(cause instanceof Error ? cause.message : 'Impossible de charger la photo.')
      }
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [endpoint])

  useEffect(() => {
    const controller = new AbortController()
    void reload(controller.signal)
    return () => controller.abort()
  }, [reload])

  useEffect(() => {
    setPreview(null)
    if (!file) return
    // Local data URL: compatible with the existing CSP, no upload before confirmation.
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.onerror = () => { setError('Impossible de lire cette photo.'); setFile(null) }
    reader.readAsDataURL(file)
    return () => { reader.onload = null; reader.onerror = null; if (reader.readyState === 1) reader.abort() }
  }, [file])

  function clearSelection() {
    setFile(null)
    setPreview(null)
    if (input.current) input.current.value = ''
  }

  async function publish() {
    if (inFlight.current || !file || !preview || !photo?.canPublish) return
    inFlight.current = true
    setPublishing(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'If-Match': photo.version },
        body: file,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Publication non confirmée.')
      setPhoto(data)
      clearSelection()
      setMessage('La nouvelle photo a été publiée. L’ancienne photo est conservée.')
    } catch (cause) {
      // Do not automatically retry a write after a timeout or conflict.
      clearSelection()
      setError(cause instanceof Error ? cause.message : 'Publication non confirmée. Vérifiez la photo actuelle.')
      await reload()
    } finally {
      inFlight.current = false
      setPublishing(false)
    }
  }

  return <div className={styles.root} aria-busy={loading || publishing}>
    <div className={styles.row}>
      {loading ? <LoaderCircle className={styles.spinner} size={28} aria-label="Chargement de la photo" />
        : photo?.image ? <img src={photo.image} alt={`Photo publiée de ${name}`} width={56} height={56} className={styles.avatar} />
          : <div className={`${styles.avatar} ${styles.fallback}`}>{initials}</div>}
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1209' }}>{name}</div>
        <div style={{ fontSize: '0.8rem', color: '#7A6D5A' }}>{email}</div>
        <div style={{ fontSize: '0.72rem', color: '#9A8A7A', marginTop: 2 }}>Inscrit le {new Date(registeredAt).toLocaleDateString('fr-FR')}</div>
      </div>
      {photo?.canPublish && <div className={styles.controls}>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className={styles.fileInput} tabIndex={-1} aria-label="Nouvelle photo du guide" disabled={publishing || loading}
          onChange={event => {
            setError(''); setMessage('')
            const selected = event.target.files?.[0]
            if (!selected) return
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || !selected.size || selected.size > MAX_BYTES) {
              clearSelection(); setError('Choisissez une photo JPEG, PNG ou WebP de 4 Mo maximum.'); return
            }
            setFile(selected)
          }} />
        <button type="button" className={`${styles.button} ${styles.replace}`} disabled={publishing || loading} onClick={() => input.current?.click()}>
          <Camera size={16} aria-hidden="true" />Remplacer la photo
        </button>
      </div>}
    </div>
    {!loading && photo && <p className={styles.help}>{photo.image ? 'Photo actuellement publiée' : 'Aucune photo publiée'} · Publication réservée au Superadmin.</p>}
    {file && <div className={styles.preview}>
      <p className={styles.title}>Nouvelle photo — aperçu avant publication</p>
      {preview ? <img src={preview} alt="Aperçu de la nouvelle photo, non publiée" className={styles.photo} /> : <LoaderCircle className={styles.spinner} aria-label="Préparation de l’aperçu" />}
      <p className={styles.help}>{Math.ceil(file.size / 1000)} Ko · JPEG, PNG ou WebP · 4 Mo maximum. La photo n’est envoyée qu’après confirmation.</p>
      <div className={styles.actions}>
        <button type="button" disabled={publishing || loading || !preview} onClick={publish} className={`${styles.button} ${styles.primary}`}>
          {publishing ? <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
          {publishing ? 'Publication en cours…' : 'Publier cette photo'}
        </button>
        <button type="button" disabled={publishing} onClick={clearSelection} className={`${styles.button} ${styles.secondary}`}><X size={16} aria-hidden="true" />Annuler</button>
      </div>
    </div>}
    {error && <div role="alert" className={styles.error}>
      {error}
      {!photo && !loading && <button type="button" className={styles.retry} onClick={() => { setError(''); void reload() }}>Recharger la photo</button>}
    </div>}
    {message && <p role="status" className={styles.success}>{message}</p>}
  </div>
}
