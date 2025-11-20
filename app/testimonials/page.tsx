import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Teacher Testimonials',
  description: 'Read success stories from teachers who found their dream positions',
};

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'ESL Teacher',
      location: 'Seoul, South Korea',
      rating: 5,
      quote: 'Global Educator Nexus completely changed my career! The AI video analysis helped me perfect my presentation, and I landed my dream job in Seoul within 2 months. The platform is incredibly user-friendly and the support team is amazing.',
      initials: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Mathematics Teacher',
      location: 'Singapore',
      rating: 5,
      quote: 'I was skeptical at first, but the smart matching algorithm really works. It connected me with schools that perfectly matched my teaching philosophy and experience. The visa checker saved me so much time and research.',
      initials: 'MC',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Science Teacher',
      location: 'Tokyo, Japan',
      rating: 5,
      quote: 'The direct messaging feature was a game-changer. Being able to communicate directly with school administrators helped me understand the culture and expectations before even applying. Highly recommend for anyone looking to teach abroad!',
      initials: 'ER',
    },
    {
      name: 'David Williams',
      role: 'History Teacher',
      location: 'Shanghai, China',
      rating: 5,
      quote: 'Best decision I ever made was joining this platform. The resume builder and interview prep resources gave me the confidence to apply for top-tier international schools. Now I\'m living my dream in Shanghai!',
      initials: 'DW',
    },
    {
      name: 'Lisa Martinez',
      role: 'English Teacher',
      location: 'Bangkok, Thailand',
      rating: 5,
      quote: 'As a first-time international teacher, I was nervous about the whole process. The platform guided me every step of the way, from understanding visa requirements to negotiating my contract. Couldn\'t have done it without them.',
      initials: 'LM',
    },
    {
      name: 'James Anderson',
      role: 'Music Teacher',
      location: 'Hong Kong',
      rating: 5,
      quote: 'The community aspect is incredible. Connecting with other teachers who have already made the move helped me prepare mentally and practically. The job alerts ensured I never missed an opportunity.',
      initials: 'JA',
    },
    {
      name: 'Priya Patel',
      role: 'Primary Teacher',
      location: 'Dubai, UAE',
      rating: 5,
      quote: 'I appreciated the transparency and authenticity of school reviews. Reading real experiences from other teachers helped me make an informed decision. The platform truly cares about matching teachers with the right schools.',
      initials: 'PP',
    },
    {
      name: 'Robert Taylor',
      role: 'PE Teacher',
      location: 'Kuala Lumpur, Malaysia',
      rating: 5,
      quote: 'From application to offer letter, everything was seamless. The application tracking dashboard kept me organized, and I always knew exactly where I stood with each school. Professional, efficient, and effective.',
      initials: 'RT',
    },
    {
      name: 'Sophie Zhang',
      role: 'Art Teacher',
      location: 'Taipei, Taiwan',
      rating: 5,
      quote: 'The AI-powered features are genuinely helpful, not just gimmicks. The video analysis pointed out things I never would have noticed about my presentation style. It made a real difference in my interviews.',
      initials: 'SZ',
    },
    {
      name: 'Daniel Kim',
      role: 'Computer Science Teacher',
      location: 'Hanoi, Vietnam',
      rating: 4,
      quote: 'Great platform with excellent features. The search filters made it easy to find exactly what I was looking for. My only suggestion would be to add more positions in emerging markets, but overall very satisfied!',
      initials: 'DK',
    },
    {
      name: 'Rachel Green',
      role: 'Language Teacher',
      location: 'Abu Dhabi, UAE',
      rating: 5,
      quote: 'The premium subscription was worth every penny. Priority matching and direct messaging opened doors I didn\'t even know existed. Within weeks, I had multiple offers to choose from. Incredible value!',
      initials: 'RG',
    },
    {
      name: 'Thomas Brown',
      role: 'Social Studies Teacher',
      location: 'Busan, South Korea',
      rating: 5,
      quote: 'I\'ve used other platforms before, but none compare to Global Educator Nexus. The quality of job listings, the responsiveness of schools, and the support tools all exceeded my expectations. This is the real deal.',
      initials: 'TB',
    },
  ];

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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold">Success Stories</h1>
            <p className="text-xl text-muted-foreground">
              Real teachers, real experiences, real results. Discover how educators like you found their dream teaching positions abroad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <Quote className="h-8 w-8 text-primary/20" />

                  <div className="space-y-2">
                    <div>{renderStars(testimonial.rating)}</div>
                    <p className="text-sm leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center">Join Thousands of Successful Teachers</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">15,000+</div>
                <div className="text-sm text-muted-foreground">Teachers Placed</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-lg p-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl font-bold">Your Success Story Starts Here</h2>
              <p className="text-xl opacity-90">
                Join our community of international educators and find your perfect teaching position today.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Want to share your story?</h2>
            <p className="text-muted-foreground">
              We'd love to hear about your experience! Share your journey and inspire other teachers.
            </p>
            <Link href="/contact">
              <Button size="lg">
                Submit Your Story
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
