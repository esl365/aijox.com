import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory } from '@/lib/blog/mdx';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BLOG_CATEGORIES, type CategorySlug } from '@/lib/types/blog';

type Props = {
  params: { category: string };
};

export async function generateStaticParams() {
  return Object.keys(BLOG_CATEGORIES).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = BLOG_CATEGORIES[params.category as CategorySlug];

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Teaching Abroad Blog`,
    description: category.description,
    openGraph: {
      title: `${category.name} - AI Job X Blog`,
      description: category.description,
      type: 'website',
    },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = BLOG_CATEGORIES[params.category as CategorySlug];

  if (!category) {
    notFound();
  }

  const posts = getPostsByCategory(params.category as CategorySlug);

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
          {' / '}
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No posts in this category yet. Check back soon!
              </p>
              <Link href="/blog">
                <Button>View All Posts</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this
              category
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        )}

        {/* Back to Blog CTA */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button variant="outline" size="lg">
              ← Back to All Posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
