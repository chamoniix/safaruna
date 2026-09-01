export default function EspaceDashboardLoading() {
  return (
    <div role="status" aria-label="Chargement de la page" style={{ minHeight: '58vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: '.85rem', color: '#7A6D5A', fontFamily: 'var(--font-manrope, sans-serif)', fontSize: '.78rem', fontWeight: 700 }}>
        <span aria-hidden style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', animation: 'pelerin-page-spin .72s linear infinite' }} />
        Chargement…
      </div>
      <style>{'@keyframes pelerin-page-spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}
