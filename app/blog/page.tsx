import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getFeaturedPosts, getAllCategories } from '@/lib/blog/mdx';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogCategory } from '@/lib/types/blog';

export const metadata: Metadata = {
  title: 'Teaching Abroad Blog - Guides, Tips & Resources',
  description:
    'Expert guides on teaching abroad, visa requirements, salary comparisons, certifications, and international teaching careers.',
  openGraph: {
    title: 'Teaching Abroad Blog - AI Job X',
    description:
      'Expert guides on teaching abroad, visa requirements, salary comparisons, and international teaching careers.',
    type: 'website',
  },
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const featuredPosts = getFeaturedPosts(3);
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Teaching Abroad Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert guides, visa requirements, salary comparisons, and
            everything you need to know about international teaching careers.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category: BlogCategory) => (
              <Link
                key={category.slug}
                href={`/blog/category/${category.slug}`}
              >
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-sm">{category.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Posts</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              All Posts ({allPosts.length})
            </h2>
          </div>

          {allPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No blog posts published yet. Check back soon!
                </p>
                <Link href="/jobs">
                  <Button>Browse Teaching Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">
            Ready to Start Your Teaching Journey?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Browse thousands of international teaching positions in Asia and
            the Middle East. Find your dream job today.
          </p>
          <Link href="/jobs">
            <Button size="lg">Browse Teaching Jobs →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
