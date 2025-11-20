import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, Briefcase, Sparkles } from 'lucide-react';
import { Footer } from '@/components/shared/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Global Educator Nexus</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/jobs">
              <Button variant="ghost">Find Jobs</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold tracking-tight">
            Connect Teachers with
            <span className="text-primary"> Global Opportunities</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            AI-powered platform matching qualified educators with international schools.
            Find your next teaching adventure in Asia, Middle East, or beyond.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup?role=teacher">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" />
                I'm a Teacher
              </Button>
            </Link>
            <Link href="/signup?role=recruiter">
              <Button size="lg" variant="outline" className="gap-2">
                <Briefcase className="h-5 w-5" />
                I'm a Recruiter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Video Analysis</CardTitle>
              <CardDescription>
                Upload your teaching video and get instant feedback on presentation,
                communication style, and professional presence.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>
                Our AI automatically finds the best job matches based on your experience,
                qualifications, and location preferences.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Visa Validation</CardTitle>
              <CardDescription>
                Know instantly which countries you're eligible to work in.
                No more wasted applications or visa surprises.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">10+</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-sm opacity-90">Active Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1,000+</div>
              <div className="text-sm opacity-90">Teachers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">95%</div>
              <div className="text-sm opacity-90">Match Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of educators finding their dream teaching positions abroad.
          </p>
          <Link href="/signup">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
