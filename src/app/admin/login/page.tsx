import { adminLogin } from './actions';

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0A05', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-manrope, sans-serif)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: 'white', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Administration
          </div>
        </div>

        <div style={{ background: '#1A1209', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #C9A84C, #F0D897, #C9A84C)' }} />

          <div style={{ padding: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem', textAlign: 'center' }}>
              Accès Administration
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: '2rem' }}>
              Accès réservé à l'équipe SAFARUMA
            </p>

            <form action={adminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem' }}>
                  Adresse email
                </label>
                <input
                  name="email" type="email" required
                  placeholder="admin@safaruma.com"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem' }}>
                  Mot de passe
                </label>
                <input
                  name="password" type="password" required
                  placeholder="••••••••••••"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                style={{ marginTop: '0.5rem', width: '100%', padding: '0.9rem', borderRadius: 50, border: 'none', background: '#C9A84C', color: '#1A1209', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Se connecter
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              Accès sur invitation uniquement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
