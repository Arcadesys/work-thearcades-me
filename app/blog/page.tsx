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
  return <><JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'AI Build Logs & Essays', path: '/blog' }])} />
    <header className="blog-index-hero">
      <p className="label kicker"><span className="dot" />The work blog</p>
      <h1>AI Build Logs <span>&amp; Essays</span></h1>
      <p className="blog-intro">Notes on AI engineering, creative tools, and accessibility: what I built, what worked, and what I’d change.</p>
      <div className="blog-index-meta"><span>{posts.length} posts</span></div>
      <nav className="blog-kind-nav" aria-label="Post types"><a href="#dispatches">All</a><a href="#demos">Demos</a><a href="#essays">Essays</a></nav>
    </header>
    <section className="blog-start" aria-labelledby="blog-start-heading">
      <p className="label">New here?</p>
      <h2 id="blog-start-heading">Start with one of these.</h2>
      <p>Pick a story about what I build, why I build it, or something you can try.</p>
      <ul>
        <li><Link href="/blog/bunch">Bunch: building for continuity</Link><span>A personal build log about accessibility and context.</span></li>
        <li><Link href="/blog/ai-accessibility-revolution">AI as an accessibility tool</Link><span>What these tools can give back when the world was not built for you.</span></li>
        <li><Link href="/blog/wizwor">WizWor: try a small AI demo</Link><span>An arcade wizard that recommends a game.</span></li>
      </ul>
    </section>
    <section className="subscribe" id="subscribe" aria-labelledby="blog-subscribe-heading">
      <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
      <h2 id="blog-subscribe-heading">{newsletter.heading}</h2>
      <p>{newsletter.body}</p>
      <SubscribeForm placement="blog_index" />
      <p><a href="https://www.thearcades.me/subscribe">Choose from all email topics →</a></p>
    </section>
    <aside className="blog-related" aria-labelledby="featured-guide-heading">
      <p className="label">Practical guide</p>
      <h2 id="featured-guide-heading"><Link href={pictureGuide.path}>{pictureGuide.title}</Link></h2>
      <p>{pictureGuide.description}</p>
    </aside>
    <details className="blog-tag-browser"><summary>Browse tags ({allTags().length})</summary><nav aria-label="Browse by tag"><ul className="blog-tags">{allTags().map(tag => <li key={tag}><Link href={tagHref(tag)}>{tag}</Link></li>)}</ul></nav></details>
    <section id="dispatches" aria-labelledby="dispatches-heading">
      <h2 id="dispatches-heading" className="blog-section-heading">Latest posts</h2>
      <BlogPostList posts={posts} />
    </section>
    {posts.some(post => post.kind === 'demo') && <section id="demos" className="blog-kind-section" aria-labelledby="demos-heading"><p className="label">Things that run</p><h2 id="demos-heading">Demos</h2><BlogPostList posts={posts.filter(post => post.kind === 'demo')} /></section>}
    <section id="essays" className="blog-kind-section" aria-labelledby="essays-heading"><p className="label">Writing about the work</p><h2 id="essays-heading">Essays</h2><BlogPostList posts={posts.filter(post => post.kind === 'letter')} /></section></>;
}
