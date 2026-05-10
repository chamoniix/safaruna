'use client';

export default function CookiePrefsButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open-cookie-modal'));
    }
  };
  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'inherit', font: 'inherit', padding: 0,
        textAlign: 'left', textDecoration: 'none',
      }}
    >
      Gérer mes cookies
    </button>
  );
}
