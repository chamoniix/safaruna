import LegalLayout, { h2, p, ul, li } from '@/components/LegalLayout';

export const metadata = {
  title: 'Conditions Clients — SAFARUMA',
  description: 'Contrat Clients SAFARUMA : réservations, remboursements, protection contre les fraudes, litiges.',
  robots: { index: false },
};

export default function ConditionsClients() {
  return (
    <LegalLayout
      title="Conditions Clients"
      subtitle="Votre contrat avec SAFARUMA — Vos droits et garanties"
      toc={[
        { id: 'reservations', label: '1. Réservations' },
        { id: 'annulation',   label: '2. Politique d\'annulation' },
        { id: 'fraudes',      label: '3. Fraudes — Tolérance zéro' },
        { id: 'litiges',      label: '4. Litiges' },
        { id: 'garanties',    label: '5. Garanties SAFARUMA' },
        { id: 'droit',        label: '6. Droit applicable' },
      ]}
    >

      <section id="reservations">
        <h2 style={h2}>1. Réservations</h2>
        <div className="legal-box-gold">
          <div className="box-title">Fonctionnement de la réservation</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Réservation confirmée = contrat ferme</strong> entre vous et le guide</li>
            <li style={li}><strong>Paiement intégral débité</strong> à la confirmation de la réservation</li>
            <li style={li}><strong>Fonds sécurisés en séquestre</strong> chez SAFARUMA jusqu'à la fin de la mission</li>
            <li style={li}>Les fonds sont libérés au guide <strong>uniquement après</strong> la fin de la mission sans litige</li>
          </ul>
        </div>
        <p style={p}>Avant de confirmer une réservation, assurez-vous d'avoir vérifié le profil du guide, ses certifications, ses tarifs et sa politique d'annulation. En confirmant, vous acceptez les conditions du guide et les présentes conditions.</p>
        <p style={p}>La messagerie SAFARUMA est le canal officiel de communication avec votre guide. Les échanges hors plateforme ne sont pas reconnus comme preuves en cas de litige.</p>
      </section>

      <section id="annulation">
        <h2 style={h2}>2. Politique d'annulation (par le Client)</h2>
        <div className="legal-box-gold">
          <div className="box-title">Barème de remboursement</div>
          <ul style={{ ...ul, marginBottom: '0.25rem' }}>
            <li style={li}><strong>Plus de 7 jours avant la mission</strong> : <strong>remboursement intégral</strong></li>
            <li style={li}><strong>Entre 7 jours et 48h avant</strong> : <strong>remboursement à 50%</strong></li>
            <li style={li}><strong>Moins de 48h avant</strong> : <strong>aucun remboursement</strong></li>
            <li style={li}><strong>No-show (absence sans prévenir)</strong> : <strong>aucun remboursement</strong></li>
          </ul>
        </div>
        <div className="legal-box-gold">
          <div className="box-title">Force majeure documentée</div>
          <p style={{ ...p, marginBottom: 0 }}>En cas de <strong>maladie grave avec certificat médical</strong>, <strong>décès d'un proche</strong> ou <strong>refus de visa officiel</strong>, un remboursement intégral est étudié au cas par cas sur présentation des justificatifs. Contactez <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a> dès que possible.</p>
        </div>
      </section>

      <section id="fraudes">
        <h2 style={h2}>3. Fraudes — Tolérance zéro</h2>
        <p style={p}>SAFARUMA protège l'intégrité de sa plateforme et des guides contre les comportements frauduleux des clients :</p>
        <div className="legal-box-red">
          <div className="box-title">Fraudes clients — Sanctions et contre-mesures</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Chargeback abusif</strong> (contestation bancaire frauduleuse) : SAFARUMA conteste systématiquement, avec preuves (messages, confirmation, historique) — suspension du compte + signalement Stripe</li>
            <li style={li}><strong>Fausse déclaration de mission non réalisée</strong> : preuves exigées (captures messagerie, témoignages, photos). Si mensonge prouvé : <strong>suspension permanente</strong></li>
            <li style={li}><strong>Annulations tardives répétées (3+)</strong> : dépôt de garantie de <strong>30%</strong> requis pour toutes réservations futures</li>
            <li style={li}><strong>Faux avis négatif</strong> pour obtenir un remboursement : investigation, suspension si fraude prouvée</li>
            <li style={li}><strong>Paiement direct au guide hors plateforme</strong> : suspension des deux comptes (client et guide)</li>
            <li style={li}><strong>Utilisation de plusieurs comptes</strong> pour contourner des sanctions : détection automatique, suspension de tous les comptes liés</li>
            <li style={li}><strong>Intimidation ou harcèlement du guide</strong> : suspension immédiate du compte client</li>
          </ul>
        </div>
        <p style={p}>Ces mesures existent pour protéger les guides qui opèrent de bonne foi. Un guide sanctionné injustement à cause d'une fraude client est indemnisé par SAFARUMA.</p>
      </section>

      <section id="litiges">
        <h2 style={h2}>4. Litiges</h2>
        <p style={p}>En cas de problème avec votre guide, voici la procédure :</p>
        <ul style={ul}>
          <li style={li}><strong>Signalement obligatoire dans les 24h</strong> suivant la fin de la mission via la plateforme</li>
          <li style={li}>La <strong>messagerie SAFARUMA</strong> fait foi comme preuve officielle — conservez vos échanges</li>
          <li style={li}><strong>SAFARUMA arbitre sous 48h</strong> après réception du dossier complet</li>
          <li style={li}>La décision d'arbitrage est <strong>définitive</strong> et s'impose aux deux parties</li>
          <li style={li}>Les fonds en séquestre sont libérés ou remboursés en conséquence</li>
        </ul>
        <div className="legal-box-gold">
          <div className="box-title">Comment signaler un litige</div>
          <p style={{ ...p, marginBottom: 0 }}>Depuis votre espace client → Mes Réservations → [Mission concernée] → « Signaler un litige »<br />Ou par email : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C', fontWeight: 700 }}>contact@safaruma.com</a> avec l'objet « LITIGE — [numéro de réservation] »</p>
        </div>
      </section>

      <section id="garanties">
        <h2 style={h2}>5. Garanties SAFARUMA</h2>
        <p style={p}>En choisissant SAFARUMA, vous bénéficiez de :</p>
        <div className="legal-box-gold">
          <div className="box-title">La Promesse SAFARUMA</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Guides 100% vérifiés</strong> : identité, Certifié SAFARUMA, casier judiciaire</li>
            <li style={li}><strong>Paiements sécurisés</strong> via Stripe (PCI-DSS niveau 1) — jamais stockés chez SAFARUMA</li>
            <li style={li}><strong>Argent protégé</strong> en séquestre jusqu'à la fin de la mission</li>
            <li style={li}><strong>Arbitrage rapide</strong> en cas de litige (48h)</li>
            <li style={li}><strong>Avis vérifiés</strong> — uniquement après mission réelle</li>
            <li style={li}><strong>Messagerie sécurisée</strong> — tout est tracé et protégé</li>
          </ul>
        </div>
      </section>

      <section id="droit">
        <h2 style={h2}>6. Droit applicable et juridiction</h2>
        <p style={p}>Les présentes conditions sont régies par le <strong>droit français</strong>. En cas de désaccord persistant non résolu par l'arbitrage SAFARUMA, compétence exclusive est attribuée aux <strong>tribunaux de Paris</strong>.</p>
        <p style={p}>Pour tout litige de consommation, vous pouvez également recourir à un médiateur de la consommation agréé, conformément aux articles L.611-1 et suivants du Code de la consommation.</p>
      </section>

    </LegalLayout>
  );
}
