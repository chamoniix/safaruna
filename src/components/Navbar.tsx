import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
        SAFAR<span>UMA</span>
      </Link>
      <div className="nav-links">
        <Link href="/guides">Nos guides</Link>
        <Link href="/#packages">Forfaits</Link>
        <Link href="/services">Services</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/a-propos">À propos</Link>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/connexion" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--deep)', textDecoration: 'none' }}>
          Connexion
        </Link>
        <Link href="/inscription" className="btn-nav">
          S'inscrire
        </Link>
      </div>
    </nav>
  );
}
