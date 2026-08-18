'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const data = new FormData(event.currentTarget)
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(result.error || 'Connexion impossible')
      setPending(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <div className="login-icon"><LockKeyhole size={22} /></div>
      <p className="eyebrow">Accès privé</p>
      <h1>SAFARUMA Analytics</h1>
      <p className="muted">Données de parcours, réservations, paiements et erreurs techniques.</p>
      <label htmlFor="username">Identifiant</label>
      <input id="username" name="username" autoComplete="username" required />
      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {error && <div className="form-error" role="alert">{error}</div>}
      <button type="submit" disabled={pending}>{pending ? 'Connexion…' : 'Se connecter'}</button>
    </form>
  )
}
