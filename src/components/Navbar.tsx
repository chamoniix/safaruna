import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
        SAFAR<span>U</span>NA
      </Link>
      <div className="nav-links">
        <Link href="/#comment">Comment ça marche</Link>
        <Link href="/guides">Nos guides</Link>
        <Link href="/#packages">Forfaits</Link>
        <Link href="/#confiance">Confiance</Link>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/auth/login" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--deep)', textDecoration: 'none' }}>
          Connexion
        </Link>
        <Link href="/auth/register" className="btn-nav">
          S'inscrire
        </Link>
      </div>
    </nav>
  );
}
