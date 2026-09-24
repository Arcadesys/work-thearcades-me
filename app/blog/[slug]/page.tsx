import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PostTags, RelatedReading } from '@/components/blog-post-list';
import { SubscribeForm } from '@/components/subscribe-form';
import { publicPosts, postBySlug, displayDate, displayBuildDate, relatedWork, relatedReading, splitAtReadingPeak, articleBody, archiveLinks } from '@/lib/blog';
import { newsletter } from '@/lib/content';
import { blogPostMetadata, blogPostJsonLd, breadcrumbJsonLd } from '@/lib/site-metadata';
import { JsonLd } from '@/lib/json-ld';
import sources from '@/content/blog-sources.json';
export const dynamicParams = false;
export function generateStaticParams() { return publicPosts().map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  if (!post) return {};
  return blogPostMetadata(post);
}
export default async function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const source = (sources as Record<string, { url?: string; kind?: string }>)[post.slug];
  const work = relatedWork(post);
  const related = relatedReading(post);
  const body = articleBody(post);
  const isWizwor = post.slug === 'wizwor';
  const wizworBreak = isWizwor ? body.indexOf('\n## The experiment') : -1;
  const wizworIntro = wizworBreak >= 0 ? body.slice(0, wizworBreak) : body;
  const wizworStory = wizworBreak >= 0 ? body.slice(wizworBreak) : '';
  const [firstHalf, secondHalf] = splitAtReadingPeak(body);
  const markdownProps = {
    remarkPlugins: [remarkGfm],
    skipHtml: true,
    urlTransform: (url: string) => defaultUrlTransform(archiveLinks[post.slug]?.[url] ?? url),
    components: { a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (href ? <a href={href}>{children}</a> : <span>{children}</span>) },
  };
  const subscribeBlock = <div className="subscribe" aria-label="Subscribe">
    <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
    <h3>{newsletter.heading}</h3>
    <p>{newsletter.body}</p>
    <SubscribeForm />
    <p><a href="https://www.thearcades.me/subscribe">Choose from all email topics →</a></p>
  </div>;
  return <article>
    <JsonLd data={blogPostJsonLd(post)} />
    <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }])} />
    <Link className="back-link" href="/blog">← All posts</Link>
    <h1>{post.title}</h1><time dateTime={post.publishDate}>{displayDate(post.publishDate)}</time>
    {post.buildDate && <p>Build date: <time dateTime={post.buildDate}>{displayBuildDate(post.buildDate)}</time></p>}
    <PostTags post={post} />
    {post.hero && <img className="blog-hero" src={post.hero.src} alt={post.hero.alt} width={1200} height={630} />}
    {work.length > 0 && <aside className="blog-related" aria-label="Featured work">{work.map(study => <p key={study.slug}>Featured work: <Link href={`/work/${study.slug}`}>{study.title}</Link></p>)}</aside>}
    {isWizwor ? <>
      <div className="blog-prose"><Markdown {...markdownProps}>{wizworIntro}</Markdown></div>
      <section className="wizwor-demo" aria-label="Try WizWor">
        <a className="wizwor-try-link" href="https://wizwor.vercel.app/">Try WizWor <span aria-hidden="true">→</span></a>
        <p>Choose a console and tell the wizard what you want to play. The live demo uses a hosted model.</p>
        <figure>
          <video className="wizwor-video-desktop" controls preload="metadata" poster="/images/blog/wizwor-demo-poster.png" aria-label="Silent 37-second walkthrough of a real WizWor recommendation session">
            <source src="/media/wizwor-demo-captioned.mp4" type="video/mp4" />
            <track src="/media/wizwor-demo-captions.vtt" kind="captions" srcLang="en" label="English" />
            <a href="/media/wizwor-demo-captioned.mp4">Watch the WizWor demo video</a>
          </video>
          <video className="wizwor-video-mobile" controls preload="metadata" poster="/images/blog/wizwor-demo-mobile-poster.png" aria-label="Mobile-friendly silent 37-second walkthrough of a real WizWor recommendation session">
            <source src="/media/wizwor-demo-mobile-captioned.mp4" type="video/mp4" />
            <track src="/media/wizwor-demo-captions.vtt" kind="captions" srcLang="en" label="English" />
            <a href="/media/wizwor-demo-mobile-captioned.mp4">Watch the mobile WizWor demo video</a>
          </video>
          <figcaption>37-second silent walkthrough, assembled from successive screens of one real session. <a href="/media/wizwor-demo-transcript.txt">Read the session transcript</a>.</figcaption>
        </figure>
        <details>
          <summary>View the recommendation still</summary>
          <Image src="/images/blog/wizwor-recommendation.png" width={625} height={900} alt="WizWor showcase card for Erika to Satoru no Yume Bōken, labeled NES, 1988, and a 94% match in this session." />
        </details>
      </section>
      <div className="blog-prose"><Markdown {...markdownProps}>{wizworStory}</Markdown></div>
    </> : <div className="blog-prose"><Markdown {...markdownProps}>{firstHalf}</Markdown></div>}
    {!isWizwor && subscribeBlock}
    {!isWizwor && secondHalf && <div className="blog-prose"><Markdown {...markdownProps}>{secondHalf}</Markdown></div>}
    {isWizwor && subscribeBlock}
    {source?.url && <p className="blog-provenance">Originally published on <a href={source.url}>The Arcades</a> on {displayDate(post.publishDate)}.</p>}
    {source?.kind === 'archive' && <p className="blog-provenance">From my writing archive. Published here on {displayDate(post.publishDate)}.</p>}
    <RelatedReading items={related} />
    <Link className="back-link" href="/blog">← All posts</Link>
  </article>;
}
