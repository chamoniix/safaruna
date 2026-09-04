export default function GuideDashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page"
      style={{ minHeight: 'calc(100vh - 9rem)', display: 'grid', placeItems: 'center' }}
    >
      <div className="guide-route-loading__spinner" aria-hidden="true" />
    </div>
  );
}
