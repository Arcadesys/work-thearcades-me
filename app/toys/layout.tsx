import { SiteHeader } from '@/components/site-header';

import '../arcade-tokens.css';

/** Moved from www.thearcades.me (Nov 2026); see app/arcade-tokens.css. */
export default function MovedSectionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/toys" />
      <div id="main">{children}</div>
    </>
  );
}
