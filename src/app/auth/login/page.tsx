import Link from 'next/link'
import { login } from '../actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] p-4 font-sans text-[var(--deep)]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[var(--sand)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]"></div>
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif font-bold text-[var(--deep)] inline-block mb-2" style={{ textDecoration: 'none' }}>
            SAFAR<span className="text-[var(--gold)]">U</span>NA
          </Link>
          <h1 className="text-xl font-bold text-[var(--deep)] mt-4">Bon retour parmi nous</h1>
          <p className="text-sm text-[var(--muted)] mt-2">Connectez-vous pour accéder à votre espace de confiance.</p>
        </div>

        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="email">Adresse e-mail</label>
            <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-pale)] outline-none transition-all" id="email" name="email" type="email" required placeholder="nom@exemple.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-[var(--deep)]" htmlFor="password">Mot de passe</label>
              <Link href="#" className="text-xs font-semibold text-[var(--gold-dark)] hover:underline">Oublié ?</Link>
            </div>
            <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-pale)] outline-none transition-all" id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <button formAction={login} className="w-full py-3.5 mt-4 bg-[var(--deep)] text-[var(--gold-light)] font-bold rounded-xl hover:bg-[var(--warm)] transition-transform hover:-translate-y-0.5 shadow-lg">
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Nouveau sur SAFARUNA ? <br/><Link href="/auth/register" className="font-bold text-[var(--gold-dark)] hover:underline mt-1 inline-block">Créer un profil gratuitement</Link>
        </p>
      </div>
    </div>
  )
}
