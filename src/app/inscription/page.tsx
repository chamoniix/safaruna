import Link from 'next/link';
import { signup } from '../connexion/actions';

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

          <button formAction={signup} className="w-full py-3.5 mt-2 bg-[var(--gold)] text-[var(--deep)] font-bold rounded-xl hover:bg-[var(--gold-dark)] hover:text-white transition-all shadow-[0_8px_20px_rgba(201,168,76,0.3)] hover:-translate-y-0.5">
            M'inscrire au nom d'Allah
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Vous avez déjà un compte ? <Link href="/connexion" className="font-bold text-[var(--deep)] hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
