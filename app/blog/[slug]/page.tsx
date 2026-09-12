import { notFound } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PostTags } from '@/components/blog-post-list';
import { publicPosts, postBySlug, displayDate, displayBuildDate, relatedWork } from '@/lib/blog';
import sources from '@/content/blog-sources.json';
export const dynamicParams = false;
export function generateStaticParams() { return publicPosts().map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>) {
  const post = postBySlug((await params).slug);
  if (!post) return {};
  return { title: `${post.seo?.title ?? post.title} — Austen Tucker-Crowder`, description: post.seo?.description ?? post.excerpt, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: 'article', publishedTime: post.publishDate, images: post.hero ? [{ url: post.hero.src, alt: post.hero.alt }] : [] } };
}
export default async function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const source = (sources as Record<string, { url: string }>)[post.slug];
  const work = relatedWork(post);
  return <article><Link className="back-link" href="/blog">← All posts</Link>
    <h1>{post.title}</h1><time dateTime={post.publishDate}>{displayDate(post.publishDate)}</time>
    {post.buildDate && <p>Build date: <time dateTime={post.buildDate}>{displayBuildDate(post.buildDate)}</time></p>}
    <PostTags post={post} />
    {work.length > 0 && <aside className="blog-related" aria-label="Featured work">{work.map(study => <p key={study.slug}>Featured work: <Link href={`/work/${study.slug}`}>{study.title}</Link></p>)}</aside>}
    <div className="blog-prose"><Markdown remarkPlugins={[remarkGfm]} skipHtml>{post.body}</Markdown></div>
    {source && <p className="blog-provenance">Originally published on <a href={source.url}>The Arcades</a> on {displayDate(post.publishDate)}.</p>}
    <Link className="back-link" href="/blog">← All posts</Link>
  </article>;
}
