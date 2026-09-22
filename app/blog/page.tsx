import { BlogPostList } from '@/components/blog-post-list';
import { SubscribeForm } from '@/components/subscribe-form';
import { publicPosts, allTags, tagHref } from '@/lib/blog';
import { newsletter } from '@/lib/content';
import { pictureGuide } from '@/lib/guides';
import { blogIndexMetadata, breadcrumbJsonLd } from '@/lib/site-metadata';
import { JsonLd } from '@/lib/json-ld';
import Link from 'next/link';
export const metadata = blogIndexMetadata;
export default function BlogPage() {
  const posts = publicPosts();
  return <><JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Letters from Next Door', path: '/blog' }])} />
    <header className="blog-index-hero">
      <p className="label kicker"><span className="dot" />Dispatches from the workshop next door</p>
      <h1>Letters from <span>Next Door</span></h1>
      <p className="blog-intro">Building parallel spaces until we can come back together. Notes on AI, creative tools, accessibility, experiments, and the strange things that happen when you keep turning the ratchet.</p>
      <div className="blog-index-meta"><span>{posts.length} dispatches</span><span>Build weird things.</span></div>
      <nav className="blog-kind-nav" aria-label="Dispatch types"><a href="#dispatches">All</a><a href="#demos">Demos</a><a href="#letters">Letters</a></nav>
    </header>
    <aside className="blog-related" aria-labelledby="featured-guide-heading">
      <p className="label">Practical guide</p>
      <h2 id="featured-guide-heading"><Link href={pictureGuide.path}>{pictureGuide.title}</Link></h2>
      <p>{pictureGuide.description}</p>
    </aside>
    <details className="blog-tag-browser"><summary>Browse tags ({allTags().length})</summary><nav aria-label="Browse by tag"><ul className="blog-tags">{allTags().map(tag => <li key={tag}><Link href={tagHref(tag)}>{tag}</Link></li>)}</ul></nav></details>
    <section id="dispatches" aria-labelledby="dispatches-heading">
      <h2 id="dispatches-heading" className="blog-section-heading">Latest dispatches</h2>
      <BlogPostList posts={posts} />
    </section>
    {posts.some(post => post.kind === 'demo') && <section id="demos" className="blog-kind-section" aria-labelledby="demos-heading"><p className="label">Things that run</p><h2 id="demos-heading">Demos</h2><BlogPostList posts={posts.filter(post => post.kind === 'demo')} /></section>}
    <section id="letters" className="blog-kind-section" aria-labelledby="letters-heading"><p className="label">Things that think</p><h2 id="letters-heading">Letters</h2><BlogPostList posts={posts.filter(post => post.kind === 'letter')} /></section>
    <div className="subscribe" aria-label="Subscribe">
      <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
      <h3>{newsletter.heading}</h3>
      <p>{newsletter.body}</p>
      <SubscribeForm placement="blog_index" />
    </div></>;
}
