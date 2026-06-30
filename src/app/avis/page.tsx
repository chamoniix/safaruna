import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Avis clients SAFARUMA | Expériences Omra accompagnée',
  description: 'Retrouvez les retours d’expérience des pèlerins accompagnés par SAFARUMA.',
};

export default function AvisPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Avis clients</p>
        <h1>Leur expérience, notre plus belle récompense.</h1>
        <p>
          Les avis SAFARUMA doivent refléter des expériences réelles, utiles et vérifiables. Cette page servira de base
          publique pour centraliser les retours pèlerins.
        </p>
        <Link href="/guides">Trouver mon guide</Link>
      </section>
      <section className="seo-content">
        <h2>Ce qu’un bon avis doit raconter</h2>
        <p>
          Un avis utile décrit le contexte du voyage, le type d’accompagnement, les lieux visités, la qualité des
          explications, la gestion du rythme et le ressenti spirituel du pèlerin.
        </p>
      </section>
    </main>
  );
}
