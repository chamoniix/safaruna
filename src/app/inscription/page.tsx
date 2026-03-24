'use client';

import Link from 'next/link';
import { signup } from '../connexion/actions';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] p-4 font-sans text-[var(--deep)] py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[var(--sand)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]"></div>
        
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif font-bold text-[var(--deep)] inline-block mb-2" style={{ textDecoration: 'none' }}>
            SAFAR<span className="text-[var(--gold)]">U</span>NA
          </Link>
          <h1 className="text-xl font-bold text-[var(--deep)] mt-4">Créer votre compte de confiance</h1>
          <p className="text-sm text-[var(--muted)] mt-2">Rejoignez la première plateforme dédiée aux guides d'Omra certifiés.</p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="first_name">Prénom</label>
              <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-pale)] outline-none transition-all" id="first_name" name="first_name" type="text" required placeholder="Karim" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="last_name">Nom</label>
              <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-pale)] outline-none transition-all" id="last_name" name="last_name" type="text" required placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="email">Adresse e-mail</label>
            <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none transition-all" id="email" name="email" type="email" required placeholder="karim@exemple.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="role">Mon objectif</label>
            <select className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none bg-white font-medium" id="role" name="role">
              <option value="pilgrim">Je cherche un guide pour mon Omra (Pèlerin)</option>
              <option value="guide">Je suis guide certifié (Mutawwif)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--deep)] mb-1.5" htmlFor="password">Mot de passe</label>
            <input className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] focus:border-[var(--gold)] outline-none transition-all" id="password" name="password" type="password" required placeholder="••••••••" />
            <p className="text-xs text-[var(--muted)] mt-1.5">Mínimum 8 caractères.</p>
          </div>
          
          <div className="mt-2 p-4 bg-[var(--cream)] rounded-xl border border-[var(--sand)]">
            <p className="text-xs text-[var(--muted)] leading-relaxed italic text-center">
              "Et remplissez l'engagement, car on sera interrogé au sujet des engagements" (Coran 17:34). En m'inscrivant, j'accepte la charte SAFARUNA.
            </p>
          </div>

          <button formAction={signup} className="w-full py-3.5 mt-2 bg-[#C9A84C] text-[#1A1209] font-bold rounded-xl hover:bg-[#8B6914] hover:text-white transition-all shadow-[0_4px_14px_rgba(201,168,76,0.4)] hover:-translate-y-0.5">
            M'inscrire avec Email
          </button>
        </form>

        <div className="relative flex items-center py-6 mt-2">
          <div className="flex-grow border-t border-[#E8DFC8]"></div>
          <span className="flex-shrink-0 mx-4 text-[#7A6D5A] font-medium text-sm">ou rapide</span>
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
          S'inscrire via Google
        </button>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Vous avez déjà un compte ? <Link href="/connexion" className="font-bold text-[var(--deep)] hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
