'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  readTime: string;
  href: string;
}

interface JobCollection {
  id: string;
  title: string;
  count: number;
  href: string;
  icon?: React.ReactNode;
}

interface BlogSectionProps {
  blogPosts?: BlogPost[];
  jobCollections?: JobCollection[];
}

const defaultBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Prepare for Your International Teaching Interview',
    excerpt: 'Essential tips and strategies to ace your next interview with an international school.',
    category: 'Career Tips',
    readTime: '5 min read',
    href: '/blog/interview-tips',
  },
  {
    id: '2',
    title: 'Top 10 Countries for International Teachers in 2025',
    excerpt: 'Discover the best destinations for educators seeking global opportunities.',
    category: 'Destinations',
    readTime: '8 min read',
    href: '/blog/top-countries-2025',
  },
  {
    id: '3',
    title: 'Understanding Visa Requirements for Teachers',
    excerpt: 'A comprehensive guide to work visas for international educators.',
    category: 'Visas',
    readTime: '6 min read',
    href: '/blog/visa-guide',
  },
];

const defaultJobCollections: JobCollection[] = [
  { id: '1', title: 'IB Schools', count: 245, href: '/jobs?filter=ib' },
  { id: '2', title: 'Middle East', count: 189, href: '/jobs?region=middle-east' },
  { id: '3', title: 'Asia Pacific', count: 312, href: '/jobs?region=asia-pacific' },
  { id: '4', title: 'Entry Level', count: 156, href: '/jobs?experience=entry' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function BlogSection({
  blogPosts = defaultBlogPosts,
  jobCollections = defaultJobCollections,
}: BlogSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Blog Posts Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Latest from our Blog
              </h2>
              <Button asChild variant="ghost" className="group">
                <Link href="/blog">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {blogPosts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={itemVariants}
                  className="group"
                >
                  <Link href={post.href}>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                      {/* Thumbnail Placeholder */}
                      <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />

                      {/* Content */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5865F2]">
                              <Tag className="h-3 w-3" />
                              {post.category}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {post.readTime}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#5865F2] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 hidden md:block">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>

          {/* Job Collections Column */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Job Collections
            </h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {jobCollections.map((collection) => (
                <motion.div key={collection.id} variants={itemVariants}>
                  <Link
                    href={collection.href}
                    className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-[#5865F2] transition-colors">
                      {collection.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {collection.count} jobs
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#5865F2] transition-all group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#4ECDC4] text-white"
            >
              <h3 className="font-semibold text-lg mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-white/90 text-sm mb-4">
                Create a job alert and get notified when new positions match your criteria.
              </p>
              <Button
                asChild
                variant="secondary"
                className="w-full bg-white text-[#5865F2] hover:bg-gray-100"
              >
                <Link href="/alerts">Create Job Alert</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
