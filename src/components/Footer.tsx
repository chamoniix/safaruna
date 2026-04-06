import Link from "next/link";
import React from "react";
import { IconShield, IconStar, IconAccessibility } from "@/components/Icons";

export default function Footer() {
  return (
    <footer>
      {/* Trust badges strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0',
        padding: '0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '0',
      }}>
        {([
          { icon: <span style={{ color: 'rgba(201,168,76,0.8)', fontWeight: 700 }}>✓</span>, label: 'Guides mutawwif certifiés' },
          { icon: <IconShield size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Paiement sécurisé' },
          { icon: <IconStar size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Note 4.94/5 — 709 avis' },
          { icon: <IconAccessibility size={14} stroke="rgba(201,168,76,0.7)" />, label: 'Accessibilité PMR' },
        ] as { icon: React.ReactNode; label: string }[]).map(b => (
          <div key={b.label} className="footer-badge-item">
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
          <p>La première plateforme dédiée aux guides privés pour la Omra. Rituels, histoire, spiritualité — vivez-les en profondeur.</p>
        </div>
        <div className="footer-col">
          <h4>Pèlerins</h4>
          <ul>
            <li><Link href="/guides">Trouver un guide</Link></li>
            <li><Link href="/#packages">Nos forfaits</Link></li>
            <li><Link href="/guide-omra">Guide complet de la Omra</Link></li>
            <li><Link href="/espace/tableau-de-bord">Tableau de bord</Link></li>
            <li><Link href="/connexion">Connexion</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Guides</h4>
          <ul>
            <li><Link href="/guide/inscription">Créer mon profil Guide</Link></li>
            <li><Link href="/guide/connexion">Espace Guide</Link></li>
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
            <li><Link href="/conditions-clients">Conditions Clients</Link></li>
            <li><Link href="/charte-islamique">Charte Islamique</Link></li>
          </ul>
        </div>
      </div>
      {/* Social media */}
      <div className="footer-social-section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.69rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.875rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>
          Suivez-nous
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Instagram */}
          <a href="https://www.instagram.com/safaruma_" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          {/* TikTok */}
          <a href="https://www.tiktok.com/@safaruma" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="TikTok">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.27 8.27 0 0 0 4.84 1.54V7.08a4.85 4.85 0 0 1-1.07-.39z"/>
            </svg>
          </a>
          {/* X / Twitter */}
          <a href="https://x.com/safaruma" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="X (Twitter)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          {/* Snapchat */}
          <a href="https://www.snapchat.com/add/safaruma" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Snapchat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.61 2 6 4.77 6 8.2v.8c-.56.07-1.08.33-1.44.73-.34.38-.5.86-.44 1.34.12.95.87 1.67 1.88 1.82-.5 1.03-1.35 1.87-2.4 2.29-.3.12-.47.43-.38.74.08.27.32.44.6.44.05 0 .1 0 .15-.02.17-.04.34-.09.51-.14.55-.16 1.12-.24 1.7-.24.32 0 .63.03.93.08-.2.66-.31 1.36-.31 2.08 0 .3.24.55.55.55H12h5.65c.3 0 .55-.25.55-.55 0-.72-.11-1.42-.31-2.08.3-.05.61-.08.93-.08.58 0 1.15.08 1.7.24.17.05.34.1.51.14.05.01.1.02.15.02.28 0 .52-.17.6-.44.09-.31-.08-.62-.38-.74-1.05-.42-1.9-1.26-2.4-2.29 1.01-.15 1.76-.87 1.88-1.82.06-.48-.1-.96-.44-1.34-.36-.4-.88-.66-1.44-.73v-.8C18 4.77 15.39 2 12 2z"/>
            </svg>
          </a>
          {/* YouTube */}
          <a href="https://youtube.com/@safaruma" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          {/* Pinterest */}
          <a href="https://pin.it/2AfX27PBM" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Pinterest">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
          </a>
          {/* LinkedIn */}
          <a href="https://www.linkedin.com/company/safaruma" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="copy">© 2025 HOLDINGAI LTD · SAFARUMA est une marque de HOLDINGAI LTD · Co. No. 16382871 · England &amp; Wales</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Made with respect for the Deen</span>
      </div>
    </footer>
  );
}
