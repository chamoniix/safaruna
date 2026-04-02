'use client';

import { useState } from 'react';

export default function PreparationChecklist() {
  const [tasks, setTasks] = useState([
    { id: 1, category: 'Administratif', title: 'Passeport valide (+6 mois)', desc: 'Vérifiez la date d\'expiration de votre passeport.', done: true },
    { id: 2, category: 'Administratif', title: 'Visa de Omra / eVisa Touristique', desc: 'Imprimez votre eVisa KSA ou Visa de Omra.', done: true },
    { id: 3, category: 'Administratif', title: 'Vaccin Méningite (ACYW)', desc: 'Carnet de vaccination jaune international requis.', done: false },
    { id: 4, category: 'Spirituel', title: 'Repentir sincère (Tawbah)', desc: 'Demander pardon à Allah et aux personnes lésées.', done: true },
    { id: 5, category: 'Spirituel', title: 'Régler ses dettes', desc: 'S\'acquitter de ses dettes ou demander un délai.', done: true },
    { id: 6, category: 'Spirituel', title: 'Apprendre les rites (Fiqh)', desc: 'Terminer le module 2 de la SAFARUMA Academy.', done: false },
    { id: 7, category: 'Bagages', title: 'Acheter l\'Ihram (Hommes)', desc: '2 serviettes blanches non cousues.', done: true },
    { id: 8, category: 'Bagages', title: 'Ceinture / Sacoche sécurisée', desc: 'Pour garder téléphone et argent sous l\'Ihram.', done: false },
    { id: 9, category: 'Bagages', title: 'Sandales confortables', desc: 'Doivent laisser le talon et le dessus du pied découverts pour les hommes en Ihram.', done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const progress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  const categories = ['Administratif', 'Spirituel', 'Bagages'];

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1209] mb-2">Ma Checklist de Omra</h1>
          <p className="text-[#7A6D5A]">Préparez votre voyage spirituel sans oublier l'essentiel.</p>
        </div>
        
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 sm:p-5 flex items-center gap-6 shadow-sm w-full md:w-auto">
          <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#FAF3E0" strokeWidth="6" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#1D5C3A" strokeWidth="6" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - progress / 100)} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <span className="font-serif font-bold text-[#1A1209]">{progress}%</span>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#1D5C3A] mb-1">Préparation globale</div>
            <div className="font-serif text-2xl font-bold text-[#1A1209]">
              {tasks.filter(t => t.done).length} / {tasks.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h2 className="font-serif text-xl border-b border-[#E8DFC8] pb-3 text-[#1A1209]">{category}</h2>
            <div className="space-y-3">
              {tasks.filter(t => t.category === category).map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all group ${task.done ? 'bg-[#FAF7F0] border-[#E8DFC8]' : 'bg-white border-[#C9A84C]/50 hover:border-[#C9A84C] shadow-sm'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-[#1D5C3A] border-[#1D5C3A] text-white' : 'bg-transparent border-[#E8DFC8] group-hover:border-[#C9A84C]'}`}>
                      {task.done && <span className="text-sm">✓</span>}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm leading-tight mb-1 transition-colors ${task.done ? 'text-[#7A6D5A] line-through' : 'text-[#1A1209] group-hover:text-[#8B6914]'}`}>
                        {task.title}
                      </h4>
                      <p className={`text-xs ${task.done ? 'text-[#7A6D5A]/50' : 'text-[#7A6D5A]'}`}>
                        {task.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Add custom item button */}
            <button className="w-full py-3 border border-dashed border-[#E8DFC8] rounded-xl text-xs font-bold text-[#8B6914] hover:bg-[#FAF3E0] hover:border-[#C9A84C] transition-colors">
              + Ajouter une tâche
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-[#1A1209] to-[#3D2A10] p-6 md:p-10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-lg border border-[#C9A84C]/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(201,168,76,0.15)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
          <div className="text-[10px] bg-[#C9A84C] text-[#1A1209] px-3 py-1 rounded-full uppercase tracking-widest font-bold inline-block mb-4 shadow-sm">
            Conseil d'expert
          </div>
          <h3 className="font-serif text-2xl mb-2">L'intention de l'Umrah (Niyyah)</h3>
          <p className="text-white/70 text-sm leading-relaxed">
             Préparer ses valises est important, mais la préparation du cœur l'est encore plus. N'oubliez pas de purifier votre intention : "Ô Allah! J'entends accomplir la 'umrah, facilite-la-moi et accepte-la de ma part."
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button className="bg-[#C9A84C] text-[#1A1209] px-6 py-3 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] hover:bg-[#F0D897] transition-all">
            Réviser l'''intention dans la SAFARUMA Academy
          </button>
        </div>
      </div>
    </>
  );
}