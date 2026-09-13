import { site } from '@/lib/content';
import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader current="/blog" />
    <main id="main" tabIndex={-1} className="shell blog-page">{children}</main>
    <footer className="site-footer"><div className="footer-row"><p>© 2026 {site.name}</p><Link href="/blog">All posts</Link></div></footer></>;
}
