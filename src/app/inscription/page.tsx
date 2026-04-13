'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signup } from '../connexion/actions';
import { signIn } from 'next-auth/react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [pwdError, setPwdError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .inscription-wrap {
          min-height: 100vh;
          background: #FAF7F0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 16px 48px;
          font-family: var(--font-manrope, sans-serif);
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .inscription-card {
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 24px;
          padding: 48px;
          border: 1px solid #E8DFC8;
          box-shadow: 0 8px 40px rgba(26,18,9,0.07);
          position: relative;
          overflow: hidden;
        }
        .inscription-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #F0D897, #C9A84C);
        }
        .ins-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A6D5A;
          margin-bottom: 6px;
        }
        .ins-input {
          width: 100%;
          border: 1.5px solid #E8DFC8;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 15px;
          font-family: var(--font-manrope, sans-serif);
          color: #1A1209;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }
        .ins-input:focus {
          border-color: #C9A84C;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }
        .ins-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ins-btn-primary {
          width: 100%;
          height: 52px;
          background: #1A1209;
          color: #F0D897;
          border: none;
          border-radius: 50px;
          font-family: var(--font-manrope, sans-serif);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          letter-spacing: 0.02em;
        }
        .ins-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .ins-btn-google {
          width: 100%;
          height: 52px;
          background: white;
          color: #1A1209;
          border: 1.5px solid #E8DFC8;
          border-radius: 50px;
          font-family: var(--font-manrope, sans-serif);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.15s, background 0.15s;
        }
        .ins-btn-google:hover { border-color: #C9A84C; background: #FDFBF7; }
        @media (max-width: 768px) {
          .inscription-wrap { padding: 20px 16px 40px; align-items: flex-start; }
          .inscription-card { border-radius: 16px; padding: 24px; }
          .ins-row { grid-template-columns: 1fr; gap: 16px; }
        }
      `}} />

      <div className="inscription-wrap">
        <div className="inscription-card">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', textDecoration: 'none', letterSpacing: '0.04em', display: 'inline-block', marginBottom: '1.25rem' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 5vw, 2.25rem)', fontWeight: 700, color: '#1A1209', lineHeight: 1.1, margin: '0 0 0.5rem' }}>
              Rejoins la communauté SAFARUMA
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: 0 }}>
              Rejoignez la première plateforme dédiée aux guides pour la Omra certifiés.
            </p>
          </div>

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Prénom + Nom */}
            <div className="ins-row">
              <div>
                <label className="ins-label" htmlFor="first_name">Prénom</label>
                <input className="ins-input" id="first_name" name="first_name" type="text" required placeholder="Karim" />
              </div>
              <div>
                <label className="ins-label" htmlFor="last_name">Nom</label>
                <input className="ins-input" id="last_name" name="last_name" type="text" required placeholder="Dupont" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="ins-label" htmlFor="email">Adresse e-mail</label>
              <input className="ins-input" id="email" name="email" type="email" required placeholder="karim@exemple.com" />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="ins-label" htmlFor="whatsapp">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M11.999 2C6.476 2 2 6.477 2 12.001c0 1.762.461 3.413 1.268 4.852L2.046 21.5l4.748-1.194A9.946 9.946 0 0011.999 22c5.523 0 10-4.478 10-10.001C21.999 6.477 17.522 2 11.999 2z"/>
                  </svg>
                  WhatsApp
                </span>
              </label>
              <input
                className="ins-input"
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="+33 6 12 34 56 78"
              />
              <p style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 4, marginBottom: 0 }}>
                Pour recevoir les confirmations et offres de guides
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="ins-label" htmlFor="password">Mot de passe</label>
              <input
                className="ins-input"
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value && e.target.value.length < 8) {
                    setPwdError('Le mot de passe doit contenir au moins 8 caractères.');
                  } else {
                    setPwdError('');
                  }
                }}
              />
              {pwdError && <p style={{ fontSize: '0.72rem', color: '#C0392B', marginTop: 4, marginBottom: 0 }}>{pwdError}</p>}
              {!pwdError && <p style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 5, marginBottom: 0 }}>Minimum 8 caractères.</p>}
            </div>

            {/* Confirmation mot de passe */}
            <div className="ins-field">
              <label className="ins-label" htmlFor="confirmPassword">
                Confirmer votre mot de passe
              </label>
              <input
                className="ins-input"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {/* Verset */}
            <div style={{ padding: '14px 16px', background: '#FAF7F0', borderRadius: 8, border: '1px solid #E8DFC8' }}>
              <p style={{ fontSize: '0.8rem', color: '#7A6D5A', fontStyle: 'italic', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                &ldquo;Et remplissez l&apos;engagement, car on sera interrogé au sujet des engagements.&rdquo; (Coran 17:34)
              </p>
            </div>

            {/* Code parrainage — transmis silencieusement */}
            <input type="hidden" name="ref" value={refCode} />

            {/* Submit */}
            <button
              formAction={signup}
              className="ins-btn-primary"
              style={{ marginTop: 4, opacity: (password !== confirmPassword || loading) ? 0.5 : 1, cursor: (password !== confirmPassword || loading) ? 'not-allowed' : 'pointer' }}
              disabled={password !== confirmPassword || loading}
              onClick={() => setLoading(true)}
            >
              M&apos;inscrire avec Email
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E8DFC8' }} />
            <span style={{ fontSize: '0.8rem', color: '#7A6D5A', fontWeight: 500, whiteSpace: 'nowrap' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#E8DFC8' }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const redirect = params.get('redirect') || '/espace/tableau-de-bord';
              signIn('google', { callbackUrl: redirect });
            }}
            className="ins-btn-google"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            S&apos;inscrire via Google
          </button>

          {/* Lien connexion */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#7A6D5A', marginTop: '1.5rem', marginBottom: 0 }}>
            Déjà un compte ?{' '}
            <Link href="/connexion" style={{ fontWeight: 700, color: '#1A1209', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
