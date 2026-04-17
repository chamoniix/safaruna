import LegalLayout, { h2, p, ul, li } from '@/components/LegalLayout';

export const metadata = {
  title: 'Charte Islamique — SAFARUMA',
  description: 'La Charte de Confiance SAFARUMA — Engagement éthique et spirituel des guides Mutawwifin.',
};

export default function CharteIslamique() {
  return (
    <LegalLayout
      title="La Charte de Confiance SAFARUMA"
      subtitle="Un engagement éthique et spirituel devant Allah ﷻ"
      toc={[
        { id: 'preambule',     label: 'Préambule' },
        { id: 'engagements',   label: 'Les 8 Engagements' },
        { id: 'hadith',        label: 'Fondement spirituel' },
        { id: 'signature',     label: 'Signature et application' },
      ]}
    >

      {/* Hero quote */}
      <div style={{
        background: '#1A1209', borderRadius: 12, padding: '2rem 2.5rem',
        marginBottom: '2.5rem', textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', color: '#F0D897', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
          "En rejoignant SAFARUMA, vous ne signez pas un simple contrat commercial.<br />
          Vous prenez un engagement spirituel devant Allah ﷻ,<br />
          témoin de toutes choses."
        </p>
      </div>

      <section id="preambule">
        <h2 style={h2}>Préambule</h2>
        <p style={p}>Cette charte est le fondement de la confiance que les pèlerins placent en vous. Elle dépasse le cadre du simple accord commercial — elle est un pacte moral, une promesse faite devant Allah ﷻ, qui voit et sait ce que cachent les cœurs.</p>
        <p style={p}>Le pèlerin qui vous confie son Omra est souvent à l'un des moments les plus importants de sa vie spirituelle. Il vous confie sa sécurité, sa famille, et la qualité de son expérience sacrée. Cette responsabilité est immense.</p>
        <p style={p}>La Charte de Confiance SAFARUMA n'est pas une contrainte imposée de l'extérieur — c'est le reflet de ce que tout bon guide Certifié SAFARUMA porte déjà dans son cœur.</p>
      </section>

      <section id="engagements">
        <h2 style={h2}>Les 8 Engagements du Guide SAFARUMA</h2>

        {[
          {
            num: '١',
            title: 'Honnêteté absolue',
            text: 'Ne jamais mentir sur vos compétences, votre expérience ou votre connaissance des lieux. Si vous ne maîtrisez pas un site ou un sujet, dites-le honnêtement. L\'honnêteté est la base de toute confiance.',
          },
          {
            num: '٢',
            title: 'Connaissance vérifiée',
            text: 'Ne guider que sur les lieux que vous connaissez réellement et en profondeur. Fournir des informations historiques, spirituelles et pratiques exactes, transmises avec humilité.',
          },
          {
            num: '٣',
            title: 'Respect de la dignité humaine',
            text: 'Traiter chaque pèlerin comme un invité d\'Allah ﷻ, quelle que soit son origine, sa maîtrise de la langue, son niveau de connaissance religieuse ou sa condition physique.',
          },
          {
            num: '٤',
            title: 'Pudeur et décence islamique',
            text: 'Respecter les règles islamiques de mixité et de comportement. Adopter une tenue et une attitude en accord avec la sainteté des Lieux Saints. Être un exemple de comportement islamique exemplaire.',
          },
          {
            num: '٥',
            title: 'Sincérité spirituelle',
            text: 'Transmettre la connaissance islamique avec humilité et exactitude. Ne jamais déformer le savoir religieux. En cas de doute, avouer ne pas savoir plutôt que d\'improviser sur des sujets religieux.',
          },
          {
            num: '٦',
            title: 'Honnêteté financière',
            text: 'Ne jamais surfacturer un pèlerin en situation de vulnérabilité. Ne jamais accepter de pot-de-vin (bakchich) de commerçants pour orienter les clients. Tous les revenus doivent être halal et transparents.',
          },
          {
            num: '٧',
            title: 'Protection des vulnérables',
            text: 'Porter une attention particulière et bienveillante aux personnes âgées, aux personnes à mobilité réduite (PMR), aux femmes seules et aux familles avec jeunes enfants. Adapter le rythme et l\'accompagnement à leurs besoins.',
          },
          {
            num: '٨',
            title: 'Confidentialité absolue',
            text: 'Ne jamais divulguer les informations personnelles des pèlerins (identité, situation familiale, contacts, données de santé). La confiance du pèlerin est sacrée.',
          },
        ].map((eng) => (
          <div key={eng.num} style={{ display: 'flex', gap: '1.25rem', margin: '1.5rem 0', padding: '1.25rem', background: '#FEF9EC', borderRadius: 10, border: '1px solid #E8D08A' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', color: '#C9A84C', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>
              {eng.num}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>
                {eng.title}
              </div>
              <p style={{ ...p, marginBottom: 0, color: '#4A3F30' }}>{eng.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="hadith">
        <h2 style={h2}>Fondement spirituel</h2>
        <div style={{ background: '#1A1209', borderRadius: 12, padding: '2rem 2.5rem', margin: '1.5rem 0' }}>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', color: '#F0D897', lineHeight: 1.8, margin: '0 0 1rem', fontStyle: 'italic', textAlign: 'center' }}>
            « Celui qui trompe n'est pas des nôtres. »
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
            Le Prophète Muhammad ﷺ — Rapporté par Muslim (n° 101)
          </p>
        </div>
        <div style={{ background: '#1A1209', borderRadius: 12, padding: '2rem 2.5rem', margin: '1.5rem 0' }}>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', color: '#F0D897', lineHeight: 1.8, margin: '0 0 1rem', fontStyle: 'italic', textAlign: 'center' }}>
            « La religion, c'est le conseil sincère (nasîha). »
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
            Le Prophète Muhammad ﷺ — Rapporté par Muslim (n° 55)
          </p>
        </div>
        <p style={p}>Ces paroles prophétiques résument l'esprit de la Charte SAFARUMA. Un Guide qui trompe — sur ses compétences, ses tarifs, ou en pratiquant des paiements cachés — s'expose non seulement aux sanctions de SAFARUMA, mais rompt un serment moral.</p>
        <p style={p}>Nous croyons que les meilleurs guides sont ceux qui n'ont pas besoin d'être surveillés — parce qu'ils agissent par conscience, par foi, et par amour pour leurs frères et sœurs en Islam.</p>
      </section>

      <section id="signature">
        <h2 style={h2}>Signature et application</h2>
        <p style={p}>Cette Charte est signée électroniquement à l'étape 6 du processus d'inscription guide. En cochant la case de validation, le guide atteste sur l'honneur et devant Allah ﷻ qu'il a lu, compris et accepté les engagements de la Charte.</p>
        <div className="legal-box-gold">
          <div className="box-title">Ce que signifie votre signature</div>
          <ul style={{ ...ul, marginBottom: 0 }}>
            <li style={li}>Vous avez lu et compris chacun des 8 engagements</li>
            <li style={li}>Vous vous engagez à les respecter dans toutes vos missions SAFARUMA</li>
            <li style={li}>Vous acceptez que toute violation grave constitue un motif de suspension ou de suppression de compte</li>
            <li style={li}>Vous reconnaissez que cette charte complète les <a href="/conditions-guides" style={{ color: '#C9A84C' }}>Conditions Guides</a></li>
          </ul>
        </div>
        <p style={p}>En cas de violation de la Charte, SAFARUMA applique les sanctions prévues dans les <a href="/conditions-guides" style={{ color: '#C9A84C', fontWeight: 600 }}>Conditions Guides</a>, pouvant aller jusqu'à la suspension définitive du compte.</p>
        <p style={p}>Que Allah ﷻ facilite votre mission et bénisse vos efforts au service des pèlerins. <strong>Barak Allahu fik.</strong></p>
      </section>

    </LegalLayout>
  );
}
