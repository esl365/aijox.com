import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Lock, User, Users, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dev Sitemap',
  description: 'Development sitemap showing all implemented pages',
};

export default async function DevSitemapPage() {
  const session = await auth();

  // Only allow admins or development environment
  if (process.env.NODE_ENV === 'production' && session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const pageCategories = [
    {
      category: 'Authentication',
      icon: Lock,
      color: 'bg-red-100 text-red-600',
      pages: [
        { path: '/login', name: 'Login', access: 'Public' },
        { path: '/signup', name: 'Sign Up', access: 'Public' },
        { path: '/verification', name: 'Email Verification', access: 'User' },
      ],
    },
    {
      category: 'Public Pages',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      pages: [
        { path: '/', name: 'Home Page', access: 'Public' },
        { path: '/about', name: 'About Us', access: 'Public' },
        { path: '/contact', name: 'Contact', access: 'Public' },
        { path: '/faq', name: 'FAQ', access: 'Public' },
        { path: '/help', name: 'Help Center', access: 'Public' },
        { path: '/how-it-works', name: 'How It Works', access: 'Public' },
        { path: '/pricing', name: 'Pricing Plans', access: 'Public' },
        { path: '/features', name: 'Features', access: 'Public' },
        { path: '/testimonials', name: 'Testimonials', access: 'Public' },
        { path: '/privacy', name: 'Privacy Policy', access: 'Public' },
        { path: '/terms', name: 'Terms of Service', access: 'Public' },
      ],
    },
    {
      category: 'Jobs & Applications',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      pages: [
        { path: '/jobs', name: 'Job Listings', access: 'Public' },
        { path: '/jobs/1', name: 'Job Detail (Dynamic)', access: 'Public' },
        { path: '/jobs/1/apply', name: 'Apply to Job (Dynamic)', access: 'User' },
        { path: '/applications', name: 'My Applications', access: 'Teacher' },
        { path: '/applications/1', name: 'Application Detail (Dynamic)', access: 'Teacher' },
      ],
    },
    {
      category: 'Schools',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      pages: [
        { path: '/schools', name: 'School Directory', access: 'Public' },
        { path: '/schools/1', name: 'School Profile (Dynamic)', access: 'Public' },
        { path: '/schools/1/reviews', name: 'School Reviews (Dynamic)', access: 'User' },
      ],
    },
    {
      category: 'Profile Pages',
      icon: User,
      color: 'bg-yellow-100 text-yellow-600',
      pages: [
        { path: '/profile', name: 'Teacher Profile', access: 'Teacher' },
        { path: '/profile/setup', name: 'Profile Setup', access: 'Teacher' },
        { path: '/profile/video', name: 'Video Profile', access: 'Teacher' },
        { path: '/profile/documents', name: 'Documents Upload', access: 'Teacher' },
        { path: '/profile/preferences', name: 'Job Preferences', access: 'Teacher' },
      ],
    },
    {
      category: 'Settings Pages',
      icon: User,
      color: 'bg-indigo-100 text-indigo-600',
      pages: [
        { path: '/settings', name: 'Settings Hub', access: 'User' },
        { path: '/settings/account', name: 'Account Settings', access: 'User' },
        { path: '/settings/notifications', name: 'Notification Settings', access: 'User' },
        { path: '/settings/privacy', name: 'Privacy & Security', access: 'User' },
        { path: '/settings/billing', name: 'Billing & Subscription', access: 'User' },
      ],
    },
    {
      category: 'Dashboard & Communication',
      icon: User,
      color: 'bg-teal-100 text-teal-600',
      pages: [
        { path: '/dashboard', name: 'User Dashboard', access: 'User' },
        { path: '/messages', name: 'Messages Inbox', access: 'User' },
        { path: '/messages/1', name: 'Message Thread (Dynamic)', access: 'User' },
        { path: '/notifications', name: 'Notifications', access: 'User' },
      ],
    },
    {
      category: 'Saved Searches',
      icon: User,
      color: 'bg-pink-100 text-pink-600',
      pages: [
        { path: '/saved-searches', name: 'Saved Searches', access: 'Teacher' },
        { path: '/saved-searches/1/results', name: 'Search Results (Dynamic)', access: 'Teacher' },
      ],
    },
    {
      category: 'Recruiter Dashboard',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      pages: [
        { path: '/recruiter/dashboard', name: 'Recruiter Dashboard', access: 'Recruiter' },
        { path: '/recruiter/profile', name: 'Recruiter Profile', access: 'Recruiter' },
        { path: '/recruiter/jobs', name: 'Manage Jobs', access: 'Recruiter' },
        { path: '/recruiter/jobs/create', name: 'Create Job Posting', access: 'Recruiter' },
        { path: '/recruiter/jobs/1/edit', name: 'Edit Job Posting (Dynamic)', access: 'Recruiter' },
        { path: '/recruiter/applications', name: 'View Applications', access: 'Recruiter' },
        { path: '/recruiter/analytics', name: 'Recruiter Analytics', access: 'Recruiter' },
      ],
    },
    {
      category: 'Admin Dashboard',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
      pages: [
        { path: '/admin/dashboard', name: 'Admin Dashboard', access: 'Admin' },
        { path: '/admin/jobs', name: 'Job Management', access: 'Admin' },
        { path: '/admin/schools', name: 'School Management', access: 'Admin' },
        { path: '/admin/reports', name: 'Reports Management', access: 'Admin' },
        { path: '/admin/reviews', name: 'Reviews Moderation', access: 'Admin' },
        { path: '/admin/users', name: 'User Management', access: 'Admin' },
        { path: '/admin/analytics', name: 'Admin Analytics', access: 'Admin' },
      ],
    },
    {
      category: 'Blog',
      icon: Users,
      color: 'bg-cyan-100 text-cyan-600',
      pages: [
        { path: '/blog', name: 'Blog Home', access: 'Public' },
        { path: '/blog/e2-visa-guide-south-korea', name: 'Blog Post (Dynamic)', access: 'Public' },
        { path: '/blog/category/visa-immigration', name: 'Blog Category (Dynamic)', access: 'Public' },
      ],
    },
    {
      category: 'Setup & Onboarding',
      icon: User,
      color: 'bg-lime-100 text-lime-600',
      pages: [
        { path: '/select-role', name: 'Role Selection', access: 'User' },
        { path: '/setup', name: 'Account Setup', access: 'User' },
      ],
    },
  ];

  const totalPages = pageCategories.reduce((sum, cat) => sum + cat.pages.length, 0);

  const getAccessBadgeVariant = (access: string) => {
    switch (access) {
      case 'Public':
        return 'secondary';
      case 'User':
        return 'outline';
      case 'Teacher':
        return 'default';
      case 'Recruiter':
        return 'default';
      case 'Admin':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Development Sitemap</h1>
          <p className="text-muted-foreground">
            All {totalPages} implemented pages across {pageCategories.length} categories
          </p>
          {process.env.NODE_ENV === 'development' && (
            <Badge variant="destructive" className="mt-2">
              Development Mode Only
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageCategories.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.category}</CardTitle>
                      <CardDescription>{section.pages.length} pages</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.pages.map((page, pageIdx) => (
                      <div key={pageIdx} className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
                        <Link
                          href={page.path}
                          className="flex items-center gap-2 flex-1 text-sm group"
                          target="_blank"
                        >
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                          <span className="group-hover:text-primary">{page.name}</span>
                        </Link>
                        <Badge variant={getAccessBadgeVariant(page.access)} className="text-xs">
                          {page.access}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Page implementation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalPages}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{pageCategories.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {pageCategories.reduce((sum, cat) =>
                    sum + cat.pages.filter(p => p.access === 'Public').length, 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Public Pages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {pageCategories.reduce((sum, cat) =>
                    sum + cat.pages.filter(p => p.access !== 'Public').length, 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Protected Pages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Levels</CardTitle>
            <CardDescription>Page access requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Public</Badge>
                <span className="text-sm text-muted-foreground">No authentication required</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">User</Badge>
                <span className="text-sm text-muted-foreground">Any authenticated user</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Teacher</Badge>
                <span className="text-sm text-muted-foreground">Teacher role required</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Recruiter</Badge>
                <span className="text-sm text-muted-foreground">Recruiter role required</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Admin</Badge>
                <span className="text-sm text-muted-foreground">Admin role required</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>This page is only accessible in development mode or by administrators.</p>
          <p className="mt-1">Pages marked with (Dynamic) contain route parameters like [id] or [slug].</p>
        </div>
      </div>
    </div>
  );
}
