'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GuideDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[var(--cream)] overflow-hidden font-sans text-[var(--deep)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar { width: 260px; background: white; border-right: 1px solid var(--sand); display: flex; flex-direction: column; overflow-y: auto; }
        .sidebar-header { padding: 1.5rem; border-bottom: 1px solid var(--sand); text-align: center; }
        .guide-avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1rem; object-fit: cover; border: 3px solid var(--cream); box-shadow: 0 4px 12px rgba(0,0,0,.05); }
        .guide-name { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: var(--deep); line-height: 1.2; margin-bottom: .25rem; }
        .guide-badge { display: inline-block; background: var(--gold-pale); color: var(--gold-dark); font-size: .65rem; font-weight: 700; padding: .15rem .6rem; border-radius: 50px; border: 1px solid rgba(201,168,76,.3); margin-top: .25rem; }
        
        .sidebar-nav { padding: 1.5rem 1rem; flex: 1; }
        .nav-link { display: flex; align-items: center; gap: .75rem; padding: .85rem 1rem; color: var(--muted); font-size: .85rem; font-weight: 500; border-radius: var(--radius-sm); margin-bottom: .25rem; transition: all .2s; cursor: pointer; border: none; background: transparent; width: 100%; text-align: left; }
        .nav-link:hover { background: var(--cream); color: var(--gold-dark); }
        .nav-link.active { background: var(--deep); color: var(--gold-light); font-weight: 600; }
        .nav-icon { font-size: 1.1rem; }
        
        .sidebar-footer { padding: 1.5rem 1rem; border-top: 1px solid var(--sand); }
        .logout-btn { display: flex; align-items: center; gap: .75rem; padding: .85rem 1rem; color: #E74C3C; font-size: .85rem; font-weight: 600; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left; border-radius: var(--radius-sm); transition: background .2s; }
        .logout-btn:hover { background: rgba(231,76,60,.1); }

        .main-content { flex: 1; overflow-y: auto; padding: 2rem 3rem; background: var(--cream); }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .welcome-text h1 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: var(--deep); margin-bottom: .25rem; }
        .welcome-text p { font-size: .85rem; color: var(--muted); }
        .top-actions { display: flex; gap: 1rem; align-items: center; }
        .status-toggle { display: flex; align-items: center; gap: .5rem; background: white; padding: .5rem 1rem; border-radius: 50px; border: 1px solid var(--sand); font-size: .75rem; font-weight: 600; color: var(--deep); }
        .toggle-dot { width: 10px; height: 10px; border-radius: 50%; background: #27AE60; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; border: 1px solid var(--sand); border-radius: var(--radius); padding: 1.5rem; }
        .stat-label { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: .5rem; display: flex; justify-content: space-between; align-items: center; }
        .stat-value { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: var(--deep); }
        .stat-sub { font-size: .75rem; color: #27AE60; font-weight: 600; margin-top: .25rem; }
        
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        
        .section-card { background: white; border: 1px solid var(--sand); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; }
        .sc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--sand); padding-bottom: 1rem; }
        .sc-title { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--deep); }
        .sc-link { font-size: .75rem; font-weight: 600; color: var(--gold-dark); text-decoration: none; }

        .booking-card { border: 1px solid var(--sand); border-radius: var(--radius-sm); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; transition: border-color .2s; }
        .booking-card:hover { border-color: var(--gold); }
        .bc-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .bc-client { display: flex; align-items: center; gap: .75rem; }
        .bc-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gold-pale); color: var(--gold-dark); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
        .bc-name { font-weight: 600; color: var(--deep); font-size: .95rem; }
        .bc-type { font-size: .7rem; color: var(--muted); }
        .bc-status { background: var(--green-bg); color: var(--green); padding: .25rem .75rem; border-radius: 50px; font-size: .7rem; font-weight: 700; border: 1px solid #A8E6CF; }
        .bc-status.pending { background: #FEF9E7; color: #F1C40F; border-color: #F9E79F; }
        .bc-details { display: flex; gap: 2rem; background: var(--cream); padding: 1rem; border-radius: var(--radius-sm); }
        .bcd-item { display: flex; flex-direction: column; gap: .25rem; }
        .bcd-label { font-size: .65rem; text-transform: uppercase; font-weight: 700; color: var(--muted); letter-spacing: .05em; }
        .bcd-val { font-size: .85rem; font-weight: 600; color: var(--deep); }
        .bc-actions { display: flex; gap: .75rem; justify-content: flex-end; }
        .btn { padding: .5rem 1rem; border-radius: var(--radius-sm); font-size: .75rem; font-weight: 600; cursor: pointer; border: none; transition: all .2s; }
        .btn-outline { border: 1.5px solid var(--sand); background: white; color: var(--deep); }
        .btn-outline:hover { border-color: var(--deep); }
        .btn-primary { background: var(--gold); color: var(--deep); border: 1.5px solid var(--gold); }
        .btn-primary:hover { background: var(--gold-dark); border-color: var(--gold-dark); color: white; }
        
        .notification-item { padding: 1rem 0; border-bottom: 1px solid var(--sand); display: flex; gap: 1rem; align-items: flex-start; }
        .notification-item:last-child { border-bottom: none; padding-bottom: 0; }
        .notif-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--gold-pale); display: flex; align-items: center; justify-content: center; font-size: .9rem; color: var(--gold-dark); flex-shrink: 0; }
        .notif-content p { font-size: .85rem; color: var(--deep); line-height: 1.4; margin-bottom: .25rem; }
        .notif-time { font-size: .7rem; color: var(--muted); }

        @media(max-width:1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:768px) {
          .flex-h-screen { flex-direction: column; }
          .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--sand); max-height: 200px; }
          .main-content { padding: 1.5rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .bc-details { flex-direction: column; gap: 1rem; }
        }
      `}} />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Image src="/guide-avatar.png" alt="Rachid" width={80} height={80} className="guide-avatar" />
          <div className="guide-name">Rachid Al-Madani</div>
          <div className="guide-badge">Guide Principal</div>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon">📊</span> Tableau de bord
          </button>
          <button className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <span className="nav-icon">📅</span> Mes réservations
          </button>
          <button className={`nav-link ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>
            <span className="nav-icon">⚙️</span> Mes disponibilités
          </button>
          <button className={`nav-link ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
            <span className="nav-icon">💰</span> Portefeuille
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn"><span className="nav-icon">🚪</span> Déconnexion</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="top-bar">
          <div className="welcome-text">
            <h1>Salut, Rachid.</h1>
            <p>Voici l'état de ton activité SAFARUNA aujourd'hui.</p>
          </div>
          <div className="top-actions">
            <div className="status-toggle">
              <div className="toggle-dot"></div>
              Disponible pour Omra
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Gains ce mois <span className="nav-icon">💶</span></div>
            <div className="stat-value">1,450€</div>
            <div className="stat-sub">+12% vs mois dernier</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Réservations actives <span className="nav-icon">🕋</span></div>
            <div className="stat-value">3</div>
            <div className="stat-sub">1 débute demain</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Note moyenne <span className="nav-icon">⭐</span></div>
            <div className="stat-value">4.97</div>
            <div className="stat-sub">Basé sur 214 avis</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="left-column">
            <div className="section-card">
              <div className="sc-header">
                <h2 className="sc-title">Prochaine Omra</h2>
                <Link href="#" className="sc-link">Voir le calendrier →</Link>
              </div>
              
              <div className="booking-card">
                <div className="bc-top">
                  <div className="bc-client">
                    <div className="bc-avatar">OD</div>
                    <div>
                      <div className="bc-name">Omar Diallo</div>
                      <div className="bc-type">Omra complète · Avec Famille (4 pers)</div>
                    </div>
                  </div>
                  <div className="bc-status">Confirmé</div>
                </div>
                
                <div className="bc-details">
                  <div className="bcd-item">
                    <span className="bcd-label">Date & Heure</span>
                    <span className="bcd-val">Ven 25 Nov · 08:30</span>
                  </div>
                  <div className="bcd-item">
                    <span className="bcd-label">Point de RDV</span>
                    <span className="bcd-val">Hôtel Swissôtel Makkah</span>
                  </div>
                  <div className="bcd-item">
                    <span className="bcd-label">Montant</span>
                    <span className="bcd-val">340€</span>
                  </div>
                </div>
                
                <div className="bc-actions">
                  <button className="btn btn-outline">✉️ Message</button>
                  <button className="btn btn-primary">Voir les détails</button>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="sc-header">
                <h2 className="sc-title">Nouvelle Demande</h2>
              </div>
              
              <div className="booking-card">
                <div className="bc-top">
                  <div className="bc-client">
                    <div className="bc-avatar" style={{background: 'var(--deep)', color: 'var(--gold)'}}>SA</div>
                    <div>
                      <div className="bc-name">Sarah Amari</div>
                      <div className="bc-type">Omra simple · Solo</div>
                    </div>
                  </div>
                  <div className="bc-status pending">En attente</div>
                </div>
                
                <div className="bc-details">
                  <div className="bcd-item">
                    <span className="bcd-label">Date Demandée</span>
                    <span className="bcd-val">Dim 27 Nov · Matin</span>
                  </div>
                  <div className="bcd-item">
                    <span className="bcd-label">Spécialité</span>
                    <span className="bcd-val">Langue Française</span>
                  </div>
                </div>
                
                <div className="bc-actions">
                  <button className="btn btn-outline">Refuser</button>
                  <button className="btn btn-primary">Accepter</button>
                </div>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="section-card">
              <div className="sc-header">
                <h2 className="sc-title">Notifications</h2>
              </div>
              
              <div className="notification-item">
                <div className="notif-icon">💳</div>
                <div className="notif-content">
                  <p><strong>Paiement reçu :</strong> 280€ ont été transférés sur votre compte pour la Omra de Youssef K.</p>
                  <span className="notif-time">Il y a 2 heures</span>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notif-icon">⭐</div>
                <div className="notif-content">
                  <p><strong>Nouvel avis 5 étoiles :</strong> "Rachid a été exceptionnel, très patient avec mes parents."</p>
                  <span className="notif-time">Hier à 14:30</span>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notif-icon">📅</div>
                <div className="notif-content">
                  <p><strong>Rappel calendrier :</strong> N'oubliez pas de mettre à jour vos disponibilités pour Décembre.</p>
                  <span className="notif-time">Lun 21 Nov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
