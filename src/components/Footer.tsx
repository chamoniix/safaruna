import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" style={{ textDecoration: 'none' }} className="logo">
            <span style={{ color: "white" }}>
              SAFAR<span>U</span>NA
            </span>
          </Link>
          <p>La première plateforme dédiée aux guides privés pour l'Omra. Rituels, histoire, spiritualité — vivez-les en profondeur.</p>
        </div>
        <div className="footer-col">
          <h4>Pèlerins</h4>
          <ul>
            <li><Link href="/guides">Trouver un guide</Link></li>
            <li><Link href="/#packages">Nos forfaits</Link></li>
            <li><Link href="/dashboard/pilgrim">Tableau de bord</Link></li>
            <li><Link href="/auth/login">Connexion</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Guides</h4>
          <ul>
            <li><Link href="/auth/register?role=guide">Créer mon profil</Link></li>
            <li><Link href="/dashboard/guide">Espace Guide</Link></li>
            <li><Link href="/#guides-espace">Revenus et Écosystème</Link></li>
            <li><Link href="/#confiance">Charte SAFARUNA</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>SAFARUNA</h4>
          <ul>
            <li><Link href="/#trust">Notre mission</Link></li>
            <li><Link href="/#comment">Comment ça marche</Link></li>
            <li><Link href="#">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="copy">© 2025 SAFARUNA — Tous droits réservés</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>Made with respect for the Deen</span>
      </div>
    </footer>
  );
}
