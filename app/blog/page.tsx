import { BlogPostList } from '@/components/blog-post-list';
import { publicPosts, allTags, tagHref } from '@/lib/blog';
import Link from 'next/link';
export const metadata = { title: 'Blog — Austen Tucker-Crowder', description: 'Build logs and essays about AI, engineering, and making useful things.', alternates: { canonical: '/blog', types: { 'application/rss+xml': '/feed.xml' } } };
export default function BlogPage() {
  return <><h1>Build logs & essays</h1><p className="blog-intro">What I’m building, what I’m learning, and what I’d do differently.</p>
    <details className="blog-tag-browser"><summary>Browse tags ({allTags().length})</summary><nav aria-label="Browse by tag"><ul className="blog-tags">{allTags().map(tag => <li key={tag}><Link href={tagHref(tag)}>{tag}</Link></li>)}</ul></nav></details>
    <BlogPostList posts={publicPosts()} /></>;
}
