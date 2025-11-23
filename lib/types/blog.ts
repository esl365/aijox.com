/**
 * Blog Post Type Definitions
 *
 * Types for MDX-based blog system
 */

export type BlogPostMetadata = {
  title: string;
  description: string;
  publishedAt: string; // ISO date string
  author: string;
  category: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  draft?: boolean;
};

export type BlogPost = {
  slug: string;
  metadata: BlogPostMetadata;
  content: string;
  readingTime: string;
};

export type BlogPostWithoutContent = Omit<BlogPost, 'content'>;

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
  count: number;
};

export const BLOG_CATEGORIES = {
  'visa-immigration': {
    slug: 'visa-immigration',
    name: 'Visa & Immigration',
    description: 'Guides on visas, work permits, and immigration for international teachers',
  },
  'salary-compensation': {
    slug: 'salary-compensation',
    name: 'Salary & Compensation',
    description: 'Salary comparisons, benefits, and compensation packages worldwide',
  },
  'certifications': {
    slug: 'certifications',
    name: 'Certifications',
    description: 'TEFL, TESOL, CELTA, and other teaching certifications explained',
  },
  'country-guides': {
    slug: 'country-guides',
    name: 'Country Guides',
    description: 'Living and teaching guides for countries around the world',
  },
  'career-advice': {
    slug: 'career-advice',
    name: 'Career Advice',
    description: 'Tips for advancing your international teaching career',
  },
  'job-search': {
    slug: 'job-search',
    name: 'Job Search',
    description: 'Finding and applying for international teaching positions',
  },
} as const;

export type CategorySlug = keyof typeof BLOG_CATEGORIES;

export function getCategoryBySlug(slug: string): BlogCategory | null {
  const category = BLOG_CATEGORIES[slug as CategorySlug];
  if (!category) return null;

  return {
    ...category,
    count: 0, // Will be populated dynamically
  };
}

export function getAllCategories(): BlogCategory[] {
  return Object.values(BLOG_CATEGORIES).map((category) => ({
    ...category,
    count: 0,
  }));
}
