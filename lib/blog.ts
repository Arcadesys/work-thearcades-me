import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { caseStudies } from './content';

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.iso.datetime({ offset: true });
const schema = z.object({
  id: text, title: text, slug, group: slug, publishDate: date,
  buildDate: z.string().regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/).optional(),
  order: z.number().optional(), updatedDate: date.optional(), excerpt: text.optional(),
  kind: z.enum(['letter', 'demo']).default('letter'),
  demoNumber: z.number().int().positive().optional(),
  demoUrl: z.url().optional(),
  tags: z.array(text).default([]),
  hero: z.object({ src: text, alt: text }).strict().optional(),
  seo: z.object({ title: text.optional(), description: text.optional() }).strict().optional(),
}).strict();
export type BlogPost = z.infer<typeof schema> & { body: string };
export function loadPosts(directory = path.join(process.cwd(), 'content/blog')): BlogPost[] {
  const ids = new Set<string>();
  return readdirSync(directory).filter(file => file.endsWith('.md')).map(file => {
    const { data, content } = matter(readFileSync(path.join(directory, file), 'utf8'));
    const post = schema.parse(data);
    if (post.slug !== file.slice(0, -3) || ids.has(post.id) || !content.trim()) throw new Error(`Invalid or duplicate blog post: ${file}`);
    ids.add(post.id);
    return { ...post, body: content };
  });
}
export function publicPosts(now = new Date(), posts = loadPosts()) {
  return posts.filter(post => Date.parse(post.publishDate) <= now.getTime())
    .sort((a, b) => Date.parse(b.publishDate) - Date.parse(a.publishDate) || a.slug.localeCompare(b.slug));
}
export function postBySlug(slug: string) { return publicPosts().find(post => post.slug === slug); }
export function postTags(post: BlogPost) {
  return [...new Set([...post.tags, ...(projectTags[post.slug] ?? [])])];
}
// Explicit editorial associations; generic topic tags never imply a project relationship.
const projectTags: Record<string, string[]> = {
  bunch: ['bunch'],
  'bunch-part-two': ['bunch'],
  'bunch-part-three': ['bunch'],
  'four-stages-nobody-tells-you-about': ['ai-enablement'],
  'claude-design-and-the-novel-t': ['novel-t'],
};
export function relatedPosts(study: typeof caseStudies[number]) {
  return publicPosts().filter(post => study.blogTags?.some(tag => postTags(post).includes(tag)));
}
export function relatedWork(post: BlogPost) {
  return caseStudies.filter(study => study.blogTags?.some(tag => postTags(post).includes(tag)));
}

export type RelatedReadingItem = { slug: string; title: string; kind: 'series' | 'topic' };

/**
 * "More like this" for the end of a post: posts explicitly mapped to the
 * same named project via `projectTags` first (a real series, e.g. the Bunch
 * posts) — matched by the mapping itself, not by tag string, since a
 * generic tag can coincidentally equal a project name without implying a
 * relationship (see the note on `projectTags` above). Then posts sharing
 * any other topic tag, excluding the post itself and never repeating a
 * slug. Closes the stage-03 leak in the reader journey — most posts had no
 * related-content link at all before this.
 */
export function relatedReading(post: BlogPost, limit = 3): RelatedReadingItem[] {
  const seen = new Set([post.slug]);
  const items: RelatedReadingItem[] = [];
  const others = publicPosts().filter(candidate => candidate.slug !== post.slug);
  const postProjects = new Set(projectTags[post.slug] ?? []);

  if (postProjects.size > 0) {
    for (const candidate of others) {
      if (items.length >= limit || seen.has(candidate.slug)) continue;
      if (!(projectTags[candidate.slug] ?? []).some(project => postProjects.has(project))) continue;
      seen.add(candidate.slug);
      items.push({ slug: candidate.slug, title: candidate.title, kind: 'series' });
    }
  }

  const postTagSet = new Set(postTags(post));
  for (const candidate of others) {
    if (items.length >= limit || seen.has(candidate.slug)) continue;
    if (!postTags(candidate).some(tag => postTagSet.has(tag))) continue;
    seen.add(candidate.slug);
    items.push({ slug: candidate.slug, title: candidate.title, kind: 'topic' });
  }

  return items;
}

/**
 * Splits rendered article body at a paragraph boundary near the 60% mark, so
 * an inline subscribe card can sit at the point interest peaks rather than
 * only at the end. Falls back to `[body, '']` when there's too little text
 * to split meaningfully (the card is then appended, not inserted).
 */
export function splitAtReadingPeak(body: string): [string, string] {
  const paragraphs = body.split(/\n{2,}/);
  if (paragraphs.length < 4) return [body, ''];
  const targetIndex = Math.min(paragraphs.length - 2, Math.max(1, Math.round(paragraphs.length * 0.6)));
  return [paragraphs.slice(0, targetIndex).join('\n\n'), paragraphs.slice(targetIndex).join('\n\n')];
}
export function allTags() { return [...new Set(publicPosts().flatMap(postTags))].sort(); }
export function tagHref(tag: string) { return `/blog/tag/${encodeURIComponent(tag)}`; }
export function displayDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'America/Chicago' }).format(new Date(date));
}

export function displayBuildDate(value: string) {
  if (/^\d{4}$/.test(value)) return value;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new Error('Invalid partial build date');
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}-01T00:00:00Z`));
}

/** The source body keeps its title; the page already renders that title as h1. */
export function articleBody(post: BlogPost) {
  const heading = post.body.match(/^\s*# ([^\n]+)\r?\n/);
  return heading?.[1] === post.title ? post.body.slice(heading[0].length) : post.body;
}

// Resolve archive-only paths without modifying the stored manuscript.
export const archiveLinks: Record<string, Record<string, string>> = {
  'bunch-part-two': { 'the-fox-and-the-eval-publishing.md': '/blog/the-fox-and-the-eval' },
  'the-fox-and-the-eval': {
    '../assets/essays/moxie-arcade-kitchen.jpg': '/images/blog/moxie-arcade-kitchen.jpg',
    // The referenced essay remains a separate draft; keep its title as plain text.
    'photos-arent-sticky.md': '',
  },
};
