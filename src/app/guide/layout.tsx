'use client';

import { usePathname } from 'next/navigation';
import { GuideSessionGuard } from '@/components/GuideSessionGuard';

const PUBLIC_PATHS = [
  '/guide/inscription',
  '/guide/connexion',
  '/guide/mot-de-passe-oublie',
  '/guide/reinitialiser-mot-de-passe',
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isPublic) return <>{children}</>;

  return <GuideSessionGuard>{children}</GuideSessionGuard>;
}
