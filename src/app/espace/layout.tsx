'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function buildPelerinLoginUrl(pathname: string, search: string): string {
  return '/connexion?redirect=' + encodeURIComponent(`${pathname}${search}`);
}

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname   = usePathname();
  const router     = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(buildPelerinLoginUrl(pathname, window.location.search));
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return <>{children}</>;
}
