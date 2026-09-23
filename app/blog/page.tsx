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
    </section>
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
    <section id="letters" className="blog-kind-section" aria-labelledby="letters-heading"><p className="label">Things that think</p><h2 id="letters-heading">Letters</h2><BlogPostList posts={posts.filter(post => post.kind === 'letter')} /></section></>;
}
