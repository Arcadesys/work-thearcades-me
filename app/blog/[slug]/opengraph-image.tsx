import { publicPosts, postBySlug } from '@/lib/blog';
import { renderOgImage, ogImageSize, ogImageContentType } from '@/lib/og';

export const dynamicParams = false;
export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = 'work.thearcades.me blog';

export function generateStaticParams() {
  return publicPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = postBySlug(slug);
  return renderOgImage({ kicker: 'The blog', title: post?.title ?? 'work.thearcades.me' });
}
