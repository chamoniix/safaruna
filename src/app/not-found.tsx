import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="cta-section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="arabic-deco" style={{ opacity: 0.05, fontSize: '6rem' }}>إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</div>
        <h2 style={{ fontSize: '3rem', margin: '2rem 0 1rem' }}>Cette page est partie en <em>Omra</em> 🕌</h2>
        <p className="cta-sub">Mais nous, on est là pour vous guider.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/" className="btn-secondary">Retour à l'accueil</Link>
          <Link href="/guides" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--deep)' }}>Trouver un guide</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}