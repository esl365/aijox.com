import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-4xl font-semibold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>
          <Link href="/jobs">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-5 w-5" />
              Browse Jobs
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-4">You might be looking for:</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/login" className="text-primary hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-3 w-3" />
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="text-primary hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-3 w-3" />
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-3 w-3" />
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-primary hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-3 w-3" />
                Contact Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
