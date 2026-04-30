'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'already';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const data = await res.json() as { already?: boolean; success?: boolean };

      if (data.already) {
        setStatus('already');
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p style={{ color: '#1D5C3A', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', padding: '0.75rem 0' }}>
        Vous etes inscrit ! Barak Allahu fik.
      </p>
    );
  }

  if (status === 'already') {
    return (
      <p style={{ color: '#7A6D5A', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', padding: '0.75rem 0' }}>
        Vous etes deja abonne.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '0.75rem', maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        disabled={status === 'loading'}
        style={{
          flex: 1,
          minWidth: 200,
          padding: '0.75rem 1rem',
          borderRadius: 50,
          border: '1px solid var(--sand-dark)',
          background: 'white',
          fontSize: '0.875rem',
          outline: 'none',
          color: 'var(--deep)',
          opacity: status === 'loading' ? 0.6 : 1,
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          background: 'var(--deep)',
          color: 'var(--gold-light)',
          padding: '0.75rem 1.5rem',
          borderRadius: 50,
          fontWeight: 700,
          fontSize: '0.82rem',
          border: 'none',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
      >
        {status === 'loading' ? 'Inscription...' : "S’abonner →"}
      </button>
      {status === 'error' && (
        <p style={{ width: '100%', textAlign: 'center', color: '#DC2626', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
          Une erreur est survenue. Reessayez.
        </p>
      )}
    </form>
  );
}
