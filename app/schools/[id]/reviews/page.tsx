import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { Footer } from '@/components/shared/footer';
import { ArrowLeft } from 'lucide-react';
import type { ReviewWithAuthor } from '@/app/actions/reviews';
import { ReviewType, ReviewStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'School Reviews',
  description: 'Read reviews from teachers who worked here',
};

export default async function SchoolReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Mock review data matching ReviewWithAuthor type
  const mockReviews: ReviewWithAuthor[] = [
    {
      id: '1',
      createdAt: new Date('2025-01-15'),
      reviewType: ReviewType.SCHOOL_REVIEW,
      status: ReviewStatus.APPROVED,
      authorId: 'teacher1',
      authorName: 'John Doe',
      rating: 5,
      title: 'Amazing school with great support',
      comment: 'I worked at this school for 3 years and had an incredible experience. The management is supportive, students are motivated, and the facilities are top-notch.',
      workPeriod: '2020-2023',
      isVerified: true,
      helpfulCount: 12,
      notHelpfulCount: 0,
      jobId: null,
      schoolId: id,
    },
    {
      id: '2',
      createdAt: new Date('2025-01-10'),
      reviewType: ReviewType.SCHOOL_REVIEW,
      status: ReviewStatus.APPROVED,
      authorId: 'teacher2',
      authorName: 'Sarah Smith',
      rating: 5,
      title: 'Professional environment',
      comment: 'Excellent professional development opportunities and very collegial staff. Would highly recommend to any teacher looking for a quality international school.',
      workPeriod: '2021-2024',
      isVerified: true,
      helpfulCount: 8,
      notHelpfulCount: 0,
      jobId: null,
      schoolId: id,
    },
    {
      id: '3',
      createdAt: new Date('2025-01-05'),
      reviewType: ReviewType.SCHOOL_REVIEW,
      status: ReviewStatus.APPROVED,
      authorId: 'teacher3',
      authorName: 'Michael Chen',
      rating: 4,
      title: 'Good experience overall',
      comment: 'Great location and good benefits package. Some improvements could be made in communication, but overall a solid place to work.',
      workPeriod: '2022-2024',
      isVerified: true,
      helpfulCount: 5,
      notHelpfulCount: 1,
      jobId: null,
      schoolId: id,
    },
  ];

  // Calculate stats
  const totalReviews = mockReviews.length;
  const averageRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingDistribution = {
    5: mockReviews.filter(r => r.rating === 5).length,
    4: mockReviews.filter(r => r.rating === 4).length,
    3: mockReviews.filter(r => r.rating === 3).length,
    2: mockReviews.filter(r => r.rating === 2).length,
    1: mockReviews.filter(r => r.rating === 1).length,
  };

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
            <ReviewStats
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingDistribution={ratingDistribution}
            />
          </div>
          <div className="lg:col-span-2">
            <ReviewList reviews={mockReviews} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
