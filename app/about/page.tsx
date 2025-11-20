import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, Globe, Users, Sparkles, Target, Heart, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Global Educator Nexus - Our mission to connect teachers with international schools',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold">
            About <span className="text-primary">Global Educator Nexus</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're on a mission to revolutionize international teacher recruitment by connecting
            qualified educators with world-class schools through AI-powered matching.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To empower educators worldwide by simplifying international job search and ensuring
                they find the right opportunities that match their qualifications, values, and career goals.
                We believe every teacher deserves to find a position where they can thrive and make an impact.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lightbulb className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To become the world's most trusted platform for international education recruitment,
                where technology enhances human connection and creates meaningful matches between
                teachers and schools across borders.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Global Educator Nexus was founded in 2025 with a simple yet powerful idea: international
              teacher recruitment shouldn't be complicated, time-consuming, or opaque.
            </p>
            <p>
              We noticed that talented educators were struggling to navigate complex visa requirements,
              verify school legitimacy, and showcase their teaching skills effectively. Meanwhile, international
              schools were overwhelmed with applications and lacked efficient tools to identify the best candidates.
            </p>
            <p>
              By combining cutting-edge AI technology with deep understanding of education sector needs,
              we created a platform that benefits both teachers and schools. Our AI screener analyzes video
              resumes to provide objective feedback, our autonomous headhunter matches candidates with
              opportunities, and our visa guard helps teachers understand their eligibility instantly.
            </p>
            <p>
              Today, we're proud to serve thousands of educators and hundreds of schools across 10+ countries,
              facilitating meaningful connections that change lives and enrich classrooms worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Teacher-First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We put educators at the center of everything we do, ensuring transparency,
                fairness, and respect throughout the recruitment journey.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We leverage AI and technology to solve real problems, while maintaining
                the human touch that makes education special.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Global Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We're building bridges across cultures and continents, enriching education
                worldwide through diverse, qualified teaching talent.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Powered by AI</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Screener</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  GPT-4o powered video analysis provides objective feedback on presentation,
                  communication, and professionalism.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Vector embeddings and semantic search ensure the best job matches
                  based on skills, experience, and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visa Guard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Rule-based validation checks your eligibility across 10+ countries
                  instantly, saving time and avoiding disappointment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
            <div className="text-sm text-muted-foreground">Teachers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Match Accuracy</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold">Join Our Community</h2>
          <p className="text-lg opacity-90">
            Whether you're a teacher seeking your next adventure or a school looking for exceptional
            talent, we're here to help you succeed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup?role=teacher">
              <Button size="lg" variant="secondary" className="gap-2">
                <Users className="h-5 w-5" />
                For Teachers
              </Button>
            </Link>
            <Link href="/signup?role=recruiter">
              <Button size="lg" variant="outline" className="gap-2 bg-white text-primary hover:bg-gray-100">
                <Globe className="h-5 w-5" />
                For Schools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
