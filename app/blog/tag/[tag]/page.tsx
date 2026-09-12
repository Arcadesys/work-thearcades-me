import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allTags, publicPosts, postTags } from '@/lib/blog';
import { BlogPostList } from '@/components/blog-post-list';
export function generateStaticParams() { return allTags().map(tag => ({ tag })); }
export async function generateMetadata({ params }: PageProps<'/blog/tag/[tag]'>) {
  const { tag } = await params;
  return { title: `${tag} — Blog — Austen Tucker-Crowder`, alternates: { canonical: `/blog/tag/${encodeURIComponent(tag)}` } };
}
export default async function TagPage({ params }: PageProps<'/blog/tag/[tag]'>) {
  const { tag } = await params;
  const posts = publicPosts().filter(post => postTags(post).includes(tag));
  if (!posts.length) notFound();
  return <><Link className="back-link" href="/blog">← All posts</Link><h1>Tagged: {tag}</h1><BlogPostList posts={posts} /></>;
}
