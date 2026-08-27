'use client'

import { useFormStatus } from 'react-dom'
import styles from './login.module.css'

export default function AdminLoginSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={styles.submitButton}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending && <span className={styles.buttonSpinner} aria-hidden="true" />}
      <span>{pending ? 'Connexion…' : 'Se connecter'}</span>
    </button>
  )
}
