'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackNavigation } from '@/lib/analytics-client';
export function PublicAnalytics() {
  const pathname = usePathname();
  useEffect(() => { trackNavigation(pathname); }, [pathname]);
  return null;
}
