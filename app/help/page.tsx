import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft, BookOpen, MessageCircle, Video, Globe, FileText, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get help with Global Educator Nexus - Guides, tutorials, and support',
};

export default function HelpPage() {
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
            How can we <span className="text-primary">help</span> you?
          </h1>
          <p className="text-xl text-muted-foreground">
            Find guides, tutorials, and answers to common questions
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/faq">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Frequently asked questions</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get help from our team</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/how-it-works">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Learn about our platform</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Getting Started */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Getting Started</h2>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="account">
            <AccordionTrigger className="text-lg font-semibold">
              Creating Your Account
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>To get started with Global Educator Nexus:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Click "Sign Up" in the top navigation</li>
                <li>Choose your account type (Teacher or Recruiter)</li>
                <li>Fill in your basic information</li>
                <li>Verify your email address</li>
                <li>Complete your profile setup</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="profile">
            <AccordionTrigger className="text-lg font-semibold">
              Setting Up Your Teacher Profile
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>A complete profile helps you get matched with better opportunities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload your video resume (recommended 2-3 minutes)</li>
                <li>Add your qualifications and certifications</li>
                <li>List your teaching experience</li>
                <li>Set your location and salary preferences</li>
                <li>Upload supporting documents (resume, certificates)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="video">
            <AccordionTrigger className="text-lg font-semibold">
              Recording Your Video Resume
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>Tips for creating an effective video resume:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Length:</strong> Keep it between 2-3 minutes</li>
                <li><strong>Lighting:</strong> Use natural light or well-lit room</li>
                <li><strong>Background:</strong> Choose a clean, professional setting</li>
                <li><strong>Content:</strong> Introduce yourself, highlight experience, explain teaching philosophy</li>
                <li><strong>Audio:</strong> Ensure clear sound quality</li>
                <li><strong>Dress:</strong> Professional attire similar to interview</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ai-analysis">
            <AccordionTrigger className="text-lg font-semibold">
              Understanding AI Feedback
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>Our AI Screener evaluates four key areas:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Accent & Pronunciation:</strong> Clarity and potential communication barriers</li>
                <li><strong>Energy & Enthusiasm:</strong> Body language and passion for teaching</li>
                <li><strong>Professionalism:</strong> Appearance, setting, and eye contact</li>
                <li><strong>Technical Quality:</strong> Video and audio quality</li>
              </ul>
              <p className="mt-3">Use this feedback to improve your profile and presentation skills.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="visa">
            <AccordionTrigger className="text-lg font-semibold">
              Checking Visa Eligibility
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>Our Visa Guard tool helps you understand eligibility requirements:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Enter your passport country and target work country</li>
                <li>System checks age, education, and experience requirements</li>
                <li>Results show eligible countries with reasons</li>
                <li>Always verify with official government sources</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="applying">
            <AccordionTrigger className="text-lg font-semibold">
              Applying for Jobs
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>How to apply for positions:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Browse jobs using filters (country, subject, grade level)</li>
                <li>Review job details and school information</li>
                <li>Click "Apply Now" on jobs that interest you</li>
                <li>Your profile and video are automatically sent to the recruiter</li>
                <li>Track applications in your dashboard</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recruiter">
            <AccordionTrigger className="text-lg font-semibold">
              For Recruiters: Posting Jobs
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 space-y-3">
              <p>How to post job opportunities:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Complete your school/organization profile</li>
                <li>Navigate to "Post a Job"</li>
                <li>Fill in job details (title, requirements, salary)</li>
                <li>Our AI will automatically match qualified candidates</li>
                <li>Review applications and contact candidates</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Common Topics */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Common Topics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>International Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Visa and work permit information</li>
                  <li>• Teaching license requirements by country</li>
                  <li>• Background check procedures</li>
                  <li>• Health and medical requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Documents & Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Required documents checklist</li>
                  <li>• Document verification process</li>
                  <li>• Credential authentication</li>
                  <li>• Reference letter guidelines</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Job Search Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Optimizing your profile for matches</li>
                  <li>• Using search filters effectively</li>
                  <li>• Understanding salary ranges</li>
                  <li>• Negotiation best practices</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Account & Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Managing notification preferences</li>
                  <li>• Privacy settings and data control</li>
                  <li>• Updating profile information</li>
                  <li>• Deleting or deactivating account</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h2 className="text-2xl font-bold">Still need help?</h2>
          <p className="text-muted-foreground">
            Our support team is here to assist you with any questions or concerns.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Read FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
