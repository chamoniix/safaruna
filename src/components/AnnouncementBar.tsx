import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <span className="ab-dot" />
      🕌 Ramadan 2025 — Réservez votre guide dès maintenant et bénéficiez de
      <Link href="/guides">disponibilités prioritaires</Link>
      · Paiement sécurisé · Annulation gratuite 48h
    </div>
  );
}
