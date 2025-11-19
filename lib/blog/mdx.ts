/**
 * MDX Blog Utilities
 *
 * Functions for reading, parsing, and managing MDX blog posts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type {
  BlogPost,
  BlogPostMetadata,
  BlogPostWithoutContent,
  CategorySlug,
} from '@/lib/types/blog';
import { BLOG_CATEGORIES } from '@/lib/types/blog';

const POSTS_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

/**
 * Ensure blog directory exists
 */
function ensureBlogDirectory(): void {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
  }
}

/**
 * Get all blog post slugs
 */
export function getAllPostSlugs(): string[] {
  ensureBlogDirectory();

  try {
    const files = fs.readdirSync(POSTS_DIRECTORY);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  } catch (error) {
    console.error('Error reading blog posts directory:', error);
    return [];
  }
}

/**
 * Get blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDirectory();

  try {
    const fullPath = path.join(POSTS_DIRECTORY, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate metadata
    if (!isValidMetadata(data)) {
      console.error(`Invalid metadata for post: ${slug}`);
      return null;
    }

    const metadata = data as BlogPostMetadata;

    // Skip draft posts in production
    if (metadata.draft && process.env.NODE_ENV === 'production') {
      return null;
    }

    const stats = readingTime(content);

    return {
      slug,
      metadata,
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPostWithoutContent[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;

      // Omit content for list views
      const { content, ...postWithoutContent } = post;
      return postWithoutContent;
    })
    .filter((post): post is BlogPostWithoutContent => post !== null)
    .sort((a, b) => {
      // Sort by date descending
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });

  return posts;
}

/**
 * Get posts by category
 */
export function getPostsByCategory(
  category: CategorySlug
): BlogPostWithoutContent[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.metadata.category === category);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPostWithoutContent[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.metadata.tags.includes(tag));
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(limit = 3): BlogPostWithoutContent[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.metadata.featured).slice(0, limit);
}

/**
 * Get recent posts
 */
export function getRecentPosts(limit = 5): BlogPostWithoutContent[] {
  const allPosts = getAllPosts();
  return allPosts.slice(0, limit);
}

/**
 * Get related posts (by category and tags)
 */
export function getRelatedPosts(
  currentSlug: string,
  limit = 3
): BlogPostWithoutContent[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllPosts().filter((post) => post.slug !== currentSlug);

  // Score posts by relevance
  const scoredPosts = allPosts.map((post) => {
    let score = 0;

    // Same category gets +2 points
    if (post.metadata.category === currentPost.metadata.category) {
      score += 2;
    }

    // Each shared tag gets +1 point
    const sharedTags = post.metadata.tags.filter((tag) =>
      currentPost.metadata.tags.includes(tag)
    );
    score += sharedTags.length;

    return { post, score };
  });

  // Sort by score and take top N
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * Get all categories with counts
 */
export function getAllCategories() {
  const counts = getCategoryCounts();
  return Object.values(BLOG_CATEGORIES).map((category) => ({
    ...category,
    count: counts.get(category.slug as CategorySlug) || 0,
  }));
}

/**
 * Get all unique tags
 */
export function getAllTags(): Array<{ tag: string; count: number }> {
  const allPosts = getAllPosts();
  const tagCounts = new Map<string, number>();

  allPosts.forEach((post) => {
    post.metadata.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get category counts
 */
export function getCategoryCounts(): Map<CategorySlug, number> {
  const allPosts = getAllPosts();
  const counts = new Map<CategorySlug, number>();

  // Initialize all categories with 0
  Object.keys(BLOG_CATEGORIES).forEach((category) => {
    counts.set(category as CategorySlug, 0);
  });

  // Count posts per category
  allPosts.forEach((post) => {
    const category = post.metadata.category as CategorySlug;
    counts.set(category, (counts.get(category) || 0) + 1);
  });

  return counts;
}

/**
 * Search posts by title, description, or content
 */
export function searchPosts(query: string): BlogPostWithoutContent[] {
  const allPosts = getAllPosts();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter((post) => {
    const titleMatch = post.metadata.title.toLowerCase().includes(lowerQuery);
    const descMatch = post.metadata.description
      .toLowerCase()
      .includes(lowerQuery);
    const tagMatch = post.metadata.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || descMatch || tagMatch;
  });
}

/**
 * Validate blog post metadata
 */
function isValidMetadata(data: any): data is BlogPostMetadata {
  return (
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    typeof data.date === 'string' &&
    typeof data.author === 'string' &&
    typeof data.category === 'string' &&
    Array.isArray(data.tags) &&
    data.tags.every((tag: any) => typeof tag === 'string')
  );
}

/**
 * Generate blog post slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get estimated reading time
 */
export function getReadingTime(content: string): string {
  const stats = readingTime(content);
  return stats.text;
}
