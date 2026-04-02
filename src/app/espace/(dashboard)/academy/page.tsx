'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SafarunaAcademy() {
  const [activeCategory, setActiveCategory] = useState('Tous');

  const categories = ['Tous', 'Rituels (Fiqh)', 'Histoire (Sīrah)', 'Spiritualité (Tazkiyah)', 'Guides Pratiques'];

  return (
    <>
      {/* HEADER HERO */}
      <div className="bg-[#1A1209] rounded-3xl p-8 md:p-12 mb-10 overflow-hidden relative shadow-lg text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565552643954-b4bfdd1460dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1209] via-[#1A1209]/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-[#C9A84C] text-[#1A1209] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 shadow-sm">
            Nouveau Module
          </div>
          <h1 className="font-serif text-3xl md:text-5xl mb-4 leading-tight">Comprendre le Tafsir des versets du Hajj & de la Omra</h1>
          <p className="text-white/70 mb-8 leading-relaxed">
            Plongez dans les profondeurs du Coran avec Cheikh Rachid pour comprendre la signification spirituelle derrière chaque action que vous accomplirez à Makkah.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-white text-[#1A1209] px-6 py-3 rounded-full text-sm font-bold shadow-md hover:bg-[#F0D897] transition-all flex items-center gap-2">
              <span className="text">▶</span> Commencer le cours
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full text-sm font-bold hover:bg-white/20 transition-all">
              + Ajouter à ma liste
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
        {categories.map(c => (
          <button 
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === c ? 'bg-[#1A1209] text-white shadow-md' : 'bg-white border border-[#E8DFC8] text-[#7A6D5A] hover:border-[#C9A84C]'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* CONTINUE WATCHING */}
      {activeCategory === 'Tous' && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-[#1A1209] mb-4">Reprendre la lecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourseCard 
              title="Les rites de la Omra : étape par étape"
              image="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              progress={45} timeRemaining="12 min restants"
            />
            <CourseCard 
              title="L'histoire de Zamzam et Hajar"
              image="https://images.unsplash.com/photo-1542104432-885404987178?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              progress={80} timeRemaining="5 min restants"
            />
          </div>
        </section>
      )}

      {/* POPULAR COURSES */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-[#1A1209]">Rituels (Fiqh) de la Omra</h2>
          <button className="text-[10px] font-bold text-[#8B6914] uppercase tracking-wider hover:underline">Voir tout</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SmallCourseCard title="L'État de l'Ihram : Règles et interdits" duration="45 min" modules="4 modules" image="https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
          <SmallCourseCard title="Comment accomplir le Tawaaf correctement" duration="32 min" modules="3 modules" image="https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
          <SmallCourseCard title="Le Sa'i entre Safa et Marwa" duration="28 min" modules="2 modules" image="https://images.unsplash.com/photo-1627916602852-52ce648b2eb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
          <SmallCourseCard title="La fin de la Omra : Rasage ou coupe" duration="15 min" modules="1 module" image="https://images.unsplash.com/photo-1563299796-1cda1e129184?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
        </div>
      </section>

      {/* HISTORY COURSES */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-[#1A1209]">Histoire Islamique (Sīrah)</h2>
          <button className="text-[10px] font-bold text-[#8B6914] uppercase tracking-wider hover:underline">Voir tout</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SmallCourseCard title="La biographie du Prophète ﷺ à Makkah" duration="2h 15m" modules="8 modules" image="https://images.unsplash.com/photo-1565552643954-b4bfdd1460dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
          <SmallCourseCard title="La Bataille de Badr : Leçon de foi" duration="55 min" modules="3 modules" image="https://images.unsplash.com/photo-1579005981146-24f4693ae908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
          <SmallCourseCard title="Uhud : L'importance de l'obéissance" duration="48 min" modules="3 modules" image="https://images.unsplash.com/photo-1542104432-885404987178?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" />
        </div>
      </section>

    </>
  );
}

// Components

function CourseCard({ title, image, progress, timeRemaining }: any) {
  return (
    <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 hover:border-[#C9A84C] transition-all cursor-pointer group">
      <div className="w-full sm:w-40 aspect-video bg-[#1A1209] rounded-xl relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 group-hover:bg-black/10 transition-colors">
          <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
            <span className="text-white text-sm ml-0.5">▶</span>
          </div>
        </div>
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-20">
          <div className="h-full bg-[#C0392B]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-[#1A1209] mb-1 line-clamp-2 md:line-clamp-1 leading-tight">{title}</h3>
        <p className="text-xs text-[#7A6D5A] mb-3">{timeRemaining}</p>
      </div>
    </div>
  );
}

function SmallCourseCard({ title, duration, modules, image }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-video bg-[#1A1209] rounded-xl relative overflow-hidden mb-3 border border-[#E8DFC8]">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10"></div>
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute bottom-2 right-2 bg-[#1A1209]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded z-20">{duration}</div>
      </div>
      <div className="text-[10px] text-[#8B6914] font-bold uppercase tracking-wider mb-1">{modules}</div>
      <h3 className="font-bold text-[#1A1209] text-sm leading-tight group-hover:text-[#C9A84C] transition-colors">{title}</h3>
    </div>
  );
}