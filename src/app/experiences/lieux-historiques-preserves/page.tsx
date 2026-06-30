import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lieux historiques préservés à Makkah et Madinah | SAFARUMA',
  description: 'Découvrez des lieux historiques liés à la Omra avec un guide privé SAFARUMA.',
};

export default function LieuxHistoriquesPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Expérience exclusive</p>
        <h1>Lieux historiques préservés, expliqués avec calme et contexte.</h1>
        <p>Certains lieux demandent du temps, du silence et une explication précise. C’est difficile avec un grand groupe.</p>
        <Link href="/guides">Trouver un guide</Link>
      </section>
      <section className="seo-content">
        <h2>Voir plus que les arrêts classiques</h2>
        <p>
          Un guide privé peut adapter le parcours, raconter les événements, replacer les lieux dans l’histoire et laisser
          au pèlerin le temps d’observer. L’expérience devient plus profonde, plus personnelle et plus mémorable.
        </p>
      </section>
    </main>
  );
}
