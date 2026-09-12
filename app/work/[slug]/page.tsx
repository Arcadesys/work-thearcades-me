import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BrandMark } from '@/components/brand-mark';
import { ExternalLink } from '@/components/external-link';
import { RichText } from '@/components/rich-text';
import { STAR_PARTS, caseStudies, caseStudyBySlug, hasStar, site } from '@/lib/content';

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

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="header-wrap">
        <header className="site-header">
          <Link className="brand" href="/">
            <BrandMark />
            <span className="visually-hidden">{site.name} — home</span>
          </Link>
          <nav className="site-nav label" aria-label="Main">
            <Link href="/#work">Work</Link>
            <Link href="/#about">About</Link>
            <Link href="/#notes">Notes</Link>
            <Link href="/#contact">Contact</Link>
            <ExternalLink className="nav-cta" href={site.resumeUrl}>
              Résumé
              <span aria-hidden="true"> →</span>
            </ExternalLink>
          </nav>
        </header>
      </div>

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

          <div className="case-page-footer">
            <p className="lede">
              Want the longer version, or the parts that don’t fit on a page? I’m happy to walk
              through it.
            </p>
            <div className="btn-row">
              <ExternalLink className="btn btn-gradient" href={site.bookingUrl}>
                Grab time on my calendar
                <span aria-hidden="true"> →</span>
              </ExternalLink>
              <Link className="btn btn-outline" href="/#work">
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
