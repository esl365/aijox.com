import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { UpdateNotification } from '@/components/pwa/update-notification';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Global Educator Nexus - International Teaching Jobs with AI Matching',
    template: '%s | Global Educator Nexus'
  },
  description: 'Find verified international teaching positions in Asia and Middle East. AI-powered matching, video resumes, visa sponsorship verification. Salaries $2,000-$8,000/month for native English teachers.',
  keywords: [
    'international teaching jobs',
    'ESL jobs Asia',
    'teaching jobs China',
    'teaching jobs Korea',
    'teaching jobs UAE',
    'international school jobs',
    'TEFL jobs',
    'native English teacher jobs',
    'teaching jobs Middle East',
    'ESL teacher recruitment',
    'teacher visa sponsorship',
    'video resume teaching'
  ],
  authors: [{ name: 'Global Educator Nexus' }],
  creator: 'Global Educator Nexus',
  publisher: 'Global Educator Nexus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // PWA Configuration
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduNexus',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Global Educator Nexus',
    title: 'Global Educator Nexus - International Teaching Jobs',
    description: 'AI-powered platform connecting qualified teachers with verified international schools. Video resumes, visa verification, competitive salaries.',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Global Educator Nexus - International Teaching Platform'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Educator Nexus - International Teaching Jobs',
    description: 'Find verified teaching positions in Asia & Middle East with AI-powered matching',
    creator: '@GlobalEdNexus',
    images: ['/twitter-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: '/'
  },
  category: 'education'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduNexus" />
      </head>
      <body className={inter.className}>
        <Providers>
          {/* PWA Components */}
          <OfflineBanner />
          <InstallPrompt />
          <UpdateNotification />

          {/* Main Content */}
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
