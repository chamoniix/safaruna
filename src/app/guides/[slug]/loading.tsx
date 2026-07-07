export default function LoadingGuideProfile() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 34,
        height: 34,
        border: '3px solid rgba(201,168,76,0.25)',
        borderTopColor: '#C9A84C',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
