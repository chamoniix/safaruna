import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Moments spirituels inoubliables pendant la Omra | SAFARUMA',
  description: 'Préservez la profondeur spirituelle de votre Omra avec un guide privé SAFARUMA.',
};

export default function MomentsSpirituelsPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Expérience exclusive</p>
        <h1>Des moments spirituels qui ne se vivent pas dans la précipitation.</h1>
        <p>Comprendre, ralentir, poser une intention et relier les gestes au cœur du voyage.</p>
        <Link href="/reservation">Préparer mon accompagnement</Link>
      </section>
      <section className="seo-content">
        <h2>Une présence guidée</h2>
        <p>
          Le guide aide à garder le sens des rites quand la fatigue, la foule ou la logistique prennent de la place. Il
          rappelle les étapes, répond aux questions et aide chacun à vivre une Omra plus consciente.
        </p>
      </section>
    </main>
  );
}
