import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Reviews',
  description: 'Read reviews from teachers who worked here',
};

export default async function SchoolReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/schools/${id}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to School
            </Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">Teacher Reviews</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ReviewStats schoolId={id} />
          </div>
          <div className="lg:col-span-2">
            <ReviewList schoolId={id} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
