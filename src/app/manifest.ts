import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAFARUMA — Guide privé Omra',
    short_name: 'SAFARUMA',
    description: 'Guides privés certifiés pour la Omra à La Mecque et Médine.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F0',
    theme_color: '#1A1209',
    icons: [
      { src: '/icon-logo.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon.ico',   sizes: 'any',     type: 'image/x-icon' },
    ],
  };
}
