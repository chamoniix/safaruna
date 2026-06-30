import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Omra PMR, fauteuil roulant et assistance | SAFARUMA',
  description:
    'Préparez une Omra avec assistance PMR : fauteuil roulant, personnes âgées, enfants, tawaf, sa’i, logistique et accompagnement personnalisé.',
};

export default function OmraPmrPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Omra PMR & assistance</p>
        <h1>Une Omra accessible, organisée et plus sereine pour chaque pèlerin.</h1>
        <p>
          SAFARUMA accompagne les pèlerins à mobilité réduite, les personnes âgées, les familles avec enfants et les
          voyageurs qui ont besoin d’un rythme plus doux.
        </p>
        <Link href="/guides">Trouver un guide adapté</Link>
      </section>
      <section className="seo-content">
        <h2>PMR, fauteuil roulant et personnes âgées</h2>
        <p>
          L’accompagnement PMR demande de l’anticipation : accès, points de rendez-vous, fatigue, chaleur, foule,
          pauses, fauteuil roulant et coordination avec les proches. Le guide aide à rendre chaque déplacement plus
          lisible et moins stressant.
        </p>
        <h2>Tawaf et sa’i avec assistance</h2>
        <p>
          Le tawaf et le sa’i peuvent être éprouvants pour les personnes âgées, les enfants ou les pèlerins en fauteuil.
          Un accompagnement personnalisé permet de préparer le rythme, d’expliquer les étapes, de réduire l’angoisse et
          de préserver la concentration spirituelle.
        </p>
        <h2>Logistique et sérénité</h2>
        <p>
          SAFARUMA aide à penser l’expérience dans son ensemble : arrivée, horaires, transport, moments d’affluence,
          besoins familiaux, pauses et communication. L’objectif n’est pas seulement de terminer les rites, mais de les
          vivre avec calme, dignité et compréhension.
        </p>
      </section>
    </main>
  );
}
