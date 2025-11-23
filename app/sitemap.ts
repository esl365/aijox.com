import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { getAllPosts } from '@/lib/blog/mdx';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Static pages
  const routes = [
    '',
    '/jobs',
    '/blog',
    '/login',
    '/select-role',
    '/profile/setup',
    '/recruiter/setup',
    '/dashboard',
    '/applications',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : route === '/jobs' ? 0.9 : route === '/blog' ? 0.8 : 0.7,
  }));

  // Country-specific pages (for future SEO)
  const countries = [
    'south-korea',
    'china',
    'uae',
    'vietnam',
    'thailand',
    'japan',
    'saudi-arabia',
    'taiwan',
    'singapore',
    'qatar',
  ];

  const countryRoutes = countries.map((country) => ({
    url: `${baseUrl}/jobs/${country}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic job postings (active jobs only)
  let jobRoutes: MetadataRoute.Sitemap = [];

  // Only fetch jobs if DATABASE_URL is available (skip during build)
  if (process.env.DATABASE_URL) {
    try {
      const jobs = await prisma.jobPosting.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, updatedAt: true },
        take: 1000, // Limit to prevent sitemap from being too large
        orderBy: { updatedAt: 'desc' },
      });

      jobRoutes = jobs.map((job) => ({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: job.updatedAt.toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
    } catch (error) {
      console.error('[Sitemap] Error fetching job postings:', error);
      // Continue without job routes if database is not available
    }
  }

  // Blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const posts = getAllPosts();

    blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.metadata.publishedAt).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: post.metadata.featured ? 0.85 : 0.75,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching blog posts:', error);
    // Continue without blog routes if directory doesn't exist yet
  }

  return [...routes, ...countryRoutes, ...jobRoutes, ...blogRoutes];
}
