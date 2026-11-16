import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { SubscribeForm } from '@/components/subscribe-form';
import { requireLabProject } from '@/data/lab-projects';
import { JsonLd } from '@/lib/json-ld';
import { requireLabCaseStudy, loadLabCaseStudies } from '@/lib/lab-case-studies';
import { breadcrumbJsonLd } from '@/lib/site-metadata';
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, SITE_URL } from '@/lib/toys/site';

import { LabProjectLinks } from '../LabProjectLinks';
import { LabProjectVisual } from '../LabProjectVisual';
import styles from '../lab.module.css';

type Props = { params: Promise<{ slug: string }> };

function getCaseStudy(slug: string) {
  try {
    return requireLabCaseStudy(slug);
  } catch {
    notFound();
  }
}

export function generateStaticParams() {
  return loadLabCaseStudies().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  const project = requireLabProject(study.slug);
  const path = `/lab/${study.slug}`;
  const image = project.screenshot
    ? { url: project.screenshot.src, width: project.screenshot.width, height: project.screenshot.height, alt: project.screenshot.alt }
    : DEFAULT_SOCIAL_IMAGE;
  return {
    title: `${study.title} | Case Studies | ${SITE_NAME}`,
    description: study.description,
    alternates: { canonical: path },
    openGraph: { type: 'article', title: study.title, description: study.description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title: study.title, description: study.description, images: [image.url] },
  };
}

export default async function LabCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  const project = requireLabProject(study.slug);
  const path = `/lab/${study.slug}`;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.title,
    description: study.description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    author: { '@id': `${SITE_URL}/#person` },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Case Studies', path: '/lab' }, { name: study.title, path }])} />
      <main className={styles.page}>
        <article>
          <nav aria-label="Case Studies">
            <Link className={styles.backLink} href="/lab">
              <span aria-hidden="true">←</span> All Lab projects
            </Link>
          </nav>

          <header className={styles.caseHeader}>
            <p className={styles.eyebrow}>Case study {String(study.number).padStart(2, '0')}</p>
            <p className={styles.status}>{project.status}</p>
            <h1>{study.title}</h1>
            <p className={styles.lede}>{study.lede}</p>
          </header>

          <LabProjectVisual project={project} hero priority />

          <div className={styles.story}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{study.body}</ReactMarkdown>
          </div>

          <div className={styles.story}>
            <LabProjectLinks project={project} description={study.exploreDescription} />
          </div>

          <SubscribeForm placement="lab_case_study" />
        </article>
      </main>
    </>
  );
}
