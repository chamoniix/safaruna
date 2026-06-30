import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accès privilégiés et lieux secrets pendant la Omra | SAFARUMA',
  description: 'Découvrez des itinéraires plus flexibles avec un guide privé à La Mecque et Médine.',
};

export default function AccesPrivilegiesPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Expérience exclusive</p>
        <h1>Des accès plus flexibles, impossibles à vivre avec un grand bus.</h1>
        <p>Un petit groupe ou un accompagnement privé permet de mieux choisir les horaires, les lieux et le rythme.</p>
        <Link href="/guides">Voir les guides</Link>
      </section>
      <section className="seo-content">
        <h2>Moins de contraintes, plus de sens</h2>
        <p>
          Les grands groupes doivent aller vite. Un guide privé peut proposer une expérience plus souple, adaptée à la
          famille, à la fatigue, aux enfants ou à la recherche d’un moment plus intime.
        </p>
      </section>
    </main>
  );
}
