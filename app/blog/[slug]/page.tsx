import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
  formatDate,
} from '@/lib/blog/mdx';
import { MDXComponents } from '@/components/blog/MDXComponents';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BLOG_CATEGORIES } from '@/lib/types/blog';

// Import highlight.js theme
import 'highlight.js/styles/github-dark.css';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const { metadata } = post;

  return {
    title: metadata.title,
    description: metadata.description,
    authors: [{ name: metadata.author }],
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
      publishedTime: metadata.date,
      authors: [metadata.author],
      tags: metadata.tags,
      images: metadata.image ? [metadata.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: metadata.image ? [metadata.image] : [],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { metadata, content, readingTime } = post;
  const category = BLOG_CATEGORIES[metadata.category as keyof typeof BLOG_CATEGORIES];
  const relatedPosts = getRelatedPosts(params.slug, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {' / '}
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          {category && (
            <>
              {' / '}
              <Link
                href={`/blog/category/${category.slug}`}
                className="hover:text-foreground"
              >
                {category.name}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-foreground">{metadata.title}</span>
        </nav>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            {/* Category Badge */}
            {category && (
              <Link href={`/blog/category/${category.slug}`}>
                <Badge variant="secondary" className="mb-4">
                  {category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {metadata.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-6">
              {metadata.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {metadata.author}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <time dateTime={metadata.date}>{formatDate(metadata.date)}</time>
              <Separator orientation="vertical" className="h-4" />
              <span>{readingTime}</span>
            </div>

            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {metadata.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {metadata.image && (
              <div className="relative w-full aspect-[16/9] mt-8 rounded-lg overflow-hidden">
                <Image
                  src={metadata.image}
                  alt={metadata.imageAlt || metadata.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-12">
            <MDXRemote
              source={content}
              components={MDXComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeHighlight, rehypeSlug],
                },
              }}
            />
          </div>

          {/* Article Footer - CTA */}
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">
                Ready to Find Your Teaching Job?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Browse thousands of international teaching positions in Asia and
                the Middle East.
              </p>
              <Link href="/jobs">
                <Button size="lg">Browse Jobs →</Button>
              </Link>
            </CardContent>
          </Card>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
