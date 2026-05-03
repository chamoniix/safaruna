import type { Viewport } from 'next';

export const viewport: Viewport = { themeColor: '#FAF7F0' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
