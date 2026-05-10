import LegalLayout, { h2 as h2Base, p, ul, li } from '@/components/LegalLayout';

const h2: React.CSSProperties = {
  ...h2Base,
  marginTop: '1.5rem',
  paddingTop: '1.5rem',
};

export const metadata = {
  title: 'Politique de confidentialité | SAFARUMA',
  description: 'Comment SAFARUMA collecte, utilise et protège vos données personnelles. Vos droits RGPD expliqués.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://safaruma.com/confidentialite' },
};

const h3: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant, serif)',
  fontSize: '1.1rem', fontWeight: 700, color: '#1A1209',
  marginTop: '1.25rem', marginBottom: '0.5rem',
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      subtitle="Comment nous collectons, utilisons et protégeons vos données personnelles"
      updated="10 mai 2026"
      toc={[
        { id: 'preambule',    label: '1. Préambule' },
        { id: 'responsable',  label: '2. Responsable du traitement' },
        { id: 'donnees',      label: '3. Données collectées' },
        { id: 'finalites',    label: '4. Finalités du traitement' },
        { id: 'bases',        label: '5. Bases légales' },
        { id: 'destinataires',label: '6. Destinataires des données' },
        { id: 'conservation', label: '7. Durée de conservation' },
        { id: 'securite',     label: '8. Sécurité' },
        { id: 'droits',       label: '9. Vos droits' },
        { id: 'modifications',label: '10. Modifications' },
        { id: 'contact',      label: '11. Contact' },
      ]}
    >

      <section id="preambule">
        <h2 style={h2}>1. Préambule</h2>
        <p style={p}>SAFARUMA est exploité par <strong>HOLDINGAI LTD</strong>, société immatriculée en Angleterre et au Pays de Galles (numéro 16382871), dont le siège social est situé Wareham Road, Freeland Park, Poole, BH16 6FA, Royaume-Uni.</p>
        <p style={p}>Nous accordons la plus grande importance à la protection de vos données personnelles. Cette politique vous explique quelles données nous collectons, pourquoi et comment nous les utilisons, avec qui nous les partageons, et quels sont vos droits.</p>
      </section>

      <section id="responsable">
        <h2 style={h2}>2. Responsable du traitement</h2>
        <div className="legal-box-gold">
          <div className="box-title">Coordonnées du responsable</div>
          <p style={{ ...p, marginBottom: 0 }}>
            <strong>HOLDINGAI LTD</strong><br />
            Wareham Road, Freeland Park, Poole, BH16 6FA, GB<br />
            Email : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a>
          </p>
        </div>
      </section>

      <section id="donnees">
        <h2 style={h2}>3. Données collectées</h2>

        <h3 style={h3}>3.1 Données fournies directement par vous</h3>
        <ul style={ul}>
          <li style={li}>Nom, prénom (lors de la création de compte ou d&apos;une réservation)</li>
          <li style={li}>Adresse email</li>
          <li style={li}>Numéro de téléphone (optionnel, pour communication WhatsApp)</li>
          <li style={li}>Pays de résidence</li>
          <li style={li}>Préférences de pèlerinage (langue, dates souhaitées, besoins spécifiques)</li>
        </ul>

        <h3 style={h3}>3.2 Données de paiement</h3>
        <p style={p}>Les données bancaires sont traitées exclusivement par <strong>Stripe</strong> (certifié PCI-DSS niveau 1). SAFARUMA n&apos;a jamais accès à vos informations bancaires complètes — nous ne recevons qu&apos;un identifiant de transaction et les 4 derniers chiffres de votre carte.</p>

        <h3 style={h3}>3.3 Données de navigation</h3>
        <ul style={ul}>
          <li style={li}>Adresse IP (anonymisée par Google Analytics 4)</li>
          <li style={li}>Type de navigateur et système d&apos;exploitation</li>
          <li style={li}>Pages consultées, durée de visite, source de trafic</li>
          <li style={li}>Pour le détail, consultez notre <a href="/cookies" style={{ color: '#C9A84C' }}>politique de cookies</a></li>
        </ul>
      </section>

      <section id="finalites">
        <h2 style={h2}>4. Finalités du traitement</h2>
        <ul style={ul}>
          <li style={li}>Créer et gérer votre compte utilisateur</li>
          <li style={li}>Traiter vos réservations de guides et les paiements associés</li>
          <li style={li}>Communiquer avec vous (confirmations de réservation, support, rappels)</li>
          <li style={li}>Améliorer notre service par l&apos;analyse anonyme des comportements de navigation</li>
          <li style={li}>Respecter nos obligations légales (comptabilité, fiscalité, lutte contre la fraude)</li>
          <li style={li}>Vous envoyer des communications marketing (uniquement si vous y avez consenti)</li>
        </ul>
      </section>

      <section id="bases">
        <h2 style={h2}>5. Bases légales</h2>
        <ul style={ul}>
          <li style={li}><strong>Exécution du contrat</strong> — traitement de votre réservation (Art. 6.1.b RGPD)</li>
          <li style={li}><strong>Intérêt légitime</strong> — amélioration du service, sécurité (Art. 6.1.f RGPD)</li>
          <li style={li}><strong>Consentement</strong> — cookies analytiques et marketing, newsletter (Art. 6.1.a RGPD)</li>
          <li style={li}><strong>Obligation légale</strong> — conservation comptable 5 ans (Art. 6.1.c RGPD)</li>
        </ul>
      </section>

      <section id="destinataires">
        <h2 style={h2}>6. Destinataires des données</h2>
        <p style={p}>Vos données peuvent être partagées avec les sous-traitants suivants, dans le strict cadre de leur mission :</p>
        <ul style={ul}>
          <li style={li}><strong>Guides certifiés SAFARUMA</strong> — nom, prénom, dates et préférences de réservation, pour l&apos;exécution de votre mission uniquement</li>
          <li style={li}><strong>Stripe</strong> — traitement sécurisé des paiements (PCI-DSS niveau 1)</li>
          <li style={li}><strong>Brevo</strong> — envoi des emails transactionnels (confirmations, réinitialisations de mot de passe)</li>
          <li style={li}><strong>Google Analytics</strong> — mesure d&apos;audience anonyme (uniquement si consentement)</li>
          <li style={li}><strong>Vercel</strong> — hébergement de l&apos;application</li>
          <li style={li}><strong>Neon</strong> — base de données chiffrée</li>
          <li style={li}><strong>Sentry</strong> — monitoring des erreurs techniques</li>
        </ul>
        <p style={p}>Aucune donnée personnelle n&apos;est vendue à des tiers. Les transferts hors UE/UK se font avec des garanties équivalentes (clauses contractuelles types ou Privacy Shield successeur).</p>
      </section>

      <section id="conservation">
        <h2 style={h2}>7. Durée de conservation</h2>
        <ul style={ul}>
          <li style={li}><strong>Compte client actif</strong> — durée de l&apos;inscription + 3 ans après dernière activité</li>
          <li style={li}><strong>Données de réservation</strong> — 5 ans (obligation comptable légale)</li>
          <li style={li}><strong>Données de navigation</strong> — 13 mois (cookies analytiques GA4)</li>
          <li style={li}><strong>Consentement cookies</strong> — 13 mois (recommandation CNIL)</li>
          <li style={li}><strong>Données marketing</strong> — jusqu&apos;au retrait de votre consentement</li>
        </ul>
      </section>

      <section id="securite">
        <h2 style={h2}>8. Sécurité</h2>
        <p style={p}>Nous mettons en œuvre des mesures techniques et organisationnelles adaptées :</p>
        <ul style={ul}>
          <li style={li}>Chiffrement TLS/HTTPS pour tous les échanges de données</li>
          <li style={li}>Hashage des mots de passe (bcrypt, facteur de coût élevé)</li>
          <li style={li}>Accès aux données restreint par rôle (RBAC) — les guides n&apos;accèdent qu&apos;à leurs propres réservations</li>
          <li style={li}>Jetons CSRF sur tous les formulaires sensibles</li>
          <li style={li}>Sauvegardes régulières chiffrées de la base de données</li>
          <li style={li}>Monitoring des erreurs et alertes via Sentry</li>
        </ul>
      </section>

      <section id="droits">
        <h2 style={h2}>9. Vos droits</h2>
        <p style={p}>Conformément au RGPD, vous disposez des droits suivants, exerçables à tout moment :</p>
        <ul style={ul}>
          <li style={li}><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données personnelles</li>
          <li style={li}><strong>Droit de rectification</strong> — corriger des données inexactes ou incomplètes</li>
          <li style={li}><strong>Droit à l&apos;effacement</strong> — «droit à l&apos;oubli» dans les limites légales</li>
          <li style={li}><strong>Droit à la limitation</strong> — restreindre le traitement dans certains cas</li>
          <li style={li}><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré</li>
          <li style={li}><strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements (notamment marketing)</li>
          <li style={li}><strong>Retrait du consentement</strong> — à tout moment, sans préjudice des traitements passés</li>
        </ul>
        <p style={p}>Pour exercer ces droits : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a>. Nous répondons sous 30 jours. En cas de réponse insatisfaisante, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>CNIL</a> ou l&apos;autorité de contrôle de votre pays de résidence.</p>
      </section>

      <section id="modifications">
        <h2 style={h2}>10. Modifications de cette politique</h2>
        <p style={p}>Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut du document. En cas de modification substantielle affectant vos droits, vous serez informé par email avec un préavis de 30 jours ou par bannière sur le site.</p>
      </section>

      <section id="contact">
        <h2 style={h2}>11. Contact</h2>
        <p style={p}>Pour toute question relative à cette politique ou à vos données :</p>
        <ul style={ul}>
          <li style={li}>Email : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a></li>
          <li style={li}>Courrier : HOLDINGAI LTD, Wareham Road, Freeland Park, Poole, BH16 6FA, GB</li>
        </ul>
      </section>

    </LegalLayout>
  );
}
