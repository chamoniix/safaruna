import LegalLayout, { h2, p, ul, li } from '@/components/LegalLayout';

export const metadata = {
  title: 'Conditions Guides — SAFARUMA',
  description: 'Contrat Guides SAFARUMA : obligations, rémunération, politique d\'annulation, fraudes, protection.',
  robots: { index: false },
};

export default function ConditionsGuides() {
  return (
    <LegalLayout
      title="Conditions Guides"
      subtitle="Votre contrat avec SAFARUMA — Droits et obligations"
      toc={[
        { id: 'obligations',  label: '1. Obligations du Guide' },
        { id: 'remuneration', label: '2. Rémunération' },
        { id: 'annulation',   label: '3. Politique d\'annulation' },
        { id: 'fraudes',      label: '4. Fraudes — Tolérance zéro' },
        { id: 'protection',   label: '5. Protection du Guide' },
        { id: 'resiliation',  label: '6. Résiliation' },
      ]}
    >

      <section id="obligations">
        <h2 style={h2}>1. Obligations du Guide</h2>
        <p style={p}>En rejoignant SAFARUMA en tant que Guide Certifié SAFARUMA, vous vous engagez à respecter les obligations suivantes :</p>

        <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', margin: '1.5rem 0 0.75rem' }}>Professionnalisme</h3>
        <ul style={ul}>
          <li style={li}><strong>Présence à l'heure et au lieu convenus</strong> avec le pèlerin</li>
          <li style={li}>Prestation conforme à la description de votre profil (lieux annoncés, langues, tarifs)</li>
          <li style={li}>Réponse aux messages des pèlerins sous <strong>24 heures maximum</strong></li>
          <li style={li}>Maintien de votre profil à jour : disponibilités, tarifs, certifications</li>
        </ul>

        <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', margin: '1.5rem 0 0.75rem' }}>Exclusivité plateforme</h3>
        <ul style={ul}>
          <li style={li}><strong>Zéro paiement direct hors plateforme</strong> — tolérance zéro absolue</li>
          <li style={li}>Ne jamais recontacter un client hors plateforme pour des missions futures</li>
          <li style={li}>Ne jamais partager vos coordonnées personnelles à des fins de contournement</li>
        </ul>

        <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', margin: '1.5rem 0 0.75rem' }}>Éthique</h3>
        <ul style={ul}>
          <li style={li}>Signer et respecter la <a href="/charte-islamique" style={{ color: '#C9A84C', fontWeight: 600 }}>Charte Islamique SAFARUMA</a></li>
          <li style={li}>Traiter chaque pèlerin avec respect, patience et dignité</li>
          <li style={li}>Ne jamais exercer de pression sur un client</li>
        </ul>
      </section>

      <section id="remuneration">
        <h2 style={h2}>2. Rémunération</h2>
        <div className="legal-box-gold">
          <div className="box-title">Modèle économique SAFARUMA</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Prix fixé librement par le Guide</strong> — SAFARUMA ne dicte pas vos tarifs</li>
            <li style={li}><strong>Commission SAFARUMA : 12%</strong> prélevée automatiquement à la confirmation</li>
            <li style={li}><strong>Virement le 1er du mois</strong> pour toutes les missions terminées du mois précédent</li>
            <li style={li}><strong>Aucun abonnement mensuel</strong> — vous payez seulement quand vous gagnez</li>
            <li style={li}>Aucun frais d'inscription, aucune commission en cas d'annulation client remboursée intégralement</li>
          </ul>
        </div>
        <p style={p}>Les virements sont effectués par virement bancaire vers l'IBAN que vous avez renseigné. Vous êtes responsable de déclarer vos revenus conformément à la législation fiscale de votre pays de résidence.</p>
      </section>

      <section id="annulation">
        <h2 style={h2}>3. Politique d'annulation (par le Guide)</h2>
        <div className="legal-box-gold">
          <div className="box-title">Barème d'annulation Guide</div>
          <ul style={{ ...ul, marginBottom: '0.25rem' }}>
            <li style={li}><strong>Plus de 7 jours avant la mission</strong> : autorisée, avertissement enregistré</li>
            <li style={li}><strong>Entre 7 jours et 48h avant</strong> : autorisée, <strong>pénalité 50 €</strong> + avertissement</li>
            <li style={li}><strong>Moins de 48h avant</strong> : <strong>pénalité 100 €</strong> + avertissement + remboursement intégral du client</li>
            <li style={li}><strong>No-show (absence sans prévenir)</strong> : <strong>pénalité 200 €</strong> + avertissement + <strong>suspension immédiate</strong> du compte</li>
          </ul>
        </div>
        <div className="legal-box-red">
          <div className="box-title">Règle des 3 avertissements</div>
          <p style={{ ...p, marginBottom: 0 }}>Tout Guide accumulant <strong>3 avertissements</strong>, quelle qu'en soit la cause, verra son compte <strong>suspendu définitivement</strong>. SAFARUMA maintient ce seuil strict pour garantir la confiance des pèlerins.</p>
        </div>
        <p style={p}>En cas d'annulation pour maladie grave, un certificat médical doit être transmis sous 24h pour bénéficier d'une exemption de pénalité. SAFARUMA se réserve le droit d'évaluer chaque situation individuellement.</p>
      </section>

      <section id="fraudes">
        <h2 style={h2}>4. Fraudes — Tolérance zéro</h2>
        <p style={p}>Les actes suivants constituent des fraudes graves et entraînent des sanctions immédiates :</p>
        <div className="legal-box-red">
          <div className="box-title">Fraudes — Sanctions immédiates</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Sollicitation d'un paiement hors plateforme</strong> : suspension immédiate + pénalité <strong>200 €</strong></li>
            <li style={li}><strong>Fausses certifications ou informations profil</strong> : suppression définitive du compte</li>
            <li style={li}><strong>Abandon de mission sans justification</strong> : remboursement intégral client + pénalité <strong>150 €</strong></li>
            <li style={li}><strong>Pression psychologique sur le client</strong> pour paiement direct : suspension immédiate</li>
            <li style={li}><strong>Tentative de contournement</strong> via WhatsApp / email personnel / réseaux sociaux : suspension</li>
            <li style={li}><strong>Faux avis positifs achetés ou échangés</strong> : suppression des avis + avertissement</li>
          </ul>
        </div>
        <p style={p}>SAFARUMA dispose de systèmes de détection automatique des comportements frauduleux. Les infractions répétées font l'objet de signalements aux autorités compétentes et de poursuites judiciaires.</p>
      </section>

      <section id="protection">
        <h2 style={h2}>5. Protection du Guide</h2>
        <p style={p}>SAFARUMA s'engage à protéger les guides contre les comportements abusifs :</p>
        <div className="legal-box-gold">
          <div className="box-title">Engagements de SAFARUMA envers les Guides</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}><strong>Client irrespectueux signalé</strong> : investigation sous 48h et sanctions adaptées</li>
            <li style={li}><strong>Faux avis négatif</strong> : investigation approfondie, suppression si fraude prouvée</li>
            <li style={li}><strong>Litige</strong> : SAFARUMA arbitre sous 48h, décision équitable et définitive</li>
            <li style={li}><strong>Maladie grave avec certificat médical</strong> : mise à disposition d'un guide de remplacement si disponible</li>
            <li style={li}><strong>Chargeback abusif</strong> : SAFARUMA conteste systématiquement et protège vos revenus</li>
          </ul>
        </div>
      </section>

      <section id="resiliation">
        <h2 style={h2}>6. Résiliation du compte Guide</h2>
        <p style={p}>Vous pouvez désactiver votre compte Guide à tout moment depuis vos paramètres. Les réservations déjà confirmées doivent être honorées ou annulées selon la politique d'annulation.</p>
        <p style={p}>SAFARUMA peut résilier un compte Guide sans préavis en cas de fraude avérée, d'accumulation de 3 avertissements, de violation grave de la <a href="/charte-islamique" style={{ color: '#C9A84C' }}>Charte Islamique</a> ou des présentes conditions.</p>
        <p style={p}>Droit applicable : <strong>droit français</strong>. Juridiction : <strong>Tribunal de Paris</strong>.</p>
      </section>

    </LegalLayout>
  );
}
