import Link from 'next/link';
import { BlogPost, RelatedReadingItem, displayDate, postTags, tagHref } from '@/lib/blog';
import styles from './blog-post-list.module.css';

export function PostTags({ post }: { post: BlogPost }) {
  return <ul className="blog-tags" aria-label="Post tags">{postTags(post).map(tag => <li key={tag}><Link href={tagHref(tag)}>{tag}</Link></li>)}</ul>;
}
export function RelatedReading({ items }: { items: RelatedReadingItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside className="blog-related-posts" aria-label="More like this">
      <p className="label">More like this</p>
      <ul>
        {items.map(item => (
          <li key={item.slug}>
            <Link href={`/blog/${item.slug}`}>
              <span className="related-kind">{item.kind === 'series' ? 'Same series' : 'Related'}</span>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
export function BlogPostList({ posts }: { posts: BlogPost[] }) {
  return <ul className="blog-list">{posts.map(post => {
    const href = `/blog/${post.slug}`;
    const imageSrc = post.hero?.src ?? `${href}/opengraph-image`;
    const kindLabel = post.kind === 'demo'
      ? `Demo ${String(post.demoNumber ?? '').padStart(3, '0')}`.trim()
      : 'Essay';
    return <li key={post.slug} data-kind={post.kind}>
      <article className={styles.post}>
        <Link className={styles.imageLink} href={href} aria-label={`Read ${post.title}`}>
          <img
            className={styles.image}
            src={imageSrc}
            alt={post.hero?.alt ?? ''}
            width={1200}
            height={630}
            loading="lazy"
          />
        </Link>
        <div className={styles.copy}>
          <div className={styles.meta}><span className={styles.kind}>{kindLabel}</span><time dateTime={post.publishDate}>{displayDate(post.publishDate)}</time></div>
          <h2><Link href={href}>{post.title}</Link></h2>
          {post.excerpt && <p>{post.excerpt}</p>}
          {post.kind === 'demo' && post.demoUrl && <a className={styles.demoCta} href={post.demoUrl} target="_blank" rel="noreferrer">Try the demo ↗</a>}
          <PostTags post={post} />
        </div>
      </article>
    </li>;
  })}</ul>;
}
