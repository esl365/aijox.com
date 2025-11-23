const createMDX = require('@next/mdx');
const remarkGfm = require('remark-gfm');
const rehypeHighlight = require('rehype-highlight');
const rehypeSlug = require('rehype-slug');
const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    mdxRs: false,
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight, rehypeSlug],
  },
});

// PWA Configuration
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /^https:\/\/uploadthing\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'uploadthing-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /^https:\/\/utfs\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'uploadthing-storage',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
  ],
});

module.exports = pwaConfig(withMDX(nextConfig));
