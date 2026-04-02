import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CounterStrip from "@/components/CounterStrip";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* ════════════════════════════════════════════════════════
          HERO — cinematic split layout
          ════════════════════════════════════════════════════════ */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Animated ambient gradient */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 90% at 65% 40%, rgba(201,168,76,0.10) 0%, transparent 65%)',
          animation: 'heroGlow 6s ease-in-out infinite',
        }} />
        {/* Arabic watermark */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          fontFamily: 'var(--font-cormorant, serif)',
          fontSize: 'clamp(6rem, 18vw, 14rem)',
          color: 'rgba(201,168,76,0.05)',
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
          direction: 'rtl', zIndex: 0,
          animation: 'floatY 10s ease-in-out infinite',
        }}>
          مكة
        </div>

        {/* LEFT — text */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge anim-fade-up" style={{ animation: 'fadeInUp 0.7s ease both' }}>
            <span className="dot"></span> Première plateforme Omra guide privé
          </div>
          <h1 style={{ animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0 }}>
            <em>Vis ton Omra</em>
            <strong>comme elle mérite<br />d&apos;être vécue.</strong>
          </h1>
          <p className="hero-sub" style={{ animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            Ton guide privé parle ta langue, te raconte chaque pierre de Makkah et Madinah, et fait de ton Omra un voyage spirituel inoubliable — en famille, sans foule, sans compromis.
          </p>
          <div className="hero-actions" style={{ animation: 'fadeInUp 0.8s 0.45s ease both', opacity: 0 }}>
            <Link href="/guides" className="btn-primary">
              Trouver mon guide →
            </Link>
            <Link href="#comment" className="btn-secondary">
              Comment ça marche
            </Link>
          </div>

          {/* Trust mini-row */}
          <div style={{
            display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap',
            animation: 'fadeInUp 0.8s 0.6s ease both', opacity: 0,
          }}>
            {[
              { n: '320+',  l: 'Guides certifiés' },
              { n: '4.97★', l: 'Note moyenne' },
              { n: '98%',   l: 'Satisfaction' },
            ].map(x => (
              <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--deep)' }}>{x.n}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{x.l}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap', animation: 'fadeInUp 0.8s 0.75s ease both', opacity: 0 }}>
            <span className="badge-verified">✓ Guides vérifiés</span>
            <span className="badge-trust">🛡️ Paiement sécurisé</span>
            <span className="badge-certified">🎓 Mutawwif certifiés</span>
          </div>
        </div>

        {/* RIGHT — guide card */}
        <div className="hero-visual" style={{ position: 'relative', zIndex: 1, animation: 'fadeInLeft 0.9s 0.2s ease both', opacity: 0 }}>
          <div className="floating-stat top-left anim-float" style={{ animationDelay: '0.5s' }}>
            <strong>4.97 ★</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Note moyenne</span>
          </div>

          <div className="guide-card" style={{ boxShadow: '0 40px 100px rgba(26,18,9,0.15), 0 0 0 1px rgba(201,168,76,0.12)' }}>
            <div className="guide-card-header">
              <div className="avatar" style={{ background: 'linear-gradient(135deg, #F0D897, #C9A84C)' }}>RA</div>
              <div>
                <div className="guide-info">
                  <h3>Cheikh Rachid Al-Madani</h3>
                  <p>Guide certifié · Makkah &amp; Madinah · 14 ans</p>
                </div>
                <div className="stars">★★★★★</div>
                <div className="verified-badge">✓ Vérifié SAFARUNA</div>
              </div>
            </div>
            <div className="lang-chips">
              <span className="chip active">🇫🇷 Français</span>
              <span className="chip">🇸🇦 Arabe</span>
              <span className="chip">🇬🇧 English</span>
            </div>
            <div className="service-list">
              <div className="service-item"><span className="check">✓</span> Rituels complets de l&apos;Omra</div>
              <div className="service-item"><span className="check">✓</span> Jabal Al-Nour · Grotte de Hira</div>
              <div className="service-item"><span className="check">✓</span> Jabal Uhud &amp; Badr</div>
              <div className="service-item"><span className="check">✓</span> Voiture 7 places + Train Haramain</div>
              <div className="service-item"><span className="check">✓</span> Du&apos;a &amp; récitations expliqués</div>
            </div>
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

          <div className="floating-stat bottom-right anim-float" style={{ animationDelay: '1.2s' }}>
            <strong>2 400+</strong>
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>Pèlerins accompagnés</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST STRIP — animated counters
          ════════════════════════════════════════════════════════ */}
      <CounterStrip />

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════ */}
      <section id="comment">
        <div className="section-label reveal">Processus simple</div>
        <h2 className="reveal reveal-d1">En 4 étapes, ton Omra<br /><em>devient inoubliable</em></h2>
        <p className="section-sub reveal reveal-d2">
          Plus besoin de suivre un groupe de 40 personnes. Tu choisis ton guide, tu personnalises ton programme, tu comprends chaque lieu.
        </p>
        <div className="steps-grid">
          {[
            { n: '01', icon: '🗓️', t: 'Choisis tes dates',          p: "Renseigne tes dates d'arrivée à Makkah et Madinah, la taille de ton groupe — solo, couple ou famille." },
            { n: '02', icon: '🗣️', t: 'Filtre par langue',           p: "Sélectionne ta langue maternelle. Ton guide te parlera ta langue, t'expliquera chaque du'a et chaque rituel." },
            { n: '03', icon: '🕌', t: 'Personnalise ton programme',   p: "Choisis les lieux à visiter, avec ou sans voiture, van pour famille, 3 jours ou 10 jours." },
            { n: '04', icon: '✨', t: 'Vis ton Omra',                 p: "Ton guide t'attend à l'aéroport ou à l'hôtel. Un voyage spirituel unique, intime, profond." },
          ].map((s, i) => (
            <div key={s.n} className={`step-card reveal reveal-d${i + 1}`}>
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
        <div className="section-label reveal" style={{ color: 'var(--gold)' }}>Nos guides</div>
        <h2 className="reveal reveal-d1">Des guides qui <em>parlent ta langue</em><br />et connaissent chaque pierre</h2>
        <p className="section-sub reveal reveal-d2">
          Chaque guide est vérifié, certifié et évalué par la communauté. Ils vivent à Makkah ou Madinah depuis des années.
        </p>

        <div className="guides-grid">
          {[
            {
              slug: 'rachid-al-madani', initials: 'RA', gradient: 'linear-gradient(135deg, #F0D897, #C9A84C)',
              name: 'Rachid Al-Madani', origin: '🇸🇦 Madinah · 14 ans', stars: '★★★★★ (214 avis)',
              langs: ['🇫🇷 Français', '🇸🇦 Arabe', '🇬🇧 English'],
              tags: ['Rituels Omra complets', 'Jabal Uhud', 'Grotte Hira', 'Train Haramain', 'Voiture incluse'],
              price: '450€', sub: '/ pers · 5 jours',
              delay: 'reveal-d1',
            },
            {
              slug: 'fatima-al-omari', initials: 'FA', gradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)',
              name: 'Fatima Al-Omari', origin: '🇸🇦 Makkah · 8 ans · Guide femme', stars: '★★★★★ (178 avis)',
              langs: ['🇫🇷 Français', '🇲🇦 Darija'],
              tags: ['Guide femme', 'Rituels Omra', 'Masjid Al-Haram', 'Zamzam', 'Van 9 places'],
              price: '320€', sub: '/ pers · 3 jours',
              delay: 'reveal-d2',
            },
            {
              slug: 'youssouf-konate', initials: 'YK', gradient: 'linear-gradient(135deg, #F7D774, #E8A020)',
              name: 'Youssouf Konaté', origin: '🇸🇦 Makkah · 6 ans · Afrique de l\'Ouest', stars: '★★★★★ (94 avis)',
              langs: ['🇫🇷 Français', '🇸🇳 Wolof'],
              tags: ['Omra complète', 'Jabal Al-Nour', 'Voiture incluse', 'Familles'],
              price: '280€', sub: '/ pers · 3 jours',
              delay: 'reveal-d3',
            },
          ].map(g => (
            <div key={g.slug} className={`guide-profile reveal ${g.delay}`}>
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

        <div className="reveal" style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/guides" className="btn-book-dark" style={{ fontSize: "0.9rem", padding: "0.85rem 2.5rem" }}>
            Voir les 5 guides →
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PACKAGES — 3 forfaits
          ════════════════════════════════════════════════════════ */}
      <section id="packages">
        <div className="section-label reveal">Nos forfaits</div>
        <h2 className="reveal reveal-d1">Un programme pour <em>chaque pèlerin</em></h2>
        <p className="section-sub reveal reveal-d2">
          Que tu aies 3 jours ou 10 jours, seul, en couple ou en famille — il existe un forfait fait pour toi.
        </p>

        <div className="packages-grid">
          {[
            {
              icon: '🌙', title: 'Omra Essentielle', featured: false,
              sub: "Pour ceux qui viennent accomplir l'Omra et comprendre chaque rituel en profondeur avec un guide dédié.",
              features: ["Tous les rituels expliqués (tawaf, sa'i)", "Orientation Masjid Al-Haram & Zamzam", "Livret du'a illustré offert", "Disponibilité 24h/24 par WhatsApp", "1 à 8 personnes"],
              price: '280€', sub2: '/ pers · 2–3 jours', delay: 'reveal-d1',
            },
            {
              icon: '🕌', title: 'Omra & Histoire', featured: true,
              sub: "L'immersion complète : rituels + visites des lieux historiques de la Sîra prophétique avec voiture incluse.",
              features: ["Tout ce qui est inclus dans Essentielle", "Voiture privée 7 places pour les visites", "Jabal Al-Nour, Jabal Thawr, Jabal Uhud", "Train Haramain Makkah ↔ Madinah", "Masjid Quba, Al-Baqi', Rawdah", "Conférence Sîra prophétique (1h)"],
              price: '450€', sub2: '/ pers · 5 jours', delay: 'reveal-d2',
            },
            {
              icon: '🌟', title: 'Grand Voyage Spirituel', featured: false,
              sub: "Le voyage complet : Makkah, Madinah, Badr, Ohoud et tous les sites majeurs. Adapté PMR. Tout inclus.",
              features: ["Tout ce qui est inclus dans Omra & Histoire", "Makkah + Madinah + Badr + Ohoud", "Adapté PMR (fauteuil roulant disponible)", "Hôtel 5★ sélectionné à 200m du Haram", "Album photo souvenir du voyage", "1 à 12 personnes"],
              price: '780€', sub2: '/ pers · 10 jours', delay: 'reveal-d3',
            },
          ].map(p => (
            <div key={p.title} className={`package-card ${p.featured ? 'featured' : ''} reveal ${p.delay}`}>
              <div className="package-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p className="pkg-sub">{p.sub}</p>
              <ul className="pkg-features">
                {p.features.map(f => <li key={f}><span className="pkg-check">✓</span> {f}</li>)}
              </ul>
              <div className="pkg-price">{p.price} <small>{p.sub2}</small></div>
              <Link href="/guides" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', fontSize: '0.85rem' }}>
                Trouver un guide →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST SECTION — Quran quote + guarantees
          ════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 2rem' }}>
        <div className="trust-section reveal">
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', color: 'rgba(201,168,76,0.6)', marginBottom: '0.5rem', direction: 'rtl' }}>
            وَمَن يَخْرُجْ مِن بَيْتِهِ مُهَاجِرًا إِلَى اللَّهِ
          </div>
          <p className="quran-quote">&ldquo;Et quiconque sort de chez lui en émigrant vers Allah et Son Messager…&rdquo;</p>
          <p className="quran-ref">Sourate An-Nisaa · 4:100</p>

          <div className="trust-grid">
            {[
              { icon: '🛡️', t: 'Guides vérifiés',      p: "Chaque guide passe par un processus de certification rigoureux avant d'être listé." },
              { icon: '💳', t: 'Paiement sécurisé',     p: "Transactions chiffrées, remboursement garanti en cas d'annulation." },
              { icon: '⏱️', t: 'Réponse < 2h',          p: "Nos guides s'engagent à répondre en moins de 2h à toute demande." },
              { icon: '🕌', t: 'Rituels garantis',       p: "0 compromis sur les rituels. Chaque guide est certifié mutawwif." },
            ].map((c, i) => (
              <div key={c.t} className={`trust-card reveal reveal-d${i + 1}`}>
                <div className="t-icon">{c.icon}</div>
                <h4>{c.t}</h4>
                <p>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--sand)' }}>
        <div className="section-label reveal">Ils en parlent</div>
        <h2 className="reveal reveal-d1">Ce que disent nos <em>pèlerins</em></h2>
        <div className="testimonials-grid">
          {[
            { q: "Rachid nous a fait vivre l'histoire à chaque pas. La montée de Jabal Nour avec ses explications était le moment le plus fort de notre vie. Incroyable.", name: 'Karim L.', city: '🇫🇷 Lyon', init: 'KL', d: 'reveal-d1' },
            { q: "Fatima est une perle. En tant que groupe de femmes, nous nous sommes senties parfaitement en sécurité et accompagnées. Elle a su adapter son rythme à tout le monde.", name: 'Safia M.', city: '🇧🇪 Bruxelles', init: 'SM', d: 'reveal-d2' },
            { q: "Youssouf parle Wolof et connaît les Lieux Saints mieux que quiconque. Pour notre communauté sénégalaise, c'est rare et précieux. Toute la famille est repartie transformée.", name: 'Ibrahima D.', city: '🇸🇳 Dakar', init: 'ID', d: 'reveal-d3' },
          ].map(t => (
            <div key={t.name} className={`testi-card reveal ${t.d}`}>
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
        <div className="section-label reveal" style={{ color: 'var(--gold)' }}>Vous êtes guide ?</div>
        <h2 className="reveal reveal-d1">Rejoignez la plateforme et<br /><em>gagnez votre vie avec votre savoir</em></h2>
        <p className="section-sub reveal reveal-d2">
          320 guides gagnent en moyenne 3 200€/mois sur SAFARUNA. Inscription gratuite, commission transparente, paiement sécurisé.
        </p>
        <div className="revenue-grid">
          {[
            { icon: '💰', t: '3 200€ / mois',    p: "Revenus moyens d'un guide actif sur SAFARUNA" },
            { icon: '📱', t: 'Tableau de bord',   p: "Gérez vos disponibilités, demandes et paiements en temps réel" },
            { icon: '🔒', t: 'Paiement sécurisé', p: "Virement mensuel garanti, commission transparente de 12%" },
            { icon: '🏆', t: 'Badge Vérifié',      p: "Processus de certification reconnu par les pèlerins" },
          ].map((r, i) => (
            <div key={r.t} className={`revenue-card reveal reveal-d${i + 1}`}>
              <div className="r-icon">{r.icon}</div>
              <h4>{r.t}</h4>
              <p>{r.p}</p>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ marginTop: '3rem' }}>
          <Link href="/guide/inscription" className="btn-primary">
            Devenir guide SAFARUNA →
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FINAL
          ════════════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="arabic-deco reveal" style={{
          fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem',
          color: 'rgba(201,168,76,0.4)', marginBottom: '1.5rem', letterSpacing: '0.1em',
        }}>
          بسم الله الرحمن الرحيم
        </div>
        <h2 className="reveal reveal-d1" style={{ color: 'white' }}>
          Ton Omra mérite un guide<br />
          <em style={{ color: 'var(--gold)' }}>à la hauteur de ta foi.</em>
        </h2>
        <p className="reveal reveal-d2" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '1rem auto 2.5rem', lineHeight: 1.8, fontSize: '0.95rem' }}>
          Rejoins des milliers de pèlerins francophones qui ont vécu une Omra privée, personnalisée et spirituellement riche.
        </p>
        <div className="reveal reveal-d3" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
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
