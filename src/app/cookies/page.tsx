import LegalLayout, { h2 as h2Base, p as pBase, ul as ulBase, li } from '@/components/LegalLayout';

const h2: React.CSSProperties = {
  ...h2Base,
  marginTop: '2rem',
  marginBottom: '0.5rem',
  paddingTop: '0.4rem',
};
const p: React.CSSProperties = { ...pBase, marginTop: 0, marginBottom: '0.6rem', lineHeight: 1.7 };
const ul: React.CSSProperties = { ...ulBase, marginTop: 0, marginBottom: '0.6rem', lineHeight: 1.7 };

export const metadata = {
  title: 'Politique de cookies | SAFARUMA',
  description: 'Détail des cookies utilisés sur SAFARUMA : finalité, durée, type. Modifiez vos préférences à tout moment.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://safaruma.com/cookies' },
};

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem',
  margin: '1.25rem 0', overflowX: 'auto', display: 'block',
};
const th: React.CSSProperties = {
  background: '#F5F2EC', padding: '0.6rem 0.75rem', textAlign: 'left',
  fontWeight: 700, color: '#1A1209', borderBottom: '2px solid #E8D08A',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '0.55rem 0.75rem', borderBottom: '1px solid #EDE8DC',
  color: '#4A3F30', verticalAlign: 'top',
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Politique de cookies"
      subtitle="Détail des cookies utilisés, leur finalité et la durée de conservation"
      updated="10 mai 2026"
      toc={[
        { id: 'definition',    label: "Qu'est-ce qu'un cookie ?" },
        { id: 'pourquoi',      label: 'Pourquoi SAFARUMA utilise des cookies' },
        { id: 'liste',         label: 'Liste détaillée des cookies' },
        { id: 'gestion',       label: 'Comment gérer vos cookies' },
        { id: 'duree',         label: 'Durée de conservation du consentement' },
        { id: 'droits',        label: 'Vos droits RGPD' },
      ]}
    >

      <section id="definition">
        <h2 style={h2}>Qu&apos;est-ce qu&apos;un cookie ?</h2>
        <p style={p}>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la consultation d&apos;un site web. Il permet au site de mémoriser des informations sur votre visite, comme votre langue préférée ou vos préférences de navigation.</p>
        <p style={p}>Les cookies ne contiennent pas de virus et ne peuvent pas accéder aux données stockées sur votre appareil. Ils sont utilisés par la quasi-totalité des sites web professionnels.</p>
      </section>

      <section id="pourquoi">
        <h2 style={h2}>Pourquoi SAFARUMA utilise-t-il des cookies ?</h2>
        <p style={p}>Nous utilisons des cookies pour :</p>
        <ul style={ul}>
          <li style={li}>Assurer le bon fonctionnement du site (authentification, paiement, sécurité)</li>
          <li style={li}>Mesurer l&apos;audience et comprendre comment vous utilisez le site (analytiques)</li>
          <li style={li}>Mesurer l&apos;efficacité de nos campagnes publicitaires (marketing)</li>
          <li style={li}>Améliorer votre expérience utilisateur (confort)</li>
        </ul>
        <p style={p}>Conformément au RGPD et aux recommandations de la CNIL, seuls les cookies strictement nécessaires au fonctionnement du site sont déposés sans votre consentement préalable. Les cookies analytiques, marketing et de confort ne sont activés qu&apos;après votre accord explicite.</p>
      </section>

      <section id="liste">
        <h2 style={h2}>Liste détaillée des cookies utilisés</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Cookie</th>
                <th style={th}>Émetteur</th>
                <th style={th}>Finalité</th>
                <th style={th}>Durée</th>
                <th style={th}>Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['next-auth.session-token',                'SAFARUMA',          'Authentification',                       'Session',  'Essentiel'],
                ['next-auth.csrf-token',                   'SAFARUMA',          'Sécurité (anti-CSRF)',                   'Session',  'Essentiel'],
                ['__Secure-next-auth.callback-url',        'SAFARUMA',          'Redirection après connexion',            'Session',  'Essentiel'],
                ['safaruma_consent',                       'SAFARUMA',          'Mémorisation de vos préférences cookies','13 mois',  'Essentiel'],
                ['__stripe_mid',                           'Stripe',            'Détection de fraude au paiement',        '1 an',     'Essentiel'],
                ['__stripe_sid',                           'Stripe',            'Session paiement sécurisée',             '30 min',   'Essentiel'],
                ['_ga',                                    'Google Analytics',  'Distinction des utilisateurs',           '2 ans',    'Analytique'],
                ['_ga_3RLSBGY5LZ',                         'Google Analytics',  'État de session GA4',                    '2 ans',    'Analytique'],
              ].map(([name, emitter, purpose, duration, category]) => (
                <tr key={name} style={{ background: category === 'Essentiel' ? 'transparent' : '#FFFBF0' }}>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.78rem', color: '#1A1209' }}>{name}</td>
                  <td style={td}>{emitter}</td>
                  <td style={td}>{purpose}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{duration}</td>
                  <td style={{ ...td, fontWeight: 600, color: category === 'Analytique' ? '#1A4A8A' : '#4A3F30' }}>{category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...p, fontSize: '0.8rem', color: '#7A6D5A', fontStyle: 'italic' }}>
          Les cookies marketing (Meta, TikTok, Google Ads) et de confort (Hotjar) seront ajoutés à cette liste lors de leur activation. Aucun n&apos;est actif à ce jour.
        </p>
      </section>

      <section id="gestion">
        <h2 style={h2}>Comment gérer vos cookies ?</h2>
        <p style={p}>Vous pouvez à tout moment :</p>
        <ul style={ul}>
          <li style={li}>Modifier vos préférences via le lien <strong>«&nbsp;Gérer mes cookies&nbsp;»</strong> dans notre pied de page</li>
          <li style={li}>Configurer votre navigateur pour bloquer ou supprimer les cookies (les instructions varient selon le navigateur — consultez l&apos;aide de Chrome, Firefox, Safari ou Edge)</li>
          <li style={li}>Vous opposer aux cookies Google Analytics via l&apos;extension <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Google Analytics Opt-Out</a></li>
          <li style={li}>Nous contacter à <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a> pour toute question</li>
        </ul>
        <p style={p}>Attention : bloquer certains cookies essentiels peut empêcher la connexion à votre compte ou le traitement des paiements.</p>
      </section>

      <section id="duree">
        <h2 style={h2}>Durée de conservation du consentement</h2>
        <p style={p}>Votre choix concernant les cookies est conservé dans votre navigateur pour une durée maximale de <strong>13 mois</strong>, conformément aux recommandations de la CNIL. Au-delà de cette période, nous vous demandons à nouveau votre consentement.</p>
        <p style={p}>Vous pouvez retirer votre consentement à tout moment, sans condition, via le lien «&nbsp;Gérer mes cookies&nbsp;» en bas de chaque page du site.</p>
      </section>

      <section id="droits">
        <h2 style={h2}>Vos droits RGPD</h2>
        <p style={p}>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la Loi Informatique et Libertés, vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de portabilité et d&apos;opposition concernant vos données personnelles.</p>
        <p style={p}>Pour exercer ces droits ou pour toute question relative aux cookies, contactez-nous à <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a>.</p>
        <p style={p}>Vous pouvez également déposer une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>CNIL</a> (Commission Nationale de l&apos;Informatique et des Libertés).</p>
      </section>

    </LegalLayout>
  );
}
