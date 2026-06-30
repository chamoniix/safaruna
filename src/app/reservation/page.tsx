import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Réserver un guide privé Omra | SAFARUMA',
  description: 'Commencez votre réservation SAFARUMA et choisissez un guide privé pour La Mecque ou Médine.',
};

export default function ReservationPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Réservation</p>
        <h1>Trouver le guide privé qui correspond à votre Omra.</h1>
        <p>
          Choisissez votre langue, votre ville, votre rythme et le type d’accompagnement souhaité. SAFARUMA vous oriente
          vers les guides disponibles pour préparer une Omra plus claire et plus personnelle.
        </p>
        <Link href="/guides">Voir les guides disponibles</Link>
      </section>
      <section className="seo-content">
        <h2>Comment réserver</h2>
        <p>
          Commencez par consulter les profils guides, comparez les langues, les lieux couverts et l’expérience proposée.
          Vous pourrez ensuite sélectionner un accompagnement adapté à votre famille, vos dates et vos besoins.
        </p>
      </section>
    </main>
  );
}
