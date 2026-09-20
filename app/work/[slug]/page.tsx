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
import { caseStudyMetadata, caseStudyJsonLd, breadcrumbJsonLd } from '@/lib/site-metadata';
import { JsonLd } from '@/lib/json-ld';

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata(props: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const study = caseStudyBySlug(slug);
  if (!study) return {};

  return caseStudyMetadata(study, site.name);
}

export default async function CaseStudyPage(props: PageProps<'/work/[slug]'>) {
  const { slug } = await props.params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();

  const written = hasStar(study);
  const links = study.links;

  return (
    <>
      <JsonLd data={caseStudyJsonLd(study)} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Work', path: '/#work' }, { name: study.title, path: `/work/${study.slug}` }])} />
      <a className="skip-link" href="#main">Skip to content</a>
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
            {study.tags.map((tag) => <li className="label" key={tag}>{tag}</li>)}
          </ul>

          {links?.length ? (
            <ul className="case-links" aria-label={`${study.title} links`}>
              {links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/') ? (
                    <Link className={`case-link case-link-${link.emphasis ?? 'quiet'}`} href={link.href}>{link.label}</Link>
                  ) : (
                    <ExternalLink className={`case-link case-link-${link.emphasis ?? 'quiet'}`} href={link.href}>
                      {link.label}<span className="visually-hidden"> (opens in a new tab)</span>
                    </ExternalLink>
                  )}
                </li>
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

          {study.evidence && (
            <section className="case-evidence" aria-labelledby="case-evidence-heading">
              <p className="label kicker"><span className="dot" />Evidence</p>
              <h2 id="case-evidence-heading">{study.evidence.heading}</h2>
              <dl className="case-evidence-grid">
                {study.evidence.items.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              {study.evidence.note && <p className="case-evidence-note">{study.evidence.note}</p>}
            </section>
          )}

          {study.buildNotes?.length ? (
            <section className="case-build-notes" aria-labelledby="case-build-notes-heading">
              <p className="label kicker"><span className="dot" />Engineering & product</p>
              <h2 id="case-build-notes-heading">What the artifact taught me</h2>
              <div className="case-build-notes-grid">
                {study.buildNotes.map((note) => (
                  <section key={note.heading}>
                    <h3>{note.heading}</h3>
                    {note.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </section>
                ))}
              </div>
            </section>
          ) : null}

          {written && (
            <div className="star" aria-label="Case study narrative">
              {STAR_PARTS.map((part) => {
                const paragraphs = study.star?.[part.key];
                if (!paragraphs?.length) return null;

                return (
                  <section className="star-part" key={part.key} aria-labelledby={`star-${part.key}`}>
                    <h2 className="label star-label" id={`star-${part.key}`}>{part.label}</h2>
                    <div className="star-body">
                      {paragraphs.map((paragraph, index) => (
                        <p key={index}><RichText>{paragraph}</RichText></p>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {study.principle && (
            <aside className="principle" aria-labelledby="principle-label">
              <p className="label principle-label" id="principle-label">Principle</p>
              <p className="principle-text">{study.principle}</p>
            </aside>
          )}

          <section className="case-page-footer" aria-labelledby="case-conversation-heading">
            <h2 id="case-conversation-heading">Have a problem in this neighborhood?</h2>
            <p className="lede">
              I’m happy to walk through the technical decisions, the parts that failed, or what I would build next.
            </p>
            <div className="btn-row">
              <a
                className="btn btn-gradient"
                href={`mailto:${site.email}`}
                data-funnel-event="contact_click"
                data-funnel-placement="case_study"
              >
                Talk about the work <span aria-hidden="true">→</span>
              </a>
              <Link className="btn btn-ghost" href="/#work">See the other work</Link>
            </div>
          </section>

          {relatedPosts(study).length > 0 && (
            <section className="blog-related" aria-labelledby="related-build-logs">
              <h2 id="related-build-logs">Related build logs</h2>
              <BlogPostList posts={relatedPosts(study)} />
            </section>
          )}

          <div className="subscribe" id="subscribe">
            <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
            <h2>{newsletter.heading}</h2>
            <p>{newsletter.body}</p>
            <SubscribeForm placement={`case_${study.slug}`} />
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
