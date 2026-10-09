'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackNavigation, createEngagementSender } from '@/lib/analytics-client';
import { readingContentType } from '@/lib/analytics-policy';
import { observeReading } from '@/lib/reading-engagement';
export function PublicAnalytics() {
  const pathname = usePathname();
  useEffect(() => { trackNavigation(pathname); }, [pathname]);
  useEffect(() => {
    const body = document.querySelector<HTMLElement>('[data-reading-body]');
    if (!body || !readingContentType(pathname)) return;
    return observeReading({ window, document, bounds: () => body.getBoundingClientRect(), send: createEngagementSender(pathname) });
  }, [pathname]);
  return null;
}
