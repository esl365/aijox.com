import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPostWithoutContent } from '@/lib/types/blog';
import { formatDate } from '@/lib/blog/mdx';
import { BLOG_CATEGORIES } from '@/lib/types/blog';

type BlogPostCardProps = {
  post: BlogPostWithoutContent;
  featured?: boolean;
};

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const category = BLOG_CATEGORIES[post.metadata.category as keyof typeof BLOG_CATEGORIES];

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="h-full hover:border-primary transition-all duration-200 hover:shadow-lg">
        {/* Featured Image */}
        {post.metadata.image && (
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
            <Image
              src={post.metadata.image}
              alt={post.metadata.imageAlt || post.metadata.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {post.metadata.featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}

        <CardHeader className={post.metadata.image ? 'pt-4' : ''}>
          {/* Category */}
          {category && (
            <Badge variant="secondary" className="w-fit mb-2">
              {category.name}
            </Badge>
          )}

          {/* Title */}
          <h3
            className={`font-bold group-hover:text-primary transition-colors line-clamp-2 ${
              featured ? 'text-xl' : 'text-lg'
            }`}
          >
            {post.metadata.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2">
            {post.metadata.description}
          </p>

          {/* Tags */}
          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.metadata.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{formatDate(post.metadata.publishedAt)}</span>
            <span>{post.readingTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
