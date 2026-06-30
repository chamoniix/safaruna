import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Guides certifiés pour la Omra | SAFARUMA',
  description:
    'Découvrez comment SAFARUMA sélectionne des guides privés pour accompagner les pèlerins à La Mecque et Médine avec sérieux, pédagogie et respect.',
};

export default function GuidesCertifiesPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Guides certifiés SAFARUMA</p>
        <h1>Un guide privé ne doit pas seulement connaître les lieux. Il doit savoir accompagner.</h1>
        <p>
          SAFARUMA met en avant des guides capables d’expliquer les rites, d’adapter le rythme au pèlerin et de
          transmettre l’histoire des lieux saints sans transformer la Omra en simple circuit touristique.
        </p>
        <Link href="/guides">Voir les guides</Link>
      </section>
      <section className="seo-content">
        <h2>Ce que nous attendons d’un guide</h2>
        <p>
          Un bon guide Omra doit être clair, patient, fiable et attentif. Il doit comprendre la charge émotionnelle du
          voyage, les questions pratiques, les hésitations des nouveaux pèlerins et les contraintes des familles.
        </p>
        <h2>Une certification centrée sur la confiance</h2>
        <p>
          La certification SAFARUMA repose sur la connaissance du terrain, la capacité d’explication, la ponctualité,
          l’éthique de service et le respect du cadre spirituel. L’objectif est simple : que chaque pèlerin puisse vivre
          sa Omra avec sérénité.
        </p>
        <h2>Pourquoi cela change l’expérience</h2>
        <p>
          Avec un guide privé, le pèlerin peut poser ses questions, ralentir, approfondir, découvrir les lieux et mieux
          comprendre le sens de ce qu’il accomplit. C’est cette profondeur que SAFARUMA veut rendre accessible.
        </p>
      </section>
    </main>
  );
}
