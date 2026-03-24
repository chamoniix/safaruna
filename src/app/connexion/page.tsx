'use client';

import Link from 'next/link';
import { login } from './actions';
import { signIn } from 'next-auth/react';

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
          <button formAction={login} className="w-full py-3.5 mt-4 bg-[#1A1209] text-[#F0D897] font-bold rounded-xl hover:bg-[#3D2A10] transition-transform hover:-translate-y-0.5 shadow-lg relative overflow-hidden group">
            <span className="relative z-10">Se connecter avec Email</span>
            <div className="absolute inset-0 bg-[#C9A84C]/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </button>
        </form>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-[#E8DFC8]"></div>
          <span className="flex-shrink-0 mx-4 text-[#7A6D5A] font-medium text-sm">ou</span>
          <div className="flex-grow border-t border-[#E8DFC8]"></div>
        </div>

        <button 
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/espace/tableau-de-bord' })}
          className="w-full bg-white border border-[#E8DFC8] text-[#1A1209] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#FDFBF7] hover:border-[#C9A84C] transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuer avec Google
        </button>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Nouveau sur SAFARUNA ? <br/><Link href="/inscription" className="font-bold text-[var(--gold-dark)] hover:underline mt-1 inline-block">Créer un profil gratuitement</Link>
        </p>
      </div>
    </div>
  )
}
