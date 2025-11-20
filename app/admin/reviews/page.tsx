import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, CheckCircle, XCircle, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reviews Management',
  description: 'Moderate school and job reviews',
};

export default async function AdminReviewsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const reviews = [
    {
      id: 1,
      target: 'Seoul International Academy',
      targetType: 'school',
      reviewer: 'John Doe',
      reviewerEmail: 'john.doe@example.com',
      rating: 5,
      content: 'Excellent school with great support for teachers. Highly recommend!',
      status: 'PENDING',
      date: '2025-01-20'
    },
    {
      id: 2,
      target: 'ESL Teacher Position - Tokyo',
      targetType: 'job',
      reviewer: 'Jane Smith',
      reviewerEmail: 'jane.smith@example.com',
      rating: 2,
      content: 'Job description was misleading. Working conditions not as advertised.',
      status: 'PENDING',
      date: '2025-01-19'
    },
    {
      id: 3,
      target: 'Singapore American School',
      targetType: 'school',
      reviewer: 'Mike Johnson',
      reviewerEmail: 'mike.j@example.com',
      rating: 4,
      content: 'Good experience overall. Management is supportive and professional.',
      status: 'APPROVED',
      date: '2025-01-18'
    },
    {
      id: 4,
      target: 'Math Teacher - Beijing International',
      targetType: 'job',
      reviewer: 'Sarah Lee',
      reviewerEmail: 'sarah.lee@example.com',
      rating: 1,
      content: 'Terrible experience. Unprofessional staff and broken promises.',
      status: 'REJECTED',
      date: '2025-01-17'
    },
  ];

  const pendingReviews = reviews.filter(r => r.status === 'PENDING');
  const approvedReviews = reviews.filter(r => r.status === 'APPROVED');
  const rejectedReviews = reviews.filter(r => r.status === 'REJECTED');

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reviews Management</h1>
          <p className="text-muted-foreground">Moderate and manage user reviews</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search reviews..." className="pl-10" />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{review.target}</h3>
                          <Badge variant="secondary">{review.targetType.toUpperCase()}</Badge>
                          <Badge variant="destructive">{review.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-sm mb-3 p-3 bg-muted rounded-md">
                          {review.content}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Reviewer:</span> {review.reviewer} ({review.reviewerEmail})
                          <span className="mx-2">•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{review.target}</h3>
                          <Badge variant="secondary">{review.targetType.toUpperCase()}</Badge>
                          <Badge className="bg-green-600">{review.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-sm mb-3 p-3 bg-muted rounded-md">
                          {review.content}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Reviewer:</span> {review.reviewer}
                          <span className="mx-2">•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{review.target}</h3>
                          <Badge variant="secondary">{review.targetType.toUpperCase()}</Badge>
                          <Badge variant="outline">{review.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-sm mb-3 p-3 bg-muted rounded-md">
                          {review.content}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Reviewer:</span> {review.reviewer}
                          <span className="mx-2">•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
