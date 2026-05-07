import LegalLayout, { h2, p } from '@/components/LegalLayout';

export const metadata = {
  title: 'Mentions légales — SAFARUMA',
  description: 'Mentions légales de la plateforme SAFARUMA : éditeur, hébergeur, propriété intellectuelle.',
  robots: { index: false },
};

export default function MentionsLegales() {
  return (
    <LegalLayout
      title="Mentions légales"
      subtitle="Informations légales et réglementaires"
      toc={[
        { id: 'editeur',        label: '1. Éditeur du site' },
        { id: 'hebergeur',      label: '2. Hébergement' },
        { id: 'pi',             label: '3. Propriété intellectuelle' },
        { id: 'donnees',        label: '4. Données personnelles' },
        { id: 'cookies',        label: '5. Cookies' },
        { id: 'responsabilite', label: '6. Responsabilité' },
        { id: 'contact',        label: '7. Contact' },
      ]}
    >

      <section id="editeur">
        <h2 style={h2}>1. Éditeur du site</h2>
        <p style={p}>Le site <strong>safaruma.com</strong> est édité par HOLDINGAI LTD, société enregistrée en Angleterre et au Pays de Galles (Company Number 16382871). SAFARUMA est une marque commerciale exploitée par HOLDINGAI LTD.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          {[
            ['Société',                  'HOLDINGAI LTD'],
            ['Numéro d\'enregistrement', '16382871 (Companies House, England & Wales)'],
            ['Siège social',             'Lytchett House, 13 Freeland Park, Wareham Road, Poole, Dorset, BH16 6FA, United Kingdom'],
            ['Incorporée le',            '11 avril 2025'],
            ['Marque exploitée',         'SAFARUMA — plateforme de mise en relation pèlerins / guides privés pour la Omra'],
            ['Email de contact',         'contact@safaruma.com'],
            ['Site web',                 'safaruma.com'],
          ].map(([k, v]) => (
            <tr key={k} style={{ borderBottom: '1px solid #E8DFC8' }}>
              <td style={{ padding: '0.65rem 1rem 0.65rem 0', color: '#7A6D5A', fontWeight: 600, fontSize: '0.82rem', width: '42%', verticalAlign: 'top' }}>{k}</td>
              <td style={{ padding: '0.65rem 0', color: '#3D3530', fontSize: '0.875rem', lineHeight: 1.6 }}>{v}</td>
            </tr>
          ))}
        </table>
      </section>

      <section id="hebergeur">
        <h2 style={h2}>2. Hébergement</h2>
        <p style={p}>Le site est hébergé par :</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          {[
            ['Société',  'Vercel Inc.'],
            ['Adresse',  '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis'],
            ['Site web', 'vercel.com'],
            ['Email',    'privacy@vercel.com'],
          ].map(([k, v]) => (
            <tr key={k} style={{ borderBottom: '1px solid #E8DFC8' }}>
              <td style={{ padding: '0.65rem 1rem 0.65rem 0', color: '#7A6D5A', fontWeight: 600, fontSize: '0.82rem', width: '30%', verticalAlign: 'top' }}>{k}</td>
              <td style={{ padding: '0.65rem 0', color: '#3D3530', fontSize: '0.875rem', lineHeight: 1.6 }}>{v}</td>
            </tr>
          ))}
        </table>
        <p style={p}>Vercel est certifié ISO 27001 et conforme au RGPD. Les données sont hébergées dans des data centers certifiés SOC 2 Type II.</p>
      </section>

      <section id="pi">
        <h2 style={h2}>3. Propriété intellectuelle</h2>
        <p style={p}>L'ensemble du contenu de ce site — textes, graphismes, logos, icônes, images, logiciels, architecture et base de données — est la propriété exclusive de SAFARUMA ou de ses partenaires ayant accordé une licence d'utilisation.</p>
        <p style={p}>Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, quel que soit le moyen utilisé, est interdite sans l'autorisation écrite préalable de SAFARUMA.</p>
        <div className="legal-box-gold">
          <div className="box-title">Contenu des guides</div>
          <p style={{ ...p, marginBottom: 0 }}>Les profils des guides (photos, descriptions, certifications) restent leur propriété personnelle. En les publiant sur SAFARUMA, les guides accordent une licence d'utilisation non exclusive à SAFARUMA pour les afficher sur la plateforme.</p>
        </div>
        <p style={p}>© 2025–2026 HOLDINGAI LTD. Tous droits réservés. SAFARUMA est une marque déposée de HOLDINGAI LTD.</p>
      </section>

      <section id="donnees">
        <h2 style={h2}>4. Données personnelles</h2>
        <p style={p}>SAFARUMA traite vos données personnelles conformément au UK GDPR et au Data Protection Act 2018.</p>
        <p style={p}>Pour toute question relative à vos données, consultez notre <a href="/politique-confidentialite" style={{ color: '#C9A84C', fontWeight: 600 }}>Politique de confidentialité</a>.</p>
      </section>

      <section id="cookies">
        <h2 style={h2}>5. Cookies</h2>
        <p style={p}>Ce site utilise des cookies techniques essentiels (session, authentification, sécurité) et des cookies analytiques anonymisés. Aucun cookie publicitaire ou de traçage commercial n'est utilisé.</p>
        <p style={p}>Vous pouvez désactiver les cookies analytiques depuis les paramètres de votre navigateur ou de votre compte SAFARUMA.</p>
      </section>

      <section id="responsabilite">
        <h2 style={h2}>6. Responsabilité</h2>
        <p style={p}>SAFARUMA s'efforce d'assurer l'exactitude des informations publiées mais ne garantit pas leur exhaustivité. SAFARUMA ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site.</p>
        <p style={p}>Les liens hypertextes présents sur ce site peuvent renvoyer vers des sites tiers. SAFARUMA n'assume aucune responsabilité quant à leur contenu.</p>
      </section>

      <section id="contact">
        <h2 style={h2}>7. Contact</h2>
        <p style={p}>Pour toute question juridique concernant ce site : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C', fontWeight: 700 }}>contact@safaruma.com</a></p>
        <p style={p}>Délai de réponse : 72 heures ouvrées maximum.</p>
      </section>

    </LegalLayout>
  );
}
