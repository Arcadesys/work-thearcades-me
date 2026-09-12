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
const projectTags: Record<string, string[]> = { bunch: ['bunch'] };
export function relatedPosts(study: typeof caseStudies[number]) {
  return publicPosts().filter(post => study.blogTags?.some(tag => postTags(post).includes(tag)));
}
export function relatedWork(post: BlogPost) {
  return caseStudies.filter(study => study.blogTags?.some(tag => postTags(post).includes(tag)));
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
