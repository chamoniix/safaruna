import LegalLayout, { h2, p, ul, li } from '@/components/LegalLayout';

export const metadata = {
  title: 'Politique de confidentialité — SAFARUMA',
  description: 'Comment SAFARUMA collecte, utilise et protège vos données personnelles. Vos droits RGPD.',
  robots: { index: false },
};

export default function PolitiqueConfidentialite() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      subtitle="Vos données, votre vie privée, notre engagement"
      toc={[
        { id: 'collecte',      label: '1. Données collectées' },
        { id: 'utilisation',   label: '2. Utilisation des données' },
        { id: 'paiements',     label: '3. Paiements et sécurité' },
        { id: 'partage',       label: '4. Partage des données' },
        { id: 'droits',        label: '5. Vos droits RGPD' },
        { id: 'conservation',  label: '6. Conservation' },
        { id: 'cookies',       label: '7. Cookies' },
        { id: 'contact',       label: '8. Contact DPO' },
      ]}
    >

      <section id="collecte">
        <h2 style={h2}>1. Données collectées</h2>
        <p style={p}>Lors de votre utilisation de la plateforme HOLDINGAI LTD (SAFARUMA), nous collectons les données suivantes :</p>
        <div className="legal-box-gold">
          <div className="box-title">Données d'identité et de contact</div>
          <ul style={ul}>
            <li style={li}><strong>Nom et prénom</strong> (obligatoire)</li>
            <li style={li}><strong>Adresse email</strong> (obligatoire)</li>
            <li style={li}><strong>Numéro de téléphone / WhatsApp</strong> (obligatoire)</li>
            <li style={li}>Ville de résidence, nationalité</li>
            <li style={li}>Photo de profil (optionnel)</li>
          </ul>
        </div>
        <div className="legal-box-gold">
          <div className="box-title">Données d'utilisation</div>
          <ul style={ul}>
            <li style={li}><strong>Historique des réservations</strong></li>
            <li style={li}><strong>Messages échangés</strong> via la messagerie SAFARUMA</li>
            <li style={li}>Avis laissés et reçus</li>
            <li style={li}>Dates de connexion et d'activité</li>
          </ul>
        </div>
        <div className="legal-box-gold">
          <div className="box-title">Données spécifiques aux Guides</div>
          <ul style={ul}>
            <li style={li}>Certifications et diplômes (documents téléversés)</li>
            <li style={li}>Langues parlées, lieux maîtrisés</li>
            <li style={li}>Coordonnées bancaires (IBAN — transmis à notre prestataire de paiement)</li>
            <li style={li}>Disponibilités et tarifs</li>
          </ul>
        </div>
      </section>

      <section id="utilisation">
        <h2 style={h2}>2. Utilisation des données</h2>
        <p style={p}>Vos données sont utilisées exclusivement pour :</p>
        <ul style={ul}>
          <li style={li}>La création et la gestion de votre compte</li>
          <li style={li}>La mise en relation entre pèlerins et guides</li>
          <li style={li}>Le traitement des réservations et paiements</li>
          <li style={li}>La messagerie interne sécurisée</li>
          <li style={li}>L'amélioration de nos services et de l'expérience utilisateur</li>
          <li style={li}>La prévention des fraudes et la sécurité de la plateforme</li>
          <li style={li}>L'envoi d'emails transactionnels (confirmation de réservation, rappels)</li>
          <li style={li}>Le respect de nos obligations légales et fiscales</li>
        </ul>
        <p style={p}><strong>Base légale :</strong> exécution du contrat (CGU), intérêt légitime (sécurité, amélioration), obligation légale (comptabilité, fiscalité).</p>
      </section>

      <section id="paiements">
        <h2 style={h2}>3. Paiements et sécurité financière</h2>
        <p style={p}>Tous les paiements sont traités par <strong>Stripe</strong>, prestataire de paiement certifié PCI-DSS niveau 1.</p>
        <div className="legal-box-red">
          <div className="box-title">Engagement fort</div>
          <p style={{ ...p, marginBottom: 0 }}><strong>SAFARUMA ne stocke jamais vos numéros de carte bancaire</strong>, codes CVV ou données sensibles de paiement. Ces informations transitent uniquement via les serveurs sécurisés de Stripe. SAFARUMA n'y accède pas.</p>
        </div>
        <p style={p}>Les données de facturation (montants, dates, identifiants de transaction) sont conservées pour respecter nos obligations comptables et légales (durée : 10 ans).</p>
        <p style={p}>Pour la politique de confidentialité de Stripe : <a href="https://stripe.com/fr/privacy" style={{ color: '#C9A84C' }} target="_blank" rel="noopener noreferrer">stripe.com/fr/privacy</a></p>
      </section>

      <section id="partage">
        <h2 style={h2}>4. Partage des données</h2>
        <p style={p}><strong>SAFARUMA ne vend jamais vos données à des tiers.</strong> Vos données personnelles ne sont partagées qu'avec :</p>
        <ul style={ul}>
          <li style={li}><strong>Stripe</strong> — pour le traitement des paiements</li>
          <li style={li}><strong>Brevo (Sendinblue)</strong> — pour l'envoi d'emails transactionnels</li>
          <li style={li}><strong>Vercel</strong> — hébergeur de l'infrastructure</li>
          <li style={li}><strong>L'autre partie à votre réservation</strong> — le guide voit vos coordonnées de contact après confirmation, et vice-versa</li>
          <li style={li}><strong>Autorités légales</strong> — uniquement si requis par une obligation légale ou décision judiciaire</li>
        </ul>
        <p style={p}>Tous nos sous-traitants sont conformes au UK GDPR et Data Protection Act 2018, et liés par des clauses contractuelles de protection des données.</p>
      </section>

      <section id="droits">
        <h2 style={h2}>5. Vos droits RGPD</h2>
        <p style={p}>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul style={ul}>
          <li style={li}><strong>Droit d'accès</strong> — obtenir une copie de vos données</li>
          <li style={li}><strong>Droit de rectification</strong> — corriger des informations inexactes</li>
          <li style={li}><strong>Droit à l'effacement</strong> — demander la suppression de vos données (« droit à l'oubli »)</li>
          <li style={li}><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré et lisible</li>
          <li style={li}><strong>Droit d'opposition</strong> — vous opposer au traitement de vos données</li>
          <li style={li}><strong>Droit à la limitation</strong> — restreindre temporairement le traitement</li>
        </ul>
        <div className="legal-box-gold">
          <div className="box-title">Comment exercer vos droits</div>
          <p style={{ ...p, marginBottom: '0.5rem' }}>Envoyez votre demande par email à : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C', fontWeight: 700 }}>contact@safaruma.com</a></p>
          <p style={{ ...p, marginBottom: 0 }}>Délai de réponse : <strong>30 jours maximum</strong> conformément au UK GDPR. En cas d'insatisfaction, vous pouvez adresser une réclamation à l'<strong>ICO</strong> (Information Commissioner's Office — ico.org.uk).</p>
        </div>
      </section>

      <section id="conservation">
        <h2 style={h2}>6. Conservation des données</h2>
        <ul style={ul}>
          <li style={li}><strong>Données de compte actif</strong> : conservées tant que le compte est actif</li>
          <li style={li}><strong>Données après fermeture de compte</strong> : <strong>3 ans</strong> après la dernière activité</li>
          <li style={li}><strong>Données de facturation</strong> : 10 ans (obligation légale comptable)</li>
          <li style={li}><strong>Messages</strong> : 3 ans après la fin de la relation contractuelle</li>
          <li style={li}><strong>Logs de sécurité</strong> : 1 an</li>
        </ul>
        <p style={p}>À l'issue des périodes de conservation, vos données sont supprimées de façon sécurisée ou anonymisées de manière irréversible.</p>
      </section>

      <section id="cookies">
        <h2 style={h2}>7. Cookies</h2>
        <p style={p}>SAFARUMA utilise uniquement :</p>
        <ul style={ul}>
          <li style={li}><strong>Cookies essentiels</strong> — nécessaires au fonctionnement (session, authentification, sécurité CSRF). Ne peuvent pas être désactivés.</li>
          <li style={li}><strong>Cookies analytiques anonymisés</strong> — mesure d'audience sans identification personnelle. Désactivables depuis vos paramètres.</li>
        </ul>
        <p style={p}><strong>Aucun</strong> cookie publicitaire, de ciblage ou de réseaux sociaux tiers n'est utilisé sur SAFARUMA.</p>
      </section>

      <section id="contact">
        <h2 style={h2}>8. Contact — Délégué à la Protection des Données</h2>
        <p style={p}>Pour toute question relative à vos données personnelles :</p>
        <p style={p}>
          <strong>Email :</strong> <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C', fontWeight: 700 }}>contact@safaruma.com</a><br />
          Objet recommandé : « UK GDPR — [votre demande] »
        </p>
        <p style={p}>Autorité de contrôle compétente : <strong>ICO</strong> — Information Commissioner's Office<br />Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF, United Kingdom — <a href="https://ico.org.uk" style={{ color: '#C9A84C' }} target="_blank" rel="noopener noreferrer">ico.org.uk</a></p>
      </section>

    </LegalLayout>
  );
}
