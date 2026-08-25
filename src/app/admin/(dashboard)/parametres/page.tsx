'use client';

import { useEffect, useState } from 'react';

type AdminIdentity = {
  email: string;
  role: 'SUPERADMIN' | 'ADMIN';
  individualAccount: boolean;
};

type AccountState =
  | { status: 'loading'; admin: null }
  | { status: 'ready'; admin: AdminIdentity }
  | { status: 'error'; admin: null };

export default function AdminParametres() {
  const [account, setAccount] = useState<AccountState>({ status: 'loading', admin: null });

  useEffect(() => {
    let active = true;

    fetch('/api/admin/me', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Compte non disponible');
        return response.json() as Promise<{ admin?: AdminIdentity }>;
      })
      .then(data => {
        if (!active) return;
        if (!data.admin) throw new Error('Identité administrateur absente');
        setAccount({ status: 'ready', admin: data.admin });
      })
      .catch(() => {
        if (active) setAccount({ status: 'error', admin: null });
      });

    return () => { active = false; };
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <section style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Compte administrateur</h2>
        {account.status === 'loading' && (
          <p style={{ marginBottom: 0, color: '#7A6D5A' }}>Vérification du compte…</p>
        )}
        {account.status === 'error' && (
          <p style={{ marginBottom: 0, color: '#B91C1C' }}>Impossible de vérifier le compte actif. Rechargez la page ou reconnectez-vous.</p>
        )}
        {account.status === 'ready' && (
          <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 180px) 1fr', gap: '0.75rem 1rem', margin: 0 }}>
            <dt style={{ color: '#7A6D5A' }}>Adresse e-mail</dt>
            <dd style={{ margin: 0, fontWeight: 700, overflowWrap: 'anywhere' }}>{account.admin.email}</dd>
            <dt style={{ color: '#7A6D5A' }}>Rôle</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{account.admin.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin'}</dd>
            <dt style={{ color: '#7A6D5A' }}>Compte individuel</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{account.admin.individualAccount ? 'Vérifié' : 'Non vérifié'}</dd>
            <dt style={{ color: '#7A6D5A' }}>Session</dt>
            <dd style={{ margin: 0, fontWeight: 700, color: '#166534' }}>Active</dd>
          </dl>
        )}
      </section>

      <section style={{ background: '#F8F6F2', border: '1px solid #E8DFC8', borderRadius: 12, padding: 24 }}>
        <strong>Sécurité du mot de passe</strong>
        <p style={{ marginBottom: 0, color: '#7A6D5A', lineHeight: 1.7 }}>
          Le mot de passe n’est jamais affiché. Sa modification passe par la procédure sécurisée de réinitialisation depuis la page de connexion.
        </p>
      </section>
    </div>
  );
}
