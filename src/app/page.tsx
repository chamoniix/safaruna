import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot"></span> Première plateforme dédiée à l'Omra
          </div>
          <h1>
            <em>Vis ton Omra</em>
            <strong>comme elle mérite d'être vécue.</strong>
          </h1>
          <p className="hero-sub">
            Trouve ton guide privé qui parle ta langue. Il t'accompagne dans tous les rituels, te raconte l'histoire des lieux saints, et fait de ton Omra bien plus qu'un simple voyage.
          </p>
          <div className="hero-actions">
            <Link href="#guides" className="btn-primary">
              Trouver mon guide
            </Link>
            <Link href="#comment" className="btn-secondary">
              Voir comment ça marche
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-stat top-left">
            <strong>4.97 ★</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Note moyenne</span>
          </div>
          <div className="guide-card">
            <div className="guide-card-header">
              <div className="avatar">شر</div>
              <div>
                <div className="guide-info">
                  <h3>Cheikh Rachid Al-Madani</h3>
                  <p>Guide certifié — Makkah & Madinah</p>
                </div>
                <div className="stars">★★★★★</div>
                <div className="verified-badge">✓ Vérifié SAFARUNA</div>
              </div>
            </div>
            <div className="lang-chips">
              <span className="chip active">🇫🇷 Français</span>
              <span className="chip">🇩🇿 Arabe</span>
              <span className="chip">🇬🇧 English</span>
            </div>
            <div className="service-list">
              <div className="service-item">
                <span className="check">✓</span> Rituels complets de l'Omra
              </div>
              <div className="service-item">
                <span className="check">✓</span> Visite Jabal Uhud + Badr
              </div>
              <div className="service-item">
                <span className="check">✓</span> Grotte Hira & Thawr
              </div>
              <div className="service-item">
                <span className="check">✓</span> Voiture 7 places incluse
              </div>
              <div className="service-item">
                <span className="check">✓</span> Du'a & récitations expliqués
              </div>
            </div>
            <div className="price-row">
              <div>
                <div className="price-label">Forfait 5 jours</div>
                <div className="price">
                  450€ <span>/ personne</span>
                </div>
              </div>
              <button className="btn-book">Réserver</button>
            </div>
          </div>
          <div className="floating-stat bottom-right">
            <strong>2 400+</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Pèlerins accompagnés</span>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="trust">
        <div className="trust-item">
          <strong>320+</strong>
          <span>Guides certifiés</span>
        </div>
        <div className="trust-item">
          <strong>12 pays</strong>
          <span>Langues couvertes</span>
        </div>
        <div className="trust-item">
          <strong>98%</strong>
          <span>Satisfaction</span>
        </div>
        <div className="trust-item">
          <strong>24h</strong>
          <span>Support disponible</span>
        </div>
        <div className="trust-item">
          <strong>0 compromis</strong>
          <span>Sur les rituels</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="comment">
        <div className="section-label">Processus simple</div>
        <h2>
          En 4 étapes, ton Omra<br />
          <em>devient inoubliable</em>
        </h2>
        <p className="section-sub">
          Plus besoin de suivre un groupe de 40 personnes où tu n'entends rien et ne peux rien demander. Tu choisis, tu personnalises, tu comprends.
        </p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">🗓️</div>
            <h3>Choisis tes dates</h3>
            <p>Renseigne tes dates d'arrivée à Makkah et Madinah, la taille de ton groupe (famille, solo, couple).</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">🗣️</div>
            <h3>Filtre par langue</h3>
            <p>Sélectionne ta langue maternelle. Ton guide te parlera dans ta langue, te racontera l'histoire, t'expliquera chaque du'a.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">🕌</div>
            <h3>Personnalise ton programme</h3>
            <p>Choisis les lieux à visiter, avec ou sans voiture du guide, van pour famille, durée courte ou longue.</p>
          </div>
          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-icon">✨</div>
            <h3>Vis ton Omra</h3>
            <p>Ton guide t'attend à l'aéroport ou à l'hôtel. Tu commences un voyage spirituel unique, intime, en famille.</p>
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section id="guides" className="bg-dark" style={{ padding: "6rem 4rem" }}>
        <div className="section-label">Nos guides</div>
        <h2>
          Des guides qui <em>parlent ta langue</em><br />
          et connaissent chaque pierre
        </h2>
        <p className="section-sub">
          Chaque guide est vérifié, certifié et évalué par la communauté. Ils vivent à Makkah ou Madinah depuis des années.
        </p>
        <div className="guides-grid">
          <div className="guide-profile">
            <div className="guide-top">
              <div className="guide-avatar-dark" style={{ background: "linear-gradient(135deg, #F0D897, #C9A84C)" }}>
                RA
              </div>
              <div>
                <div className="guide-name">Rachid Al-Madani</div>
                <div className="guide-origin">🇸🇦 Madinah, 12 ans d'expérience</div>
                <div className="guide-stars">★★★★★ (214 avis)</div>
              </div>
            </div>
            <div className="guide-langs">
              <span className="lang-pill">🇫🇷 Français</span>
              <span className="lang-pill">🇦🇱 Arabe</span>
              <span className="lang-pill">🇬🇧 English</span>
            </div>
            <div className="services-tags">
              <span className="stag">Rituels Omra complets</span>
              <span className="stag">Jabal Uhud</span>
              <span className="stag">Masjid Quba</span>
              <span className="stag">Grotte Hira</span>
              <span className="stag">Train Haramain</span>
              <span className="stag">Voiture incluse</span>
            </div>
            <div className="guide-footer">
              <div className="guide-price-dark">
                380€ <small>/ pers · 3 jours</small>
              </div>
              <Link href="/guides/1" className="btn-book-dark">
                Voir profil
              </Link>
            </div>
          </div>

          <div className="guide-profile">
            <div className="guide-top">
              <div className="guide-avatar-dark" style={{ background: "linear-gradient(135deg, #9FE1CB, #1D9E75)" }}>
                FO
              </div>
              <div>
                <div className="guide-name">Fatima Al-Omari</div>
                <div className="guide-origin">🇸🇦 Makkah, 8 ans d'expérience</div>
                <div className="guide-stars">★★★★★ (178 avis)</div>
              </div>
            </div>
            <div className="guide-langs">
              <span className="lang-pill">🇫🇷 Français</span>
              <span className="lang-pill">🇲🇦 Darija</span>
              <span className="lang-pill">🇹🇷 Türkçe</span>
            </div>
            <div className="services-tags">
              <span className="stag">Guide femme (familles)</span>
              <span className="stag">Rituels Omra</span>
              <span className="stag">Masjid Al-Haram</span>
              <span className="stag">Zam-Zam</span>
              <span className="stag">Musée du Coran</span>
              <span className="stag">Van 9 places</span>
            </div>
            <div className="guide-footer">
              <div className="guide-price-dark">
                320€ <small>/ pers · 3 jours</small>
              </div>
              <Link href="/guides/2" className="btn-book-dark">
                Voir profil
              </Link>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/guides" className="btn-book-dark" style={{ fontSize: "0.88rem", padding: "0.8rem 2rem" }}>
            Voir tous les guides →
          </Link>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages">
        <div className="section-label">Nos forfaits</div>
        <h2>Un programme pour <em>chaque pèlerin</em></h2>
        <p className="section-sub">Que tu aies 3 jours ou 10 jours, seul ou en famille, il existe un forfait fait pour toi.</p>
        <div className="packages-grid">
          <div className="package-card">
            <div className="package-icon">🌙</div>
            <h3>Omra Essentielle</h3>
            <p className="pkg-sub">Pour ceux qui viennent faire l'Omra et comprendre chaque rituel en profondeur</p>
            <ul className="pkg-features">
              <li><span className="pkg-check">✓</span> Tous les rituels expliqués</li>
              <li><span className="pkg-check">✓</span> 1 à 6 personnes max</li>
            </ul>
            <div className="pkg-price">
              280€ <small>/ pers · 2 jours</small>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="arabic-deco">بسم الله الرحمن الرحيم</div>
        <h2>
          Ton Omra mérite un guide<br />
          <em>à la hauteur de ta foi.</em>
        </h2>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/guides" className="btn-primary" style={{ background: "var(--gold)", color: "var(--deep)", fontWeight: 700 }}>
            Trouver mon guide →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
