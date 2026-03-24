'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LieuxSaintsEncyclopedia() {
  const [activeCity, setActiveCity] = useState('Makkah');

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[#1A1209]">
           <img 
            src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Makkah at Night" 
            className={`w-full h-full object-cover opacity-30 transition-opacity duration-1000 ${activeCity === 'Makkah' ? 'opacity-30' : 'opacity-0'}`} 
          />
          <img 
            src="https://images.unsplash.com/photo-1627916602852-52ce648b2eb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Madinah" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeCity === 'Madinah' ? 'opacity-30' : 'opacity-0'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-[1200px] mx-auto relative z-10 text-center">
          <div className="inline-block bg-[#C9A84C] text-[#1A1209] text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            Encyclopédie Interactive
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">Explorez les Lieux Saints</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12">
            Découvrez l'histoire, la signification rituelle et la géographie des lieux bénis de l'Islam à travers notre guide complet.
          </p>

          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-full mx-auto w-max max-w-full">
            <button 
              onClick={() => setActiveCity('Makkah')}
              className={`px-8 sm:px-12 py-3 rounded-full font-bold text-sm transition-all ${activeCity === 'Makkah' ? 'bg-[#C9A84C] text-[#1A1209] shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Makkah Al-Mukarramah
            </button>
            <button 
              onClick={() => setActiveCity('Madinah')}
              className={`px-8 sm:px-12 py-3 rounded-full font-bold text-sm transition-all ${activeCity === 'Madinah' ? 'bg-[#C9A84C] text-[#1A1209] shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Al-Madinah Al-Munawwarah
            </button>
          </div>
        </div>
      </section>

      {/* CONTENT REGION */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="flex justify-between items-end mb-12">
            <div>
               <h2 className="text-3xl font-serif text-[#1A1209] mb-4">Sites historiques à {activeCity}</h2>
               <p className="text-[#7A6D5A]">Sélectionnez un lieu pour découvrir son histoire et ses vertus.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeCity === 'Makkah' ? (
              <>
                <PlaceCard 
                  title="Al-Masjid Al-Haram" 
                  tag="Essentiel"
                  description="Le premier sanctuaire édifié sur Terre pour l'adoration d'Allah."
                  image="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3"
                  features={['Tawaaf', 'Prière (100.000x)', 'Zamzam']}
                />
                <PlaceCard 
                  title="Jabal Al-Nour (Grotte de Hira)" 
                  tag="Histoire"
                  description="Montagne abritant la grotte où le Prophète ﷺ reçut la toute première révélation du Coran."
                  image="https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3"
                  features={['Révélation', 'Histoire', 'Ascension courte']}
                />
                <PlaceCard 
                  title="Jabal Thawr" 
                  tag="Histoire"
                  description="Grotte où le Prophète ﷺ et Abu Bakr (ra) se sont réfugiés pendant l'Hégire."
                  image="https://images.unsplash.com/photo-1542104432-885404987178?ixlib=rb-4.0.3"
                  features={['Hégire', 'Foi', 'Histoire']}
                />
                <PlaceCard 
                  title="Mina" 
                  tag="Hajj"
                  description="La vallée des tentes, étape cruciale des rites du Hajj et lieu de lapidation des stèles."
                  image="https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3"
                  features={['Rites du Hajj', 'Tentes', 'Jamarat']}
                />
                <PlaceCard 
                  title="Arafat" 
                  tag="Hajj"
                  description="Lieu du plus grand rassemblement annuel. Le Hajj n'est pas valide sans l'arrêt à Arafat."
                  image="https://images.unsplash.com/photo-1563299796-1cda1e129184?ixlib=rb-4.0.3"
                  features={['Du\'a', 'Jabal ar-Rahmah', 'Jour d\'Arafat']}
                />
                <PlaceCard 
                  title="Monts Safa & Marwa" 
                  tag="Omra"
                  description="Les deux collines entre lesquelles Hajar a couru à la recherche d'eau pour Ismail."
                  image="https://images.unsplash.com/photo-1565552643954-b4bfdd1460dd?ixlib=rb-4.0.3"
                  features={['Sa\'i', 'Histoire de Hajar', 'Eau de Zamzam']}
                />
              </>
            ) : (
              <>
                <PlaceCard 
                  title="Al-Masjid An-Nabawi" 
                  tag="Essentiel"
                  description="La mosquée du Prophète ﷺ. Une prière y vaut 1000 fois plus qu'ailleurs."
                  image="https://images.unsplash.com/photo-1627916602852-52ce648b2eb3?ixlib=rb-4.0.3"
                  features={['Rawdah', 'Tombeau', 'Prière (1000x)']}
                />
                <PlaceCard 
                  title="Masjid Quba" 
                  tag="Mosquée"
                  description="La toute première mosquée de l'Islam en arrivant à Madinah. Y prier équivaut à une Omra."
                  image="https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3"
                  features={['Première Mosquée', 'Mérite (Omra)', 'Oasis']}
                />
                <PlaceCard 
                  title="Jabal Uhud" 
                  tag="Histoire"
                  description={'"Une montagne qui nous aime et que nous aimons" - Lieu de la célèbre bataille d\\'Uhud.'}
                  image="https://images.unsplash.com/photo-1579005981146-24f4693ae908?ixlib=rb-4.0.3"
                  features={['Martyrs', 'Bataille d\'Uhud', 'Montagne bénie']}
                />
                <PlaceCard 
                  title="Al-Baqi'" 
                  tag="Cimetière"
                  description="Le cimetière abritant des milliers de compagnons du Prophète ﷺ et sa famille."
                  image="https://images.unsplash.com/photo-1542104432-885404987178?ixlib=rb-4.0.3"
                  features={['Compagnons', 'Ahl al-Bayt', 'Du\'a']}
                />
                <PlaceCard 
                  title="Masjid Al-Qiblatayn" 
                  tag="Mosquée"
                  description="La mosquée aux deux Qiblas, où l'ordre divin de changer la direction de la prière fut révélé."
                  image="https://images.unsplash.com/photo-1585036156171-384164a8c675?ixlib=rb-4.0.3"
                  features={['Changement Qibla', 'Histoire', 'Architecture']}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PlaceCard({ title, tag, description, image, features }: any) {
  return (
    <div className="bg-white rounded-3xl border border-[#E8DFC8] overflow-hidden group hover:border-[#C9A84C] hover:shadow-xl transition-all cursor-pointer flex flex-col h-full">
      <div className="relative h-60 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#1A1209] uppercase tracking-wider shadow-sm">
          {tag}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1209]/80 to-transparent flex items-end p-6">
          <h3 className="font-serif text-2xl text-white leading-tight">{title}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-[#7A6D5A] text-sm leading-relaxed mb-6 flex-1">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {features.map((f: string) => (
            <span key={f} className="text-[10px] bg-[#FAF3E0] text-[#8B6914] px-2.5 py-1 rounded-md font-bold border border-[#E8DFC8]">
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-[#E8DFC8] px-6 py-4 flex items-center justify-between text-[#1A1209] font-bold text-sm group-hover:bg-[#FAF3E0] transition-colors mt-auto">
        <span>Lire l'article complet</span>
        <span className="text-xl">→</span>
      </div>
    </div>
  )
}