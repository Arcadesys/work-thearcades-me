import { relatedPosts } from '@/lib/blog';
import { BlogPostList } from '@/components/blog-post-list';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from '@/components/external-link';
import { RichText } from '@/components/rich-text';
import { SiteHeader } from '@/components/site-header';
import { SubscribeForm } from '@/components/subscribe-form';
import { STAR_PARTS, caseStudies, caseStudyBySlug, hasStar, newsletter, site } from '@/lib/content';

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata(props: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const study = caseStudyBySlug(slug);
  if (!study) return {};

  return {
    title: `${study.title} — ${site.name}`,
    description: study.body,
  };
}

export default async function CaseStudyPage(props: PageProps<'/work/[slug]'>) {
  const { slug } = await props.params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();

  const written = hasStar(study);
  const links = (study as typeof study & { links?: { label: string; href: string }[] }).links;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <SiteHeader />

      <main id="main" tabIndex={-1}>
        <article className="shell case-page" data-accent={study.accent}>
          <Link className="label back-link" href="/#work">
            <span aria-hidden="true">← </span>All work
          </Link>

          <p className="label case-pill">{study.lane}</p>
          <h1 className="case-page-title">{study.title}</h1>
          <p className="case-page-lede">{study.body}</p>

          <ul className="tag-list case-page-tags" aria-label={`${study.lane} disciplines`}>
            {study.tags.map((tag) => (
              <li className="label" key={tag}>
                {tag}
              </li>
            ))}
          </ul>

          {links?.length ? (
            <ul className="case-links" aria-label={`${study.title} links`}>
              {links.map((link) => (
                <li key={link.href}><ExternalLink href={link.href}>{link.label}<span aria-hidden="true"> ↗</span></ExternalLink></li>
              ))}
            </ul>
          ) : null}

          {study.image && (
            <figure className="case-figure case-page-figure">
              <div>
                <Image
                  src={study.image.src}
                  width={study.image.width}
                  height={study.image.height}
                  sizes="(max-width: 900px) calc(100vw - 64px), 820px"
                  alt={study.image.alt}
                />
              </div>
              <figcaption>{study.image.caption}</figcaption>
            </figure>
          )}

          {written && (
            <div className="star">
              {STAR_PARTS.map((part) => {
                const paragraphs = study.star?.[part.key];
                if (!paragraphs?.length) return null;

                return (
                  <section
                    className="star-part"
                    key={part.key}
                    aria-labelledby={`star-${part.key}`}
                  >
                    <h2 className="label star-label" id={`star-${part.key}`}>
                      {part.label}
                    </h2>
                    <div className="star-body">
                      {paragraphs.map((paragraph, index) => (
                        <p key={index}>
                          <RichText>{paragraph}</RichText>
                        </p>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {study.principle && (
            <aside className="principle" aria-labelledby="principle-label">
              <p className="label principle-label" id="principle-label">
                Principle
              </p>
              <p className="principle-text">{study.principle}</p>
            </aside>
          )}

          {relatedPosts(study).length > 0 && <section className="blog-related" aria-labelledby="related-build-logs"><h2 id="related-build-logs">Related build logs</h2><BlogPostList posts={relatedPosts(study)} /></section>}

          <div className="subscribe" id="subscribe">
            <p className="label kicker">
              <span className="dot" />
              {newsletter.kicker}
            </p>
            <h2>{newsletter.heading}</h2>
            <p>{newsletter.body}</p>
            <SubscribeForm />
          </div>

          <div className="case-page-footer">
            <p className="lede">
              Want the longer version, or the parts that don’t fit on a page? I’m happy to walk
              through it.
            </p>
            <div className="btn-row">
              <ExternalLink className="btn btn-outline" href={site.bookingUrl}>
                Grab time on my calendar
                <span aria-hidden="true"> →</span>
              </ExternalLink>
              <Link className="btn btn-ghost" href="/#work">
                See the other work
              </Link>
            </div>
          </div>
        </article>
      </main>

      <footer className="site-footer">
        <div className="footer-row label">
          <p>© 2026 {site.name}</p>
          <nav aria-label="Elsewhere">
            <ExternalLink href={site.creativeUrl}>The Arcades’ Lab</ExternalLink>
            <ExternalLink href={site.publishingUrl}>Free Play Publishing</ExternalLink>
          </nav>
        </div>
      </footer>
    </>
  );
}
