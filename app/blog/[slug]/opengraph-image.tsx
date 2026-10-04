import { notFound } from 'next/navigation';
import { publicPosts, postBySlug } from '@/lib/blog';
import { renderOgImage, ogImageSize, ogImageContentType } from '@/lib/og';
import { SOCIAL_CARD_ID, socialCardAlt } from '@/lib/site-metadata';

export function generateStaticParams() {
  return publicPosts().map((post) => ({ slug: post.slug }));
}

// One card per post. generateImageMetadata lets its alt text name the post.
export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const post = postBySlug(params.slug);
  return [{
    id: SOCIAL_CARD_ID,
    alt: socialCardAlt('Blog post', post?.title ?? 'work.thearcades.me'),
    size: ogImageSize,
    contentType: ogImageContentType,
  }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  return renderOgImage({ kicker: 'The blog', title: post.title });
}
