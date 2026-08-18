'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <button
      className="logout"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await fetch('/api/logout', { method: 'POST' })
        router.replace('/login')
        router.refresh()
      }}
    >
      <LogOut size={15} /> {pending ? 'Déconnexion…' : 'Déconnexion'}
    </button>
  )
}
