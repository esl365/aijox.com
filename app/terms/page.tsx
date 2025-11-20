import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Global Educator Nexus - User agreement and guidelines',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
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

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Global Educator Nexus ("Platform," "Service," "we," "us," or "our"),
                you agree to be bound by these Terms of Service and all applicable laws and regulations.
                If you do not agree with any of these terms, you are prohibited from using this Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                To use our Platform, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Account Types</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Teacher Accounts:</strong> For educators seeking international teaching positions</li>
                <li><strong>Recruiter Accounts:</strong> For schools and recruitment agencies posting job opportunities</li>
                <li><strong>Admin Accounts:</strong> For platform administrators</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Account Responsibilities</h3>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring all information you provide is accurate and up-to-date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide false or misleading information about your qualifications</li>
                <li>Upload inappropriate, offensive, or illegal content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the Platform or other user accounts</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Circumvent or manipulate our AI matching algorithms</li>
                <li>Share or sell your account access</li>
                <li>Post jobs that are not legitimate or discriminatory</li>
                <li>Collect user information for spam or unauthorized purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Your Content</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of content you upload (resumes, videos, documents). By uploading content,
                you grant us a worldwide, non-exclusive, royalty-free license to use, display, and process
                your content for the purpose of providing our services.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Our Content</h3>
              <p className="text-gray-700 leading-relaxed">
                The Platform, including its design, features, and AI algorithms, is owned by Global Educator Nexus
                and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.3 AI-Generated Analysis</h3>
              <p className="text-gray-700 leading-relaxed">
                AI-generated feedback on your video resume is provided "as is" for guidance purposes only.
                We do not guarantee the accuracy of AI assessments and they should not be considered
                professional career advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Job Postings and Applications</h2>

              <h3 className="text-xl font-semibold mt-4 mb-2">6.1 For Recruiters</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All job postings must be legitimate employment opportunities</li>
                <li>Job descriptions must be accurate and not misleading</li>
                <li>Postings must comply with anti-discrimination laws</li>
                <li>You are responsible for all recruitment decisions and hiring processes</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">6.2 For Teachers</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Applications must contain truthful information</li>
                <li>You are responsible for verifying employer legitimacy</li>
                <li>We do not guarantee job placements or interview outcomes</li>
                <li>Visa eligibility checks are for reference only - verify with official sources</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Visa Validation Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Our AI-powered visa eligibility checker is provided for informational purposes only.
                Visa requirements are subject to change, and you should always verify current requirements
                with official government sources before making travel or employment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Payment and Fees</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Certain features may require payment:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Recruiter accounts may have subscription fees</li>
                <li>Premium job postings may incur additional charges</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Prices are subject to change with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Platform uses third-party services including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>OpenAI and Anthropic for AI analysis</li>
                <li>Cloudflare R2 for file storage</li>
                <li>Resend for email communications</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Your use of these services is subject to their respective terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations of Liability</h2>

              <h3 className="text-xl font-semibold mt-4 mb-2">10.1 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed">
                We provide the Platform "as is" without warranties. We do not guarantee uninterrupted,
                secure, or error-free service.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">10.2 No Employment Guarantees</h3>
              <p className="text-gray-700 leading-relaxed">
                We are a job matching platform only. We do not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Guarantee job placements</li>
                <li>Verify all employer claims</li>
                <li>Act as an employment agency</li>
                <li>Become party to employment contracts between users</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">10.3 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, we are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Damages arising from third-party conduct</li>
                <li>Issues related to employment decisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Harm to other users or the Platform</li>
                <li>Extended inactivity (12+ months)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                You may terminate your account at any time through account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these Terms will be resolved through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Good faith negotiations</li>
                <li>Binding arbitration if negotiations fail</li>
                <li>Governing law: [Your Jurisdiction]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. Significant changes will be notified via email or
                platform notification. Continued use after changes constitutes acceptance of new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                For questions about these Terms, contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@globaleducatornexus.com</p>
                <p className="text-gray-700"><strong>Address:</strong> [Your Company Address]</p>
                <p className="text-gray-700"><strong>Legal Department:</strong> terms@globaleducatornexus.com</p>
              </div>
            </section>
          </div>

          <div className="pt-8 border-t">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
