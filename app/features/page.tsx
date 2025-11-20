import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Video,
  Brain,
  Shield,
  Globe,
  MessageSquare,
  TrendingUp,
  FileText,
  Users,
  Search,
  Star,
  Lock,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Features',
  description: 'Discover all the powerful features to accelerate your teaching career',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Video,
      title: 'AI Video Profile Analysis',
      description: 'Upload a video introduction and get instant AI-powered feedback on your presentation, communication skills, and professional presence.',
      category: 'AI-Powered',
    },
    {
      icon: Brain,
      title: 'Smart Job Matching',
      description: 'Our intelligent algorithm matches you with the most suitable teaching positions based on your skills, experience, and preferences.',
      category: 'AI-Powered',
    },
    {
      icon: Shield,
      title: 'Visa Eligibility Checker',
      description: 'Instantly check your eligibility for work visas in different countries with our comprehensive rule-based system covering 10+ countries.',
      category: 'Career Tools',
    },
    {
      icon: Globe,
      title: 'Global Job Board',
      description: 'Access thousands of international teaching positions across Asia, Europe, Middle East, and beyond.',
      category: 'Job Search',
    },
    {
      icon: MessageSquare,
      title: 'Direct School Messaging',
      description: 'Connect directly with school recruiters and administrators through our secure messaging platform.',
      category: 'Communication',
    },
    {
      icon: TrendingUp,
      title: 'Application Tracking',
      description: 'Monitor all your applications in one place with real-time status updates and analytics.',
      category: 'Career Tools',
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create professional, ATS-optimized teaching resumes with our templates and AI-powered suggestions.',
      category: 'Career Tools',
    },
    {
      icon: Users,
      title: 'Teacher Community',
      description: 'Join a vibrant community of international teachers sharing experiences, tips, and opportunities.',
      category: 'Community',
    },
    {
      icon: Search,
      title: 'Advanced Search Filters',
      description: 'Find your perfect position with filters for location, salary, subject, grade level, and more.',
      category: 'Job Search',
    },
    {
      icon: Star,
      title: 'School Reviews & Ratings',
      description: 'Read authentic reviews from current and former teachers to make informed decisions.',
      category: 'Research',
    },
    {
      icon: Lock,
      title: 'Privacy & Security',
      description: 'Your data is protected with enterprise-grade security and privacy controls.',
      category: 'Security',
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Get real-time alerts for new job matches, application updates, and messages.',
      category: 'Communication',
    },
  ];

  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold">Powerful Features</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to find and secure your dream teaching position abroad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {feature.category}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-primary text-primary-foreground rounded-lg p-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to get started?</h2>
              <p className="text-xl opacity-90">
                Join thousands of teachers who have found their dream positions through our platform.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Feature Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryFeatures = features.filter(f => f.category === category);
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>
                        {categoryFeatures.length} {categoryFeatures.length === 1 ? 'feature' : 'features'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {categoryFeatures.map((feature, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span>{feature.title}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center">Why Choose Global Educator Nexus?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-3">
                <div className="text-4xl font-bold text-primary">10,000+</div>
                <div className="font-semibold">Active Job Listings</div>
                <p className="text-sm text-muted-foreground">
                  New positions added daily from verified schools worldwide
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl font-bold text-primary">50+</div>
                <div className="font-semibold">Countries</div>
                <p className="text-sm text-muted-foreground">
                  Teaching opportunities in all major regions
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl font-bold text-primary">95%</div>
                <div className="font-semibold">Success Rate</div>
                <p className="text-sm text-muted-foreground">
                  Teachers find their ideal position within 3 months
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Have questions about our features?</h2>
            <p className="text-muted-foreground">
              Learn more about how our platform can help you achieve your teaching career goals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
