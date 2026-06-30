import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rencontres locales pendant la Omra | SAFARUMA',
  description: 'Vivez une Omra plus humaine avec des rencontres locales et un accompagnement privé.',
};

export default function RencontresLocalesPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Expérience exclusive</p>
        <h1>Rencontres locales, moments simples et souvenirs humains.</h1>
        <p>La Omra ne se limite pas aux déplacements. Elle se vit aussi dans les échanges, les conseils et les détails du quotidien.</p>
        <Link href="/guides">Choisir mon guide</Link>
      </section>
      <section className="seo-content">
        <h2>Sortir du parcours impersonnel</h2>
        <p>
          Avec un guide, le pèlerin peut mieux comprendre la ville, ses usages, ses moments de calme et ses repères. Ces
          rencontres donnent de la chaleur au voyage et renforcent le sentiment d’être accompagné.
        </p>
      </section>
    </main>
  );
}
