export default function AdminParametres() {
  return <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
    <section style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Comptes administrateurs sécurisés</h2>
      <p style={{ color: '#7A6D5A', lineHeight: 1.7 }}>Les anciens champs factices de mot de passe, maintenance et commission ont été retirés. Les comptes individuels SUPERADMIN et ADMIN seront activés depuis les variables sécurisées Vercel, puis stockés sous forme hachée avec sessions révocables.</p>
    </section>
    <section style={{ background: '#F8F6F2', border: '1px solid #E8DFC8', borderRadius: 12, padding: 24 }}>
      <strong>État actuel</strong>
      <p style={{ marginBottom: 0, color: '#7A6D5A' }}>En attente de l’initialisation des deux mots de passe. Aucun paramètre affiché ici n’est simulé.</p>
    </section>
  </div>
}
