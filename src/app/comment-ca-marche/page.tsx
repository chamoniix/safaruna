import type { Metadata } from 'next';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Comment ça marche — Réserver un guide privé Omra | SAFARUMA',
  description: 'Comment réserver votre guide privé certifié pour la Omra en 3 étapes : choisissez votre guide, personnalisez votre programme, vivez votre pèlerinage. Simple, transparent, certifié.',
  alternates: { canonical: 'https://safaruma.com/comment-ca-marche' },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '8rem 2rem', minHeight: '60vh' }}>
        <h1>COMMENT-CA-MARCHE</h1>
        <p className="mt-4 text-muted">Page en construction. Cette page contiendra les éléments de comment-ca-marche.</p>
      </div>
      <Footer />
    </>
  );
}