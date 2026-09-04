'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ChecklistCategory = 'Administratif' | 'Spirituel' | 'Bagages';

type ChecklistTask = {
  id: number | string;
  category: ChecklistCategory;
  title: string;
  desc: string;
  done: boolean;
  custom?: true;
};

const INITIAL_TASKS: ChecklistTask[] = [
  { id: 1, category: 'Administratif', title: 'Passeport valide (+6 mois)', desc: 'Vérifiez la date d\'expiration de votre passeport.', done: false },
  { id: 2, category: 'Administratif', title: 'Visa de Omra / eVisa Touristique', desc: 'Imprimez votre eVisa KSA ou Visa de Omra.', done: false },
  { id: 3, category: 'Administratif', title: 'Vaccin Méningite (ACYW)', desc: 'Carnet de vaccination jaune international requis.', done: false },
  { id: 4, category: 'Spirituel', title: 'Repentir sincère (Tawbah)', desc: 'Demander pardon à Allah et aux personnes lésées.', done: false },
  { id: 5, category: 'Spirituel', title: 'Régler ses dettes', desc: 'S\'acquitter de ses dettes ou demander un délai.', done: false },
  { id: 6, category: 'Spirituel', title: 'Apprendre les rites (Fiqh)', desc: 'Terminer le module 2 de la SAFARUMA Academy.', done: false },
  { id: 7, category: 'Bagages', title: 'Acheter l\'Ihram (Hommes)', desc: '2 serviettes blanches non cousues.', done: false },
  { id: 8, category: 'Bagages', title: 'Ceinture / Sacoche sécurisée', desc: 'Pour garder téléphone et argent sous l\'Ihram.', done: false },
  { id: 9, category: 'Bagages', title: 'Sandales confortables', desc: 'Doivent laisser le talon et le dessus du pied découverts (hommes en Ihram).', done: false },
];

const CATEGORY_CONFIG: Record<ChecklistCategory, { color: string; bg: string; border: string; icon: string }> = {
  'Administratif': { color: '#1A4A8A', bg: '#EAF1FB', border: 'rgba(26,74,138,0.2)', icon: '📋' },
  'Spirituel':     { color: '#1D5C3A', bg: '#E8F5EE', border: 'rgba(29,92,58,0.2)',  icon: '🤲' },
  'Bagages':       { color: '#8B6914', bg: '#FAF3E0', border: 'rgba(201,168,76,0.3)', icon: '🧳' },
};

export default function PreparationChecklist() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [showInput, setShowInput] = useState<Record<string, boolean>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [stateLoading, setStateLoading] = useState(true);
  const [stateError, setStateError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/espace/dashboard-state', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async res => {
        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.error || 'Chargement impossible.');

        const completedIds = Array.isArray(payload?.state?.completedChecklistItemIds)
          ? new Set<number>(payload.state.completedChecklistItemIds)
          : new Set<number>();
        const customItems: ChecklistTask[] = Array.isArray(payload?.state?.customChecklistItems)
          ? payload.state.customChecklistItems
            .filter((item: unknown): item is { id: string; category: ChecklistCategory; title: string; done: boolean } => {
              if (!item || typeof item !== 'object') return false;
              const candidate = item as Record<string, unknown>;
              return typeof candidate.id === 'string'
                && ['Administratif', 'Spirituel', 'Bagages'].includes(String(candidate.category))
                && typeof candidate.title === 'string'
                && typeof candidate.done === 'boolean';
            })
            .map((item: { id: string; category: ChecklistCategory; title: string; done: boolean }) => ({ ...item, desc: '', custom: true }))
          : [];

        setTasks([
          ...INITIAL_TASKS.map(task => ({ ...task, done: completedIds.has(Number(task.id)) })),
          ...customItems,
        ]);
        setStateError('');
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStateError(error instanceof Error ? error.message : 'Chargement impossible.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setStateLoading(false);
      });

    return () => controller.abort();
  }, []);

  const toggleTask = async (id: number | string) => {
    const pendingKey = String(id);
    if (stateLoading || pendingIds.has(pendingKey)) return;
    const previous = tasks.find(task => task.id === id)?.done ?? false;
    const done = !previous;

    setStateError('');
    setPendingIds(current => new Set(current).add(pendingKey));
    setTasks(current => current.map(task => task.id === id ? { ...task, done } : task));

    try {
      const body = typeof id === 'number'
        ? { action: 'SET_CHECKLIST_ITEM', itemId: id, done }
        : { action: 'SET_CUSTOM_CHECKLIST_ITEM', itemId: id, done };
      const res = await fetch('/api/espace/dashboard-state', {
        method: 'PATCH',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || 'Enregistrement impossible.');
    } catch (error) {
      setTasks(current => current.map(task => task.id === id ? { ...task, done: previous } : task));
      setStateError(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      setPendingIds(current => {
        const next = new Set(current);
        next.delete(pendingKey);
        return next;
      });
    }
  };

  const addTask = async (category: ChecklistCategory) => {
    const title = newTaskInputs[category]?.trim();
    if (!title || stateLoading || title.length > 120) return;
    const id = crypto.randomUUID();
    const item: ChecklistTask = { id, category, title, desc: '', done: false, custom: true };

    setStateError('');
    setPendingIds(current => new Set(current).add(id));
    setTasks(current => [...current, item]);

    try {
      const res = await fetch('/api/espace/dashboard-state', {
        method: 'PATCH',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_CUSTOM_CHECKLIST_ITEM',
          item: { id, category, title, done: false },
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || 'Enregistrement impossible.');
      setNewTaskInputs(current => ({ ...current, [category]: '' }));
      setShowInput(current => ({ ...current, [category]: false }));
    } catch (error) {
      setTasks(current => current.filter(task => task.id !== id));
      setStateError(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      setPendingIds(current => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const doneCount = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const categories: ChecklistCategory[] = ['Administratif', 'Spirituel', 'Bagages'];
  const circumference = 2 * Math.PI * 28;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .cl-task { transition: border-color 0.15s, background 0.15s; }
        .cl-task:hover { border-color: #C9A84C !important; }
        .cl-add-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .cl-add-btn:hover { background: #FAF3E0 !important; border-color: #C9A84C !important; color: #8B6914 !important; }
        @media (max-width: 768px) {
          .cl-header { flex-direction: column !important; align-items: flex-start !important; }
          .cl-progress-card { width: 100% !important; }
          .cl-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* Header */}
      <div className="cl-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.35rem' }}>
            Ma Checklist de la Omra
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>Cochez chaque étape au fur et à mesure de votre préparation.</p>
        </div>

        {/* Progress card */}
        <div className="cl-progress-card" style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(26,18,9,0.04)', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="28" fill="none" stroke="#F0EBD8" strokeWidth="6" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#1D5C3A" strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, fontSize: '0.95rem', color: '#1A1209' }}>
              {progress}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1D5C3A', marginBottom: '0.2rem' }}>Préparation globale</div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>
              {doneCount} <span style={{ fontSize: '1rem', color: '#7A6D5A', fontWeight: 400 }}>/ {total}</span>
            </div>
          </div>
        </div>
      </div>

      {stateError && (
        <div role="alert" style={{ marginBottom: '1rem', border: '1px solid #C0392B', borderRadius: 10, padding: '0.7rem 0.9rem', color: '#8B1E14', background: '#FFF4F2', fontSize: '0.8rem', fontWeight: 700 }}>
          {stateError}
        </div>
      )}

      {/* Grid */}
      <div className="cl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {categories.map(cat => {
          const conf = CATEGORY_CONFIG[cat];
          const catTasks = tasks.filter(t => t.category === cat);
          const catDone = catTasks.filter(t => t.done).length;

          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: `2px solid ${conf.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{conf.icon}</span>
                  <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#1A1209' }}>{cat}</h2>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, background: conf.bg, color: conf.color, border: `1px solid ${conf.border}`, padding: '0.15rem 0.55rem', borderRadius: 50 }}>
                  {catDone}/{catTasks.length}
                </span>
              </div>

              {/* Tasks */}
              {catTasks.map(task => (
                <div
                  key={task.id}
                  className="cl-task"
                  onClick={() => void toggleTask(task.id)}
                  aria-busy={pendingIds.has(String(task.id))}
                  style={{
                    background: task.done ? '#FAF7F0' : 'white',
                    border: `1px solid ${task.done ? '#EDE8DC' : '#E8DFC8'}`,
                    borderRadius: 12, padding: '0.875rem 1rem',
                    cursor: stateLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    opacity: pendingIds.has(String(task.id)) ? 0.65 : 1,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: '0.1rem',
                    background: task.done ? '#1D5C3A' : 'transparent',
                    border: `2px solid ${task.done ? '#1D5C3A' : '#E8DFC8'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {task.done && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: 700, color: task.done ? '#7A6D5A' : '#1A1209',
                      textDecoration: task.done ? 'line-through' : 'none', marginBottom: task.desc ? '0.2rem' : 0,
                      lineHeight: 1.35,
                    }}>
                      {task.title}
                    </div>
                    {task.desc && (
                      <div style={{ fontSize: '0.72rem', color: task.done ? 'rgba(122,109,90,0.5)' : '#7A6D5A', lineHeight: 1.5 }}>
                        {task.desc}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add task */}
              {showInput[cat] ? (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    autoFocus
                    value={newTaskInputs[cat] || ''}
                    maxLength={120}
                    disabled={stateLoading}
                    onChange={e => setNewTaskInputs(p => ({ ...p, [cat]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') void addTask(cat); if (e.key === 'Escape') setShowInput(p => ({ ...p, [cat]: false })); }}
                    placeholder="Nouvelle tâche..."
                    style={{ flex: 1, padding: '0.55rem 0.75rem', border: '1.5px solid #C9A84C', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'inherit', color: '#1A1209', outline: 'none', background: '#FDFBF7' }}
                  />
                  <button disabled={stateLoading} onClick={() => void addTask(cat)} style={{ background: '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 8, padding: '0.55rem 0.75rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
                  <button onClick={() => setShowInput(p => ({ ...p, [cat]: false }))} style={{ background: 'white', color: '#7A6D5A', border: '1px solid #E8DFC8', borderRadius: 8, padding: '0.55rem 0.75rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
                </div>
              ) : (
                <button
                  className="cl-add-btn"
                  onClick={() => setShowInput(p => ({ ...p, [cat]: true }))}
                  style={{ width: '100%', padding: '0.6rem', border: '1.5px dashed #E8DFC8', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, color: '#7A6D5A', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  + Ajouter une tâche
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #1A1209, #2D1F08)', borderRadius: 16, padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.4rem' }}>Conseil spirituel</div>
          <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', color: 'white', marginBottom: '0.4rem', fontWeight: 600 }}>L’intention de la Omra (Niyyah)</h3>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 480 }}>
            La préparation du cœur est plus importante que celle des valises. Purifiez votre intention avant le départ.
          </p>
        </div>
        <Link href="/espace/academy" style={{ background: '#C9A84C', color: '#1A1209', padding: '0.7rem 1.5rem', borderRadius: 50, fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          SAFARUMA Academy →
        </Link>
      </div>
    </>
  );
}
