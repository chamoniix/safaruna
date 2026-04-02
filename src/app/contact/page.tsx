'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUBJECTS = [
  'Réservation Omra',
  'Demande de guide',
  'Service transfert',
  'Service visa',
  'Service hôtels',
  'Question technique',
  'Partenariat',
  'Autre',
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', sujet: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .contact-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid #DDD7CC;
          border-radius: 12px;
          font-size: 0.875rem;
          font-family: var(--font-manrope, sans-serif);
          color: #1A1209;
          background: white;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .contact-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
        .contact-input::placeholder { color: #AEA491; }
        .contact-submit {
          width: 100%;
          padding: 1rem;
          background: #1A1209;
          color: #F0D897;
          border: none;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          font-family: var(--font-manrope, sans-serif);
        }
        .contact-submit:hover { background: #C9A84C; color: #1A1209; }
        .contact-submit:active { transform: scale(0.98); }
        .contact-info-card {
          background: white;
          border: 1px solid #EDE8DC;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .contact-info-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #FAF7F0;
          border: 1px solid #EDE8DC;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
      `}} />

      {/* Hero */}
      <section style={{ background: '#1A1209', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Nous contacter</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, margin: '0 0 1.25rem' }}>
            Une question ?<br />
            <span style={{ color: '#C9A84C' }}>Nous sommes là.</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            Notre équipe répond en moins de 24h. Pour les urgences, contactez-nous directement par WhatsApp.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ background: '#F5F2EC', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>

          {/* Form */}
          <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 20, padding: '2rem', boxShadow: '0 4px 24px rgba(26,18,9,0.06)' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A1209', margin: '0 0 1.75rem' }}>Envoyer un message</h2>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>Message envoyé !</div>
                <p style={{ fontSize: '0.875rem', color: '#7A6D5A', lineHeight: 1.6 }}>Nous vous répondrons dans les 24 heures. Consultez vos spams si besoin.</p>
                <button onClick={() => setSent(false)} style={{ marginTop: '1.5rem', padding: '0.65rem 1.75rem', borderRadius: 50, border: '1.5px solid #1A1209', background: 'none', fontSize: '0.8rem', fontWeight: 700, color: '#1A1209', cursor: 'pointer' }}>Envoyer un autre message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Nom *</label>
                    <input className="contact-input" required placeholder="Al-Madani" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Prénom *</label>
                    <input className="contact-input" required placeholder="Rachid" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Email *</label>
                  <input className="contact-input" type="email" required placeholder="rachid@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Téléphone</label>
                  <input className="contact-input" type="tel" placeholder="+33 6 12 34 56 78" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Sujet *</label>
                  <select className="contact-input" required value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}>
                    <option value="">Sélectionner un sujet...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>Message *</label>
                  <textarea className="contact-input" required rows={5} placeholder="Décrivez votre demande..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical', minHeight: 120 }} />
                </div>

                <button type="submit" className="contact-submit">Envoyer le message</button>
                <p style={{ fontSize: '0.68rem', color: '#AEA491', textAlign: 'center', margin: 0 }}>Réponse garantie sous 24h · Données protégées</p>
              </form>
            )}
          </div>

          {/* Coordinates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Coordonnées</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                <div className="contact-info-card">
                  <div className="contact-info-icon">✉</div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>Email</div>
                    <a href="mailto:contact@safaruma.com" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209', textDecoration: 'none' }}>contact@safaruma.com</a>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">📞</div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>Téléphone</div>
                    <a href="tel:+33187661234" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209', textDecoration: 'none' }}>+33 1 87 66 12 34</a>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">💬</div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>WhatsApp</div>
                    <a href="https://wa.me/33755981234" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209', textDecoration: 'none' }}>+33 7 55 98 12 34</a>
                    <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>Lun–Sam · 9h–20h</div>
                  </div>
                </div>

              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Bureaux</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                <div className="contact-info-card">
                  <div className="contact-info-icon">🗼</div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>Paris — Siège</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209' }}>12 Rue de la Paix</div>
                    <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>75001 Paris, France</div>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">🕌</div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>Makkah — Bureau local</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1209' }}>Al-Aziziyah District</div>
                    <div style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>Makkah Al-Mukarramah, KSA</div>
                  </div>
                </div>

              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Horaires</div>
              <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
                {[
                  { j: 'Lundi – Vendredi', h: '9h00 – 20h00' },
                  { j: 'Samedi', h: '10h00 – 18h00' },
                  { j: 'Dimanche', h: 'Fermé' },
                ].map(({ j, h }) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: '1px solid #F5F2EC', color: '#5A4E3A' }}>
                    <span>{j}</span>
                    <span style={{ fontWeight: 700, color: h === 'Fermé' ? '#AEA491' : '#1A1209' }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
