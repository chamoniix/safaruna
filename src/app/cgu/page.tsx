import LegalLayout, { h2, p, ul, li } from '@/components/LegalLayout';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation — SAFARUMA',
  description: 'CGU de la plateforme SAFARUMA : rôle d\'intermédiaire, paiements, commission, avis, responsabilité.',
};

export default function CGU() {
  return (
    <LegalLayout
      title="Conditions Générales d'Utilisation"
      subtitle="Les règles communes à tous les utilisateurs de SAFARUMA"
      toc={[
        { id: 'objet',          label: '1. Objet et champ d\'application' },
        { id: 'intermediaire',  label: '2. Rôle d\'intermédiaire' },
        { id: 'comptes',        label: '3. Création de compte' },
        { id: 'commission',     label: '4. Commission et paiements' },
        { id: 'interdictions',  label: '5. Interdictions absolues' },
        { id: 'avis',           label: '6. Système d\'avis' },
        { id: 'responsabilite', label: '7. Responsabilité' },
        { id: 'resiliation',    label: '8. Résiliation' },
        { id: 'droit',          label: '9. Droit applicable' },
      ]}
    >

      <section id="objet">
        <h2 style={h2}>1. Objet et champ d'application</h2>
        <p style={p}>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme SAFARUMA, accessible à l'adresse <strong>safaruma.com</strong>.</p>
        <p style={p}>En créant un compte ou en utilisant les services de SAFARUMA, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.</p>
        <p style={p}>Ces CGU s'appliquent à tous les utilisateurs : pèlerins, guides (Mutawwifin) et visiteurs. Des conditions spécifiques s'appliquent aux <a href="/conditions-guides" style={{ color: '#C9A84C' }}>Guides</a> et aux <a href="/conditions-clients" style={{ color: '#C9A84C' }}>Clients</a>.</p>
      </section>

      <section id="intermediaire">
        <h2 style={h2}>2. Rôle d'intermédiaire</h2>
        <div className="legal-box-gold">
          <div className="box-title">Statut de SAFARUMA</div>
          <p style={{ ...p, marginBottom: 0 }}>SAFARUMA est une <strong>plateforme d'intermédiation</strong>. SAFARUMA met en relation des pèlerins avec des guides privés certifiés, mais n'est pas partie au contrat de prestation qui lie le guide au client. SAFARUMA n'est pas un employeur de guides et ne fournit pas directement des services de guidage.</p>
        </div>
        <p style={p}>SAFARUMA s'engage à :</p>
        <ul style={ul}>
          <li style={li}>Vérifier l'identité et les certifications des guides avant activation de leur profil</li>
          <li style={li}>Sécuriser les paiements et les fonds jusqu'à la fin de mission</li>
          <li style={li}>Fournir une messagerie sécurisée entre parties</li>
          <li style={li}>Arbitrer les litiges dans un délai de 48 heures</li>
          <li style={li}>Protéger les données personnelles conformément au RGPD</li>
        </ul>
      </section>

      <section id="comptes">
        <h2 style={h2}>3. Création de compte</h2>
        <p style={p}>Pour utiliser SAFARUMA, vous devez créer un compte en fournissant des informations exactes, complètes et à jour. Vous vous engagez à :</p>
        <ul style={ul}>
          <li style={li}>Ne créer qu'un seul compte par personne</li>
          <li style={li}>Maintenir la confidentialité de vos identifiants</li>
          <li style={li}>Informer immédiatement SAFARUMA de toute utilisation non autorisée de votre compte</li>
          <li style={li}>Être âgé(e) d'au moins 18 ans</li>
        </ul>
        <p style={p}>SAFARUMA se réserve le droit de suspendre ou supprimer tout compte fournissant des informations fausses ou incomplètes.</p>
      </section>

      <section id="commission">
        <h2 style={h2}>4. Commission et paiements</h2>
        <p style={p}>SAFARUMA perçoit une <strong>commission de 12%</strong> sur le montant total de chaque réservation confirmée, prélevée automatiquement lors du paiement.</p>
        <p style={p}>Tous les paiements sont traités via <strong>Stripe</strong> (certifié PCI-DSS niveau 1). Les fonds sont conservés en séquestre par SAFARUMA jusqu'à la fin de mission, puis virés au guide dans les délais prévus.</p>
        <div className="legal-box-gold">
          <div className="box-title">Séquestre et protection</div>
          <p style={{ ...p, marginBottom: 0 }}>En cas de litige non résolu avant le virement, les fonds peuvent être temporairement bloqués le temps de l'arbitrage. Cette mesure protège les deux parties.</p>
        </div>
      </section>

      <section id="interdictions">
        <h2 style={h2}>5. Interdictions absolues</h2>
        <div className="legal-box-red">
          <div className="box-title">Tolérance zéro — Sanctions immédiates</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Paiement direct hors plateforme</strong> — entre guide et client, contournant SAFARUMA</li>
            <li style={li}><strong>Fausses informations</strong> — identité, certifications, expérience</li>
            <li style={li}><strong>Harcèlement ou intimidation</strong> — de l'autre partie pour tout motif</li>
            <li style={li}><strong>Utilisation de plusieurs comptes</strong> pour contourner des sanctions</li>
            <li style={li}><strong>Publication de contenu illicite</strong>, offensant ou discriminatoire</li>
            <li style={li}><strong>Tentative de piratage</strong> ou d'accès non autorisé à la plateforme</li>
          </ul>
        </div>
        <p style={p}>Toute violation entraîne la <strong>suspension immédiate du compte</strong>, sans préavis, et potentiellement des poursuites judiciaires. Les fonds éventuellement détenus peuvent être retenus pendant la durée d'investigation.</p>
      </section>

      <section id="avis">
        <h2 style={h2}>6. Système d'avis</h2>
        <p style={p}>SAFARUMA garantit l'intégrité de son système d'avis :</p>
        <ul style={ul}>
          <li style={li}>Les avis ne peuvent être laissés qu'après une <strong>mission réellement effectuée</strong> — aucun avis anonyme ou non vérifié n'est accepté</li>
          <li style={li}>Les deux parties (guide et pèlerin) peuvent noter la mission</li>
          <li style={li}>Tout avis frauduleux, partial ou utilisé comme outil de chantage fait l'objet d'une investigation et peut être supprimé</li>
          <li style={li}>Il est <strong>interdit</strong> de promettre un avis positif en échange d'une remise ou d'un avantage</li>
        </ul>
      </section>

      <section id="responsabilite">
        <h2 style={h2}>7. Responsabilité</h2>
        <p style={p}>En tant qu'intermédiaire, la <strong>responsabilité de SAFARUMA est limitée à son rôle de plateforme</strong>. SAFARUMA ne saurait être tenu responsable :</p>
        <ul style={ul}>
          <li style={li}>Des actes, omissions ou comportements des guides ou des clients</li>
          <li style={li}>De la qualité intrinsèque des prestations délivrées</li>
          <li style={li}>Des incidents survenus pendant le pèlerinage</li>
          <li style={li}>Des dommages résultant d'une force majeure</li>
        </ul>
        <p style={p}>SAFARUMA s'engage en revanche à arbitrer équitablement tout litige et à mettre en œuvre tous les moyens raisonnables pour protéger ses utilisateurs.</p>
      </section>

      <section id="resiliation">
        <h2 style={h2}>8. Résiliation</h2>
        <p style={p}>Vous pouvez fermer votre compte à tout moment depuis vos paramètres ou en contactant <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a>. La fermeture prend effet sous 7 jours ouvrés.</p>
        <p style={p}>SAFARUMA peut résilier votre compte avec préavis de 30 jours pour non-respect des CGU, ou immédiatement en cas de violation grave (fraude, harcèlement, etc.).</p>
      </section>

      <section id="droit">
        <h2 style={h2}>9. Droit applicable et juridiction</h2>
        <p style={p}>Les présentes CGU sont régies par le <strong>droit français</strong>. En cas de litige non résolu à l'amiable, compétence exclusive est attribuée aux <strong>tribunaux de Paris</strong>.</p>
        <p style={p}>SAFARUMA se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés de toute modification significative par email avec un préavis de 30 jours.</p>
      </section>

    </LegalLayout>
  );
}
