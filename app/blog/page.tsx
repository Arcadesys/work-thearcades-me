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
  return <><JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])} /><h1>Build logs & essays</h1><p className="blog-intro">What I’m building, what I’m learning, and what I’d do differently.</p>
    <aside className="blog-related" aria-labelledby="featured-guide-heading">
      <p className="label">Practical guide</p>
      <h2 id="featured-guide-heading"><Link href={pictureGuide.path}>{pictureGuide.title}</Link></h2>
      <p>{pictureGuide.description}</p>
    </aside>
    <details className="blog-tag-browser"><summary>Browse tags ({allTags().length})</summary><nav aria-label="Browse by tag"><ul className="blog-tags">{allTags().map(tag => <li key={tag}><Link href={tagHref(tag)}>{tag}</Link></li>)}</ul></nav></details>
    <BlogPostList posts={publicPosts()} />
    <div className="subscribe" aria-label="Subscribe">
      <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
      <h3>{newsletter.heading}</h3>
      <p>{newsletter.body}</p>
      <SubscribeForm placement="blog_index" />
    </div></>;
}
