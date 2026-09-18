import { publicPosts } from '@/lib/blog';
import { site } from '@/lib/content';

const BASE_URL = 'https://work.thearcades.me';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = publicPosts();
  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ''}
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)} — Build logs &amp; essays</title>
    <link>${BASE_URL}/blog</link>
    <description>Build logs and essays about AI, engineering, and making useful things.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
