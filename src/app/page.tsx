import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ════════════════════════════════════════════════════════
          HERO — split layout avec guide card premium
          ════════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot"></span> Première plateforme Omra guide privé
          </div>
          <h1>
            <em>Vis ton Omra</em>
            <strong>comme elle mérite<br />d&apos;être vécue.</strong>
          </h1>
          <p className="hero-sub">
            Ton guide privé parle ta langue, te raconte chaque pierre de Makkah et Madinah, et fait de ton Omra un voyage spirituel inoubliable — en famille, sans foule, sans compromis.
          </p>
          <div className="hero-actions">
            <Link href="/guides" className="btn-primary">
              Trouver mon guide →
            </Link>
            <Link href="#comment" className="btn-secondary">
              Comment ça marche
            </Link>
          </div>
          {/* Mini trust */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[
              { n: '320+',  l: 'Guides certifiés' },
              { n: '4.97★', l: 'Note moyenne' },
              { n: '98%',   l: 'Satisfaction' },
            ].map(x => (
              <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--deep)' }}>{x.n}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-stat top-left">
            <strong>4.97 ★</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Note moyenne</span>
          </div>

          <div className="guide-card">
            {/* Header */}
            <div className="guide-card-header">
              <div className="avatar">شر</div>
              <div>
                <div className="guide-info">
                  <h3>Cheikh Rachid Al-Madani</h3>
                  <p>Guide certifié · Makkah &amp; Madinah · 12 ans</p>
                </div>
                <div className="stars">★★★★★</div>
                <div className="verified-badge">✓ Vérifié SAFARUNA</div>
              </div>
            </div>
            {/* Languages */}
            <div className="lang-chips">
              <span className="chip active">🇫🇷 Français</span>
              <span className="chip">🇸🇦 Arabe</span>
              <span className="chip">🇬🇧 English</span>
            </div>
            {/* Services */}
            <div className="service-list">
              <div className="service-item"><span className="check">✓</span> Rituels complets de l&apos;Omra</div>
              <div className="service-item"><span className="check">✓</span> Jabal Al-Nour · Grotte de Hira</div>
              <div className="service-item"><span className="check">✓</span> Jabal Uhud &amp; Badr</div>
              <div className="service-item"><span className="check">✓</span> Voiture 7 places + Train Haramain</div>
              <div className="service-item"><span className="check">✓</span> Du&apos;a &amp; récitations expliqués</div>
            </div>
            {/* Price */}
            <div className="price-row">
              <div>
                <div className="price-label">Forfait Omra &amp; Histoire · 5 jours</div>
                <div className="price">450€ <span>/ personne</span></div>
              </div>
              <Link href="/guides/rachid-al-madani" className="btn-book" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Voir profil
              </Link>
            </div>
          </div>

          <div className="floating-stat bottom-right">
            <strong>2 400+</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Pèlerins accompagnés</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST STRIP
          ════════════════════════════════════════════════════════ */}
      <div className="trust">
        <div className="trust-item"><strong>320+</strong><span>Guides certifiés</span></div>
        <div className="trust-item"><strong>12 pays</strong><span>Langues couvertes</span></div>
        <div className="trust-item"><strong>98%</strong><span>Satisfaction</span></div>
        <div className="trust-item"><strong>&#60; 2h</strong><span>Temps de réponse</span></div>
        <div className="trust-item"><strong>0 compromis</strong><span>Sur les rituels</span></div>
      </div>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════ */}
      <section id="comment">
        <div className="section-label">Processus simple</div>
        <h2>En 4 étapes, ton Omra<br /><em>devient inoubliable</em></h2>
        <p className="section-sub">
          Plus besoin de suivre un groupe de 40 personnes. Tu choisis ton guide, tu personnalises ton programme, tu comprends chaque lieu.
        </p>
        <div className="steps-grid">
          {[
            { n: '01', icon: '🗓️', t: 'Choisis tes dates',           p: "Renseigne tes dates d'arrivée à Makkah et Madinah, la taille de ton groupe — solo, couple ou famille." },
            { n: '02', icon: '🗣️', t: 'Filtre par langue',           p: "Sélectionne ta langue maternelle. Ton guide te parlera ta langue, t'expliquera chaque du'a et chaque ritual." },
            { n: '03', icon: '🕌', t: 'Personnalise ton programme',   p: "Choisis les lieux à visiter, avec ou sans voiture, van pour famille, 3 jours ou 10 jours." },
            { n: '04', icon: '✨', t: 'Vis ton Omra',                 p: "Ton guide t'attend à l'aéroport ou à l'hôtel. Un voyage spirituel unique, intime, profond." },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          GUIDES SECTION (dark bg)
          ════════════════════════════════════════════════════════ */}
      <section id="guides" className="bg-dark" style={{ padding: "6rem 4rem" }}>
        <div className="section-label">Nos guides</div>
        <h2>Des guides qui <em>parlent ta langue</em><br />et connaissent chaque pierre</h2>
        <p className="section-sub">
          Chaque guide est vérifié, certifié et évalué par la communauté. Ils vivent à Makkah ou Madinah depuis des années.
        </p>

        <div className="guides-grid">
          {[
            {
              slug: 'rachid-al-madani', initials: 'RA', gradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
              name: 'Rachid Al-Madani', origin: '🇸🇦 Madinah · 12 ans', stars: '★★★★★ (214 avis)',
              langs: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'],
              tags: ['Rituels Omra complets', 'Jabal Uhud', 'Grotte Hira', 'Train Haramain', 'Voiture incluse'],
              price: '380€', sub: '/ pers · 3 jours',
            },
            {
              slug: 'fatima-al-omari', initials: 'FA', gradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
              name: 'Fatima Al-Omari', origin: '🇸🇦 Makkah · 8 ans · Guide femme', stars: '★★★★★ (178 avis)',
              langs: ['🇫🇷 Français', '🇲🇦 Darija'],
              tags: ['Guide femme', 'Rituels Omra', 'Masjid Al-Haram', 'Zamzam', 'Van 9 places'],
              price: '320€', sub: '/ pers · 3 jours',
            },
            {
              slug: 'youssouf-konate', initials: 'YK', gradient: 'linear-gradient(135deg, #D4E8A0, #5A8A20)',
              name: 'Youssouf Konaté', origin: '🇸🇦 Makkah · 6 ans · Afrique de l\'Ouest', stars: '★★★★★ (94 avis)',
              langs: ['🇫🇷 Français', '🇸🇳 Wolof'],
              tags: ['Omra complète', 'Jabal Al-Nour', 'Voiture incluse', 'Familles'],
              price: '240€', sub: '/ pers · 3 jours',
            },
          ].map(g => (
            <div key={g.slug} className="guide-profile">
              <div className="guide-top">
                <div className="guide-avatar-dark" style={{ background: g.gradient }}>{g.initials}</div>
                <div>
                  <div className="guide-name">{g.name}</div>
                  <div className="guide-origin">{g.origin}</div>
                  <div className="guide-stars">{g.stars}</div>
                </div>
              </div>
              <div className="guide-langs">
                {g.langs.map(l => <span key={l} className="lang-pill">{l}</span>)}
              </div>
              <div className="services-tags">
                {g.tags.map(t => <span key={t} className="stag">{t}</span>)}
              </div>
              <div className="guide-footer">
                <div className="guide-price-dark">{g.price} <small>{g.sub}</small></div>
                <Link href={`/guides/${g.slug}`} className="btn-book-dark">Voir profil</Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/guides" className="btn-book-dark" style={{ fontSize: "0.9rem", padding: "0.85rem 2.5rem" }}>
            Voir les {`${5}`} guides →
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PACKAGES — 3 forfaits complets
          ════════════════════════════════════════════════════════ */}
      <section id="packages">
        <div className="section-label">Nos forfaits</div>
        <h2>Un programme pour <em>chaque pèlerin</em></h2>
        <p className="section-sub">
          Que tu aies 3 jours ou 10 jours, seul, en couple ou en famille — il existe un forfait fait pour toi.
        </p>

        <div className="packages-grid">
          <div className="package-card">
            <div className="package-icon">🌙</div>
            <h3>Omra Essentielle</h3>
            <p className="pkg-sub">Pour ceux qui viennent accomplir l&apos;Omra et comprendre chaque rituel en profondeur avec un guide dédié.</p>
            <ul className="pkg-features">
              <li><span className="pkg-check">✓</span> Tous les rituels expliqués (tawaf, sa&apos;i)</li>
              <li><span className="pkg-check">✓</span> Orientation Masjid Al-Haram &amp; Zamzam</li>
              <li><span className="pkg-check">✓</span> Livret du&apos;a illustré offert</li>
              <li><span className="pkg-check">✓</span> Disponibilité 24h/24 par WhatsApp</li>
              <li><span className="pkg-check">✓</span> 1 à 8 personnes</li>
            </ul>
            <div className="pkg-price">280€ <small>/ pers · 2–3 jours</small></div>
            <Link href="/guides" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.85rem' }}>
              Trouver un guide →
            </Link>
          </div>

          <div className="package-card featured">
            <div className="package-icon">🕌</div>
            <h3>Omra &amp; Histoire</h3>
            <p className="pkg-sub">L&apos;immersion complète : rituels + visites des lieux historiques de la Sîra prophétique avec voiture incluse.</p>
            <ul className="pkg-features">
              <li><span className="pkg-check">✓</span> Tout ce qui est inclus dans Essentielle</li>
              <li><span className="pkg-check">✓</span> Voiture privée 7 places pour les visites</li>
              <li><span className="pkg-check">✓</span> Jabal Al-Nour, Jabal Thawr, Jabal Uhud</li>
              <li><span className="pkg-check">✓</span> Train Haramain Makkah ↔ Madinah</li>
              <li><span className="pkg-check">✓</span> Masjid Quba, Al-Baqi&apos;, Rawdah</li>
              <li><span className="pkg-check">✓</span> Conférence Sîra prophétique (1h)</li>
            </ul>
            <div className="pkg-price">450€ <small>/ pers · 5 jours</small></div>
            <Link href="/guides" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.85rem' }}>
              Trouver un guide →
            </Link>
          </div>

          <div className="package-card">
            <div className="package-icon">🌟</div>
            <h3>Grand Voyage Spirituel</h3>
            <p className="pkg-sub">Le voyage complet : Makkah, Madinah, Badr, Ohoud et tous les sites majeurs. Adapté PMR. Tout inclus.</p>
            <ul className="pkg-features">
              <li><span className="pkg-check">✓</span> Tout ce qui est inclus dans Omra &amp; Histoire</li>
              <li><span className="pkg-check">✓</span> Makkah + Madinah + Badr + Ohoud</li>
              <li><span className="pkg-check">✓</span> Adapté PMR (fauteuil roulant disponible)</li>
              <li><span className="pkg-check">✓</span> Hôtel 5★ sélectionné à 200m du Haram</li>
              <li><span className="pkg-check">✓</span> Album photo souvenir du voyage</li>
              <li><span className="pkg-check">✓</span> 1 à 12 personnes</li>
            </ul>
            <div className="pkg-price">780€ <small>/ pers · 10 jours</small></div>
            <Link href="/guides" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.85rem' }}>
              Trouver un guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--sand)' }}>
        <div className="section-label">Ils en parlent</div>
        <h2>Ce que disent nos <em>pèlerins</em></h2>
        <div className="testimonials-grid">
          {[
            { q: "Rachid nous a fait vivre l'histoire à chaque pas. La montée de Jabal Nour avec ses explications était le moment le plus fort de notre vie. Incroyable.", name: 'Karim L.', city: '🇫🇷 Lyon', init: 'KL' },
            { q: "Fatima est une perle. En tant que groupe de femmes, nous nous sommes senties parfaitement en sécurité et accompagnées. Elle a su adapter son rythme à tout le monde.", name: 'Safia M.', city: '🇧🇪 Bruxelles', init: 'SM' },
            { q: "Youssouf parle Wolof et connaît les Lieux Saints mieux que quiconque. Pour notre communauté sénégalaise, c'est rare et précieux. Toute la famille est repartie transformée.", name: 'Ibrahima D.', city: '🇸🇳 Dakar', init: 'ID' },
          ].map(t => (
            <div key={t.name} className="testi-card">
              <p className="testi-quote">&ldquo;{t.q}&rdquo;</p>
              <div className="testi-footer">
                <div className="testi-avatar">{t.init}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-city">{t.city} · <span style={{ color: 'var(--gold)', letterSpacing: 1 }}>★★★★★</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          GUIDE CTA — Devenir guide
          ════════════════════════════════════════════════════════ */}
      <section className="bg-dark" style={{ padding: '5rem 4rem' }}>
        <div className="section-label">Vous êtes guide ?</div>
        <h2>Rejoignez la plateforme et<br /><em>gagnez votre vie avec votre savoir</em></h2>
        <p className="section-sub">
          320 guides gagnent en moyenne 3 200€/mois sur SAFARUNA. Inscription gratuite, commission transparente, paiement sécurisé.
        </p>
        <div className="revenue-grid">
          {[
            { icon: '💰', t: '3 200€ / mois',  p: 'Revenus moyens d\'un guide actif sur SAFARUNA' },
            { icon: '📱', t: 'Tableau de bord', p: 'Gérez vos disponibilités, demandes et paiements en temps réel' },
            { icon: '🔒', t: 'Paiement sécurisé', p: 'Virement mensuel garanti, commission transparente de 12%' },
            { icon: '🏆', t: 'Badge Vérifié',    p: 'Processus de certification reconnu par les pèlerins' },
          ].map(r => (
            <div key={r.t} className="revenue-card">
              <div className="r-icon">{r.icon}</div>
              <h4>{r.t}</h4>
              <p>{r.p}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '3rem' }}>
          <Link href="/guide/inscription" className="btn-primary">
            Devenir guide SAFARUNA →
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FINAL
          ════════════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="arabic-deco" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: 'rgba(201,168,76,0.4)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
          بسم الله الرحمن الرحيم
        </div>
        <h2 style={{ color: 'white' }}>
          Ton Omra mérite un guide<br />
          <em style={{ color: 'var(--gold)' }}>à la hauteur de ta foi.</em>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '1rem auto 2.5rem', lineHeight: 1.8, fontSize: '0.95rem' }}>
          Rejoins des milliers de pèlerins francophones qui ont vécu une Omra privée, personnalisée et spirituellement riche.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/guides" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--deep)', fontWeight: 700 }}>
            Trouver mon guide →
          </Link>
          <Link href="/comment-ca-marche" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
            En savoir plus
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
