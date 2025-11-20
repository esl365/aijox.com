import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your teaching career',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      popular: false,
      features: [
        'Access to basic job listings',
        'Up to 5 active applications',
        'Basic profile creation',
        'Email notifications',
        'Community support',
        'Job search filters',
      ],
      limitations: [
        'Limited AI features',
        'Standard matching',
        'No priority support',
      ],
    },
    {
      name: 'Premium',
      price: '$29',
      period: 'per month',
      description: 'Best for active job seekers',
      popular: true,
      features: [
        'Everything in Free, plus:',
        'Unlimited job applications',
        'Advanced AI video profile analysis',
        'Priority job matching algorithm',
        'Direct messaging with schools',
        'Resume builder with templates',
        'Application tracking dashboard',
        'Interview preparation resources',
        'Priority customer support',
        'Ad-free experience',
        'Early access to new features',
      ],
      limitations: [],
    },
    {
      name: 'Annual Premium',
      price: '$279',
      period: 'per year',
      description: 'Save 20% with annual billing',
      popular: false,
      badge: 'Best Value',
      features: [
        'Everything in Premium, plus:',
        'Save $69 per year (20% off)',
        'Extended profile visibility',
        'Exclusive webinars and events',
        'Career coaching session (1/year)',
        'Priority review of applications',
        'Dedicated account manager',
        'Custom job alerts',
      ],
      limitations: [],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">
              Find the perfect plan to accelerate your international teaching career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" className="px-4 py-1">{plan.badge}</Badge>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/ {plan.period}</span>
                    </div>
                    {plan.name === 'Annual Premium' && (
                      <p className="text-sm text-green-600 mt-2">
                        Equivalent to $23/month
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/register" className="block">
                    <Button
                      className={`w-full gap-2 ${
                        plan.popular
                          ? ''
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      size="lg"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">
                  Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Our Free plan is available forever. Premium plans offer a 14-day money-back guarantee.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Do you offer discounts for schools?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer special pricing for educational institutions. Contact our sales team for more information.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">What happens to my data if I cancel?</h3>
                <p className="text-muted-foreground">
                  Your profile and application history will be preserved for 90 days after cancellation, allowing you to reactivate easily.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Still have questions?</h2>
            <p className="text-muted-foreground">
              Our support team is here to help you choose the right plan for your needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
              <Link href="/support">
                <Button size="lg">
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
