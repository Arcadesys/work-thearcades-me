import { notFound } from 'next/navigation';
import Link from 'next/link';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PostTags, RelatedReading } from '@/components/blog-post-list';
import { SubscribeForm } from '@/components/subscribe-form';
import { publicPosts, postBySlug, displayDate, displayBuildDate, relatedWork, relatedReading, splitAtReadingPeak, articleBody, archiveLinks } from '@/lib/blog';
import { newsletter } from '@/lib/content';
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
  const source = (sources as Record<string, { url?: string; kind?: string }>)[post.slug];
  const work = relatedWork(post);
  const related = relatedReading(post);
  const [firstHalf, secondHalf] = splitAtReadingPeak(articleBody(post));
  const markdownProps = {
    remarkPlugins: [remarkGfm],
    skipHtml: true,
    urlTransform: (url: string) => defaultUrlTransform(archiveLinks[post.slug]?.[url] ?? url),
    components: { a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (href ? <a href={href}>{children}</a> : <span>{children}</span>) },
  };
  return <article><Link className="back-link" href="/blog">← All posts</Link>
    <h1>{post.title}</h1><time dateTime={post.publishDate}>{displayDate(post.publishDate)}</time>
    {post.buildDate && <p>Build date: <time dateTime={post.buildDate}>{displayBuildDate(post.buildDate)}</time></p>}
    <PostTags post={post} />
    {work.length > 0 && <aside className="blog-related" aria-label="Featured work">{work.map(study => <p key={study.slug}>Featured work: <Link href={`/work/${study.slug}`}>{study.title}</Link></p>)}</aside>}
    <div className="blog-prose"><Markdown {...markdownProps}>{firstHalf}</Markdown></div>
    <div className="subscribe" aria-label="Subscribe">
      <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
      <h3>{newsletter.heading}</h3>
      <p>{newsletter.body}</p>
      <SubscribeForm />
    </div>
    {secondHalf && <div className="blog-prose"><Markdown {...markdownProps}>{secondHalf}</Markdown></div>}
    {source?.url && <p className="blog-provenance">Originally published on <a href={source.url}>The Arcades</a> on {displayDate(post.publishDate)}.</p>}
    {source?.kind === 'archive' && <p className="blog-provenance">From my writing archive. Published here on {displayDate(post.publishDate)}.</p>}
    <RelatedReading items={related} />
    <Link className="back-link" href="/blog">← All posts</Link>
  </article>;
}
