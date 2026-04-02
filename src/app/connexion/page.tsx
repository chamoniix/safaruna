'use client';

import Link from 'next/link';
import { login } from './actions';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .login-input {
          width: 100%; padding: 12px 16px; border-radius: 10px;
          border: 1.5px solid #E8DFC8; background: #FDFBF7;
          font-size: 0.9rem; color: #1A1209; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: var(--font-manrope, sans-serif);
          box-sizing: border-box;
        }
        .login-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .login-input::placeholder { color: rgba(122,109,90,0.5); }
        .btn-email { transition: background 0.2s, transform 0.15s; }
        .btn-email:hover { background: #2D1F08 !important; transform: translateY(-1px); }
        .btn-google { transition: border-color 0.2s, background 0.2s; }
        .btn-google:hover { border-color: #C9A84C !important; background: #FDFBF7 !important; }
        .link-create:hover { text-decoration: underline; }
      `}} />

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF7F0', padding: '2rem 1rem',
        fontFamily: 'var(--font-manrope, sans-serif)',
      }}>
        {/* Subtle background texture */}
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 440,
          background: 'white', borderRadius: 24,
          boxShadow: '0 8px 48px rgba(26,18,9,0.08), 0 2px 12px rgba(26,18,9,0.04)',
          overflow: 'hidden',
        }}>
          {/* Gold top bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />

          <div style={{ padding: '2.5rem 2.5rem 2.25rem' }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', textDecoration: 'none', letterSpacing: '0.08em', display: 'inline-block' }}>
                SAFAR<span style={{ color: '#C9A84C' }}>U</span>NA
              </Link>
            </div>

            {/* Heading */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: 52,
                fontWeight: 600,
                color: '#1A1209',
                lineHeight: 1.05,
                marginBottom: '0.625rem',
              }}>
                Bon retour<br />parmi nous
              </h1>
              <p style={{ fontSize: 14, color: '#7A6D5A', lineHeight: 1.65, fontFamily: 'var(--font-manrope, sans-serif)' }}>
                Connectez-vous pour accéder<br />à votre espace de confiance.
              </p>
            </div>

            {/* Form */}
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Adresse e-mail
                </label>
                <input className="login-input" id="email" name="email" type="email" required placeholder="nom@exemple.com" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="password" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A' }}>
                    Mot de passe
                  </label>
                  <Link href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C9A84C', textDecoration: 'none' }}>Oublié ?</Link>
                </div>
                <input className="login-input" id="password" name="password" type="password" required placeholder="••••••••" />
              </div>

              <button formAction={login} className="btn-email" style={{
                width: '100%', padding: '13px', marginTop: '0.25rem',
                background: '#1A1209', color: '#F0D897',
                border: 'none', borderRadius: 50, cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em',
                fontFamily: 'var(--font-manrope, sans-serif)',
              }}>
                Se connecter avec Email
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E8DFC8' }} />
              <span style={{ fontSize: '0.8rem', color: '#7A6D5A', fontWeight: 500 }}>ou</span>
              <div style={{ flex: 1, height: 1, background: '#E8DFC8' }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="btn-google"
              onClick={() => signIn('google', { callbackUrl: '/espace/tableau-de-bord' })}
              style={{
                width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                background: 'white', border: '1px solid #E8DFC8', borderRadius: 50, cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 600, color: '#1A1209',
                fontFamily: 'var(--font-manrope, sans-serif)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>

            {/* Footer */}
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#7A6D5A', marginTop: '1.75rem', lineHeight: 1.6 }}>
              Nouveau sur SAFARUMA ?{' '}
              <Link href="/inscription" className="link-create" style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>
                Créer un profil gratuitement
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
