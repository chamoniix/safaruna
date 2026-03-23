'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function GuideSearchPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [budget, setBudget] = useState(800);
  const [resultsNum, setResultsNum] = useState(47);

  return (
    <div className="font-sans bg-[var(--cream)] text-[var(--deep)] min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        .search-hero { background: var(--deep); padding: 3rem 2rem 2rem; position: relative; overflow: hidden; }
        .search-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 100% at 50% 100%, rgba(201,168,76,.12) 0%, transparent 70%); pointer-events: none; }
        .sh-label { font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: rgba(240,216,151,.6); margin-bottom: .5rem; text-align: center; }
        .sh-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 300; color: white; text-align: center; margin-bottom: .4rem; }
        .sh-title em { font-style: italic; color: var(--gold); }
        .sh-sub { text-align: center; color: rgba(255,255,255,.45); font-size: .85rem; margin-bottom: 2rem; }
        
        .search-bar { max-width: 860px; margin: 0 auto 1.5rem; background: white; border-radius: 20px; padding: 1rem 1.25rem; display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: .75rem; align-items: end; box-shadow: 0 16px 48px rgba(0,0,0,.2); }
        .sb-field label { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); display: block; margin-bottom: .3rem; }
        .sb-field select, .sb-field input { width: 100%; border: none; background: var(--cream); border-radius: var(--radius-sm); padding: .6rem .85rem; font-family: 'Manrope', sans-serif; font-size: .85rem; color: var(--deep); outline: none; cursor: pointer; border: 1.5px solid var(--sand); transition: border-color .2s; }
        .sb-field select:focus, .sb-field input:focus { border-color: var(--gold); background: white; }
        .btn-search { background: var(--gold); color: var(--deep); border: none; border-radius: var(--radius-sm); padding: .7rem 1.6rem; font-family: 'Manrope', sans-serif; font-size: .85rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all .2s; }
        .btn-search:hover { background: var(--gold-dark); color: white; transform: translateY(-1px); }
        
        .quick-filters { max-width: 860px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: .5rem; padding-bottom: 2rem; }
        .qf-chip { padding: .3rem .85rem; border-radius: 50px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.08); color: rgba(255,255,255,.7); font-size: .75rem; font-weight: 500; cursor: pointer; transition: all .2s; }
        .qf-chip:hover, .qf-chip.active { background: var(--gold); color: var(--deep); border-color: var(--gold); font-weight: 700; }
        
        .main-layout { max-width: 1240px; margin: 0 auto; padding: 2rem 2rem 6rem; display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start; }
        .sidebar { position: sticky; top: 80px; }
        .filter-card { background: white; border: 1px solid var(--sand); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1rem; }
        .filter-card h3 { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 1rem; padding-bottom: .6rem; border-bottom: 1px solid var(--sand); }
        .filter-reset { float: right; font-size: .72rem; color: var(--gold-dark); cursor: pointer; font-weight: 600; text-transform: none; letter-spacing: 0; }
        
        .range-wrap { padding: .25rem 0; }
        .range-labels { display: flex; justify-content: space-between; font-size: .75rem; color: var(--muted); margin-bottom: .4rem; }
        .range-val { font-size: .85rem; font-weight: 700; color: var(--deep); }
        input[type=range] { width: 100%; accent-color: var(--gold); height: 4px; cursor: pointer; }
        
        .filter-opt { display: flex; align-items: center; justify-content: space-between; padding: .35rem 0; cursor: pointer; }
        .filter-opt-left { display: flex; align-items: center; gap: .6rem; }
        .filter-opt input[type=checkbox] { width: 15px; height: 15px; accent-color: var(--gold); cursor: pointer; }
        .filter-opt-name { font-size: .83rem; color: var(--deep); }
        .filter-count { font-size: .7rem; color: var(--muted); background: var(--cream); padding: .1rem .45rem; border-radius: 50px; }
        
        .star-row { display: flex; gap: .4rem; flex-wrap: wrap; }
        .star-btn { padding: .3rem .7rem; border-radius: 50px; border: 1.5px solid var(--sand); background: transparent; font-size: .75rem; cursor: pointer; color: var(--muted); transition: all .2s; }
        .star-btn:hover, .star-btn.active { background: var(--gold-pale); border-color: var(--gold); color: var(--gold-dark); font-weight: 700; }
        
        .lang-pills { display: flex; flex-wrap: wrap; gap: .4rem; }
        .lang-pill-f { padding: .3rem .75rem; border-radius: 50px; border: 1.5px solid var(--sand); background: transparent; font-size: .75rem; cursor: pointer; color: var(--muted); transition: all .2s; }
        .lang-pill-f:hover, .lang-pill-f.active { background: var(--deep); border-color: var(--deep); color: var(--gold-light); font-weight: 600; }
        
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem; }
        .view-toggle { display: flex; border: 1.5px solid var(--sand); border-radius: var(--radius-sm); overflow: hidden; }
        .vt-btn { padding: .4rem .75rem; background: white; border: none; cursor: pointer; font-size: .85rem; color: var(--muted); }
        .vt-btn.active { background: var(--deep); color: var(--gold-light); }
        
        .guides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
        .guides-grid.list-view { grid-template-columns: 1fr; }
        
        .gcard { background: white; border: 1px solid var(--sand); border-radius: var(--radius); overflow: hidden; transition: transform .2s, box-shadow .2s; cursor: pointer; display: flex; flex-direction: column; }
        .gcard:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,18,9,.1); }
        .gcard.list-view { flex-direction: row; align-items: stretch; }
        
        .gcard-banner { height: 90px; position: relative; overflow: hidden; flex-shrink: 0; }
        .gcard-banner.list-view { width: 120px; height: auto; }
        .gcard-avatar { position: absolute; bottom: -20px; left: 1.25rem; width: 52px; height: 52px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600; color: var(--deep); }
        .gcard-avatar.list-view { position: static; margin: auto; bottom: auto; left: auto; border: none; }
        .online-dot { position: absolute; bottom: 2px; right: 2px; width: 11px; height: 11px; border-radius: 50%; background: #27AE60; border: 2px solid white; }
        
        .gcard-body { padding: 1.5rem 1.25rem 1.25rem; flex: 1; display: flex; flex-direction: column; }
        .gcard-body.list-view { padding: 1.25rem; }
        .gcard-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .4rem; }
        .gc-name { font-size: .95rem; font-weight: 700; color: var(--deep); line-height: 1.2; }
        .gc-location { font-size: .75rem; color: var(--muted); margin-bottom: .75rem; }
        .gc-langs { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .75rem; }
        .gc-lang { background: var(--cream); border: 1px solid var(--sand); padding: .15rem .55rem; border-radius: 50px; font-size: .68rem; font-weight: 600; color: var(--warm); }
        .gc-lang.main-lang { background: var(--gold-pale); border-color: rgba(201,168,76,.4); color: var(--gold-dark); }
        .gc-services { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .9rem; }
        .gc-service { font-size: .68rem; color: var(--muted); background: var(--cream); padding: .15rem .5rem; border-radius: 5px; }
        
        .gcard-footer { display: flex; align-items: center; justify-content: space-between; padding-top: .85rem; border-top: 1px solid var(--sand); margin-top: auto; }
        .gc-price { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 600; color: var(--deep); }
        .gc-price small { font-family: 'Manrope', sans-serif; font-size: .68rem; color: var(--muted); font-weight: 400; }
        
        .active-filters { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin-bottom: 1rem; }
        .af-tag { display: flex; align-items: center; gap: .35rem; background: var(--deep); color: var(--gold-light); padding: .25rem .75rem; border-radius: 50px; font-size: .72rem; font-weight: 600; }
        .af-tag button { background: none; border: none; color: rgba(240,216,151,.6); cursor: pointer; font-size: .9rem; line-height: 1; padding: 0; }
        
        @media(max-width:960px) { .main-layout { grid-template-columns: 1fr; } .sidebar { position: static; } .search-bar { grid-template-columns: 1fr 1fr; } .guides-grid { grid-template-columns: 1fr; } }
        @media(max-width:600px) { .search-bar { grid-template-columns: 1fr; } }
      `}} />

      {/* SEARCH HERO */}
      <div className="search-hero">
        <div className="sh-label">Trouver mon guide privé</div>
        <h1 className="sh-title">Ta Omra, dans <em>ta langue</em></h1>
        <p className="sh-sub">320 guides certifiés · Makkah, Madinah, Taïf, Badr et plus</p>

        <div className="search-bar">
          <div className="sb-field">
            <label>Langue du guide</label>
            <select>
              <option value="">Toutes les langues</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="ar">🇸🇦 Arabe</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <div className="sb-field">
            <label>Destination</label>
            <select>
              <option value="">Makkah + Madinah</option>
              <option value="makkah">Makkah uniquement</option>
            </select>
          </div>
          <div className="sb-field">
            <label>Date d'arrivée</label>
            <input type="date" />
          </div>
          <button className="btn-search">🔍 Rechercher</button>
        </div>

        <div className="quick-filters">
          <div className="qf-chip active">🇫🇷 Francophone</div>
          <div className="qf-chip">🚗 Avec voiture</div>
          <div className="qf-chip">👩 Femme guide</div>
          <div className="qf-chip">👨‍👩‍👧 Famille</div>
        </div>
      </div>

      <div className="main-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="filter-card">
            <h3>Budget <span className="filter-reset" onClick={() => setBudget(800)}>Réinitialiser</span></h3>
            <div className="range-wrap">
              <div className="range-labels"><span>Prix par personne</span><span className="range-val">{budget}€ max</span></div>
              <input type="range" min="100" max="1500" value={budget} step="50" onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
          </div>

          <div className="filter-card">
            <h3>Transport</h3>
            <div className="filter-opt">
              <div className="filter-opt-left"><input type="checkbox" defaultChecked /><span className="filter-opt-name">🚗 Voiture privée incluse</span></div>
              <span className="filter-count">187</span>
            </div>
            <div className="filter-opt">
              <div className="filter-opt-left"><input type="checkbox" /><span className="filter-opt-name">🚌 Van 12 places</span></div>
              <span className="filter-count">94</span>
            </div>
          </div>

          <div className="filter-card">
            <h3>Lieux visités</h3>
            <div className="filter-opt">
              <div className="filter-opt-left"><input type="checkbox" defaultChecked /><span className="filter-opt-name">🕋 Rituels Omra complets</span></div>
              <span className="filter-count">320</span>
            </div>
            <div className="filter-opt">
              <div className="filter-opt-left"><input type="checkbox" /><span className="filter-opt-name">⛰️ Jabal Al-Nour / Hira</span></div>
              <span className="filter-count">278</span>
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <div>
          <div className="active-filters">
            <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontWeight: 600 }}>Filtres actifs :</span>
            <div className="af-tag">🇫🇷 Français <button>×</button></div>
            <div className="af-tag">⭐ 4.5★+ <button>×</button></div>
          </div>

          <div className="results-header">
            <p className="text-sm text-[var(--muted)]"><strong>{resultsNum}</strong> guides trouvés pour vos critères</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="view-toggle">
                <button className={`vt-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
                <button className={`vt-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>☰</button>
              </div>
            </div>
          </div>

          <div className={`guides-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {/* CARD 1 */}
            <Link href="/guides/1" style={{textDecoration: 'none'}}>
              <div className={`gcard ${viewMode === 'list' ? 'list-view' : ''}`}>
                <div className={`gcard-banner ${viewMode === 'list' ? 'list-view' : ''}`} style={{ background: 'linear-gradient(135deg, #1A1209, #4A2C0A)' }}>
                  <div className={`gcard-avatar ${viewMode === 'list' ? 'list-view' : ''}`} style={{ background: 'url(/guide-avatar.png) center/cover' }}>
                    <div className="online-dot"></div>
                  </div>
                </div>
                <div className={`gcard-body ${viewMode === 'list' ? 'list-view' : ''}`}>
                  <div className="gcard-top">
                    <div className="gc-name">Rachid Al-Madani</div>
                    <div className="text-sm font-bold text-[var(--deep)]"><span className="text-[var(--gold)]">★</span> 4.97 <span className="text-[var(--muted)] font-normal">(214)</span></div>
                  </div>
                  <div className="gc-location">📍 Makkah · 14 ans d'expérience</div>
                  <div className="gc-langs">
                    <span className="gc-lang main-lang">🇫🇷 Français</span>
                    <span className="gc-lang">🇸🇦 Arabe</span>
                  </div>
                  <div className="gc-services">
                    <span className="gc-service">Omra complète</span>
                    <span className="gc-service">Jabal Uhud</span>
                    <span className="gc-service">Train inclus</span>
                  </div>
                  <div className="gcard-footer">
                    <div><div className="gc-price">280€ <small>/ pers · 3j</small></div></div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--green-bg)] text-[var(--green)] text-[0.65rem] font-bold">✓ Vérifié</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* CARD 2 */}
            <Link href="/guides/2" style={{textDecoration: 'none'}}>
              <div className={`gcard ${viewMode === 'list' ? 'list-view' : ''}`}>
                <div className={`gcard-banner ${viewMode === 'list' ? 'list-view' : ''}`} style={{ background: 'linear-gradient(135deg, #082818, #1D5C3A)' }}>
                  <div className={`gcard-avatar ${viewMode === 'list' ? 'list-view' : ''}`} style={{ background: 'linear-gradient(135deg,#9FE1CB,#1D9E75)' }}>فع</div>
                </div>
                <div className={`gcard-body ${viewMode === 'list' ? 'list-view' : ''}`}>
                  <div className="gcard-top">
                    <div className="gc-name">Fatima Al-Omari</div>
                    <div className="text-sm font-bold text-[var(--deep)]"><span className="text-[var(--gold)]">★</span> 4.95 <span className="text-[var(--muted)] font-normal">(178)</span></div>
                  </div>
                  <div className="gc-location">📍 Makkah · 8 ans · Guide femme</div>
                  <div className="gc-langs">
                    <span className="gc-lang main-lang">🇫🇷 Français</span>
                    <span className="gc-lang">🇲🇦 Darija</span>
                  </div>
                  <div className="gc-services">
                    <span className="gc-service">Guide femme</span>
                    <span className="gc-service">Familles</span>
                  </div>
                  <div className="gcard-footer">
                    <div><div className="gc-price">320€ <small>/ pers · 3j</small></div></div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--green-bg)] text-[var(--green)] text-[0.65rem] font-bold">✓ Vérifié</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
