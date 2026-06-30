import Link from 'next/link';
import CookiePrefsButton from '@/components/CookiePrefsButton';

export default function Footer() {
  return (
    <footer className="sfr-footer">
      <div className="sfr-footer-inner">
        <div className="sfr-footer-brand">
          <Link href="/" className="sfr-footer-logo">
            SAFARUMA
          </Link>
          <p>
            Guides privés certifiés à La Mecque et Médine. Visite des lieux saints et sites historiques en plusieurs
            langues.
          </p>
          <div className="sfr-footer-socials" aria-label="Réseaux sociaux">
            <a href="https://www.instagram.com/safaruma_" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              IG
            </a>
            <a href="https://www.tiktok.com/@safaruma" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              TT
            </a>
            <a href="https://youtube.com/@safaruma" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              YT
            </a>
          </div>
        </div>

        <div className="sfr-footer-col">
          <h4>Navigation</h4>
          <Link href="/guides">Guides privés</Link>
          <Link href="/lieux-saints">Destinations</Link>
          <Link href="/a-propos">À propos</Link>
          <Link href="/blog">Ressources</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="sfr-footer-col">
          <h4>Ressources</h4>
          <Link href="/guide-omra">Guide PDF gratuit</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/cgu">Conditions générales</Link>
          <Link href="/confidentialite">Politique de confidentialité</Link>
          <CookiePrefsButton />
        </div>

        <div className="sfr-footer-col">
          <h4>Contact</h4>
          <p>+966 50 123 4567</p>
          <p>contact@safaruma.com</p>
          <p>La Mecque, Arabie Saoudite</p>
          <p>24/7 disponible</p>
        </div>
      </div>
      <div className="sfr-footer-bottom">© 2026 Safaruma. Tous droits réservés.</div>
    </footer>
  );
}
