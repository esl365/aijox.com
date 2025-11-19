import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FAQSection } from '@/components/faq/FAQSection';
import { faqData } from '@/lib/data/faq-data';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Global Educator Nexus',
  description:
    'Find answers to common questions about teaching abroad, visa requirements, job applications, and using the Global Educator Nexus platform.',
  keywords: [
    'teaching abroad FAQ',
    'international teaching questions',
    'ESL jobs FAQ',
    'visa requirements teachers',
    'teaching license requirements',
    'TEFL certification',
    'how to teach abroad',
    'teacher visa guide',
  ],
  openGraph: {
    title: 'FAQ - Global Educator Nexus',
    description:
      'Get answers about teaching abroad, visa requirements, and finding international teaching jobs.',
    type: 'website',
  },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know about teaching abroad and using our platform
            </p>

            {/* Search - Future enhancement */}
            <div className="relative max-w-xl mx-auto">
              <Input
                type="search"
                placeholder="Search for answers..."
                className="pr-12"
                disabled
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                🔍
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Search coming soon - browse categories below
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {faqData.map((category) => (
              <a
                key={category.title}
                href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-block"
              >
                <Button variant="outline" size="sm">
                  {category.icon} {category.title}
                </Button>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqData.map((category) => (
            <FAQSection key={category.title} category={category} />
          ))}

          {/* Still Have Questions? */}
          <Card className="bg-primary/5">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/support">
                  <Button size="lg">Contact Support</Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" size="lg">
                    Read Our Blog
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Related Resources */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Related Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/blog/south-korea-e-2-visa-guide">
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <div className="p-6">
                    <div className="text-3xl mb-3">🇰🇷</div>
                    <h3 className="font-semibold mb-2">South Korea E-2 Visa Guide</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete guide to getting a teaching visa in Korea
                    </p>
                  </div>
                </Card>
              </Link>

              <Link href="/visa-status">
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <div className="p-6">
                    <div className="text-3xl mb-3">🛂</div>
                    <h3 className="font-semibold mb-2">Check Visa Eligibility</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered visa checker for 10+ countries
                    </p>
                  </div>
                </Card>
              </Link>

              <Link href="/jobs">
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <div className="p-6">
                    <div className="text-3xl mb-3">🔍</div>
                    <h3 className="font-semibold mb-2">Browse Teaching Jobs</h3>
                    <p className="text-sm text-muted-foreground">
                      Find your next international teaching opportunity
                    </p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
