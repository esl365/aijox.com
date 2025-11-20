import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, Video, Bot, Search, CheckCircle, Users, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how Global Educator Nexus uses AI to match teachers with international schools',
};

export default function HowItWorksPage() {
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

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold">
            How <span className="text-primary">Global Educator Nexus</span> Works
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We use cutting-edge AI technology to simplify international teacher recruitment,
            making it faster, smarter, and more transparent for everyone involved.
          </p>
        </div>
      </section>

      {/* For Teachers */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">For Teachers</h2>
            <p className="text-muted-foreground">Your journey to finding the perfect teaching position</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle className="text-lg">Create Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Sign up and complete your profile with qualifications, experience, and preferences.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle className="text-lg">Upload Video</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Record a 2-3 minute video resume introducing yourself and your teaching philosophy.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle className="text-lg">Get AI Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Our AI analyzes your video and provides objective feedback on your presentation.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <CardTitle className="text-lg">Get Matched</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Browse personalized job matches or receive automatic recommendations based on your profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Three AI Agents */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Powered by Three AI Agents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform uses specialized AI agents to automate and enhance every step of the recruitment process
            </p>
          </div>

          <div className="space-y-8">
            {/* Agent 1: AI Screener */}
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 flex items-center justify-center">
                  <Video className="h-16 w-16 text-white" />
                </div>
                <div className="md:col-span-2 p-6">
                  <h3 className="text-2xl font-bold mb-3">Agent 1: AI Screener</h3>
                  <p className="text-gray-700 mb-4">
                    Uses GPT-4o's multimodal capabilities to analyze your video resume and provide structured feedback.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Evaluates accent clarity, energy level, and professionalism</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Assesses video/audio technical quality</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Generates improvement suggestions and strengths</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Agent 2: Autonomous Headhunter */}
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 flex items-center justify-center">
                  <Search className="h-16 w-16 text-white" />
                </div>
                <div className="md:col-span-2 p-6">
                  <h3 className="text-2xl font-bold mb-3">Agent 2: Autonomous Headhunter</h3>
                  <p className="text-gray-700 mb-4">
                    Intelligently matches teachers with job opportunities using vector embeddings and semantic search.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Analyzes profiles using AI embeddings for semantic matching</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Automatically sends personalized emails to matched candidates</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Runs daily to ensure fresh matches for new opportunities</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Agent 3: Rule-based Visa Guard */}
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 flex items-center justify-center">
                  <Globe className="h-16 w-16 text-white" />
                </div>
                <div className="md:col-span-2 p-6">
                  <h3 className="text-2xl font-bold mb-3">Agent 3: Visa Guard</h3>
                  <p className="text-gray-700 mb-4">
                    Instantly validates visa eligibility across 10+ countries to save time and avoid disappointment.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Checks age, education, and experience requirements</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Provides detailed reasons for eligibility/ineligibility</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Cached results for instant responses</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* For Recruiters */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">For Recruiters & Schools</h2>
            <p className="text-muted-foreground">Streamline your hiring process with AI-powered tools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">1</span>
                  Post Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Create detailed job postings with specific requirements and preferences
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">2</span>
                  Get Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  AI automatically finds and ranks candidates that match your criteria
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">3</span>
                  Review & Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Watch video resumes, review AI analysis, and contact top candidates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">For Teachers</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Instant feedback on your video presentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Personalized job recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Quick visa eligibility checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Transparent application process</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">For Recruiters</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Access to verified, qualified candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>AI-powered candidate screening</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Video resumes for better assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                  <span>Reduced time-to-hire</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Join thousands of teachers and schools using AI-powered recruitment
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup?role=teacher">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" />
                Sign Up as Teacher
              </Button>
            </Link>
            <Link href="/signup?role=recruiter">
              <Button size="lg" variant="outline" className="gap-2">
                <Globe className="h-5 w-5" />
                Sign Up as Recruiter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
