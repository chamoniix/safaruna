import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      {/* Trust badges strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
        alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '1rem',
      }}>
        {[
          { icon: '✓', label: 'Guides mutawwif certifiés' },
          { icon: '🛡️', label: 'Paiement sécurisé' },
          { icon: '⭐', label: 'Note 4.94/5 — 709 avis' },
          { icon: '♿', label: 'Accessibilité PMR' },
          { icon: '🔒', label: 'Données protégées RGPD' },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            <span style={{ color: 'rgba(201,168,76,0.7)' }}>{b.icon}</span>
            {b.label}
          </div>
        ))}
      </div>

      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" style={{ textDecoration: 'none' }} className="logo">
            <span style={{ color: "white" }}>
              SAFAR<span>U</span>NA
            </span>
          </Link>
          <p>La première plateforme dédiée aux guides privés pour l'Omra. Rituels, histoire, spiritualité — vivez-les en profondeur.</p>
        </div>
        <div className="footer-col">
          <h4>Pèlerins</h4>
          <ul>
            <li><Link href="/guides">Trouver un guide</Link></li>
            <li><Link href="/#packages">Nos forfaits</Link></li>
            <li><Link href="/espace/tableau-de-bord">Tableau de bord</Link></li>
            <li><Link href="/connexion">Connexion</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Guides</h4>
          <ul>
            <li><Link href="/guide/inscription">Créer mon profil</Link></li>
            <li><Link href="/guide/tableau-de-bord">Espace Guide</Link></li>
            <li><Link href="/devenir-guide">Revenus et Écosystème</Link></li>
            <li><Link href="/charte">Charte SAFARUNA</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>SAFARUNA</h4>
          <ul>
            <li><Link href="/a-propos">À propos</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="copy">© 2025 SAFARUNA — Tous droits réservés</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Made with respect for the Deen</span>
      </div>
    </footer>
  );
}
