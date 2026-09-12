import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { site } from '@/lib/content';
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#main">Skip to content</a>
    <div className="header-wrap"><header className="site-header">
      <Link className="brand" href="/"><BrandMark /><span className="visually-hidden">{site.name} — home</span></Link>
      <nav className="site-nav label" aria-label="Main"><Link href="/#work">Work</Link><Link href="/blog">Blog</Link><Link href="/#about">About</Link><Link href="/#contact">Contact</Link></nav>
    </header></div>
    <main id="main" tabIndex={-1} className="shell blog-page">{children}</main>
    <footer className="site-footer"><div className="footer-row"><p>© 2026 {site.name}</p><Link href="/blog">All posts</Link></div></footer></>;
}
