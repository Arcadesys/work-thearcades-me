import Link from 'next/link';
import { BlogPost, displayDate, postTags, tagHref } from '@/lib/blog';
export function PostTags({ post }: { post: BlogPost }) {
  return <ul className="blog-tags" aria-label="Post tags">{postTags(post).map(tag => <li key={tag}><Link href={tagHref(tag)}>{tag}</Link></li>)}</ul>;
}
export function BlogPostList({ posts }: { posts: BlogPost[] }) {
  return <ul className="blog-list">{posts.map(post => <li key={post.slug}>
    <article><time dateTime={post.publishDate}>{displayDate(post.publishDate)}</time>
      <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
      {post.excerpt && <p>{post.excerpt}</p>}<PostTags post={post} />
    </article></li>)}</ul>;
}
