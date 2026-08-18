import { redirect } from 'next/navigation'
import { hasValidSession } from '@/lib/auth'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await hasValidSession()) redirect('/')
  return <main className="login-shell"><LoginForm /></main>
}
