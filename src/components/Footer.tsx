import Link from "next/link";
import React from "react";
import { IconShield, IconStar, IconLock, IconAccessibility } from "@/components/Icons";

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
        {([
          { icon: <span style={{ color: 'rgba(201,168,76,0.8)', fontWeight: 700 }}>✓</span>, label: 'Guides mutawwif certifiés' },
          { icon: <IconShield size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Paiement sécurisé' },
          { icon: <IconStar size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Note 4.94/5 — 709 avis' },
          { icon: <IconAccessibility size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Accessibilité PMR' },
          { icon: <IconLock size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Données protégées RGPD' },
        ] as { icon: React.ReactNode; label: string }[]).map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            {b.icon}
            {b.label}
          </div>
        ))}
      </div>

      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" style={{ textDecoration: 'none' }} className="logo">
            <span style={{ color: "white" }}>
              SAFAR<span>U</span>MA
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
            <li><Link href="/charte">Charte SAFARUMA</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>SAFARUMA</h4>
          <ul>
            <li><Link href="/a-propos">À propos</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Légal</h4>
          <ul>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/politique-confidentialite">Confidentialité</Link></li>
            <li><Link href="/cgu">CGU</Link></li>
            <li><Link href="/conditions-guides">Conditions Guides</Link></li>
            <li><Link href="/conditions-clients">Conditions Clients</Link></li>
            <li><Link href="/charte-islamique">Charte Islamique</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="copy">© 2025 SAFARUMA. Tous droits réservés</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Made with respect for the Deen</span>
      </div>
    </footer>
  );
}
