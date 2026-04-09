'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname   = usePathname();
  const router     = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion?redirect=' + encodeURIComponent(pathname));
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
