'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { getDashboardUrl } from '@/lib/utils/routing';

const recruiterSetupSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyWebsite: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must not exceed 500 characters'),
});

type RecruiterSetupFormData = z.infer<typeof recruiterSetupSchema>;

interface RecruiterSetupFormProps {
  userId: string;
}

export function RecruiterSetupForm({ userId }: RecruiterSetupFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterSetupFormData>({
    resolver: zodResolver(recruiterSetupSchema),
  });

  const onSubmit = async (data: RecruiterSetupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recruiter/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const userRole = session?.user?.role || 'RECRUITER';
      router.push(getDashboardUrl(userRole));
      router.refresh();
    } catch (err: any) {
      console.error('Failed to save recruiter profile:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Information</CardTitle>
        <CardDescription>
          Tell us about your organization and your role
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company/Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              {...register('companyName')}
              placeholder="e.g., ABC International School"
              disabled={isLoading}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              type="url"
              {...register('companyWebsite')}
              placeholder="https://example.com"
              disabled={isLoading}
            />
            {errors.companyWebsite && (
              <p className="text-sm text-red-500">{errors.companyWebsite.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">
              Your Position <span className="text-red-500">*</span>
            </Label>
            <Input
              id="position"
              {...register('position')}
              placeholder="e.g., HR Manager, Recruitment Director"
              disabled={isLoading}
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">
              About Your Organization <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about your organization, what you do, and what kind of teachers you're looking for..."
              className="min-h-[120px]"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">50-500 characters</p>
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const userRole = session?.user?.role || 'RECRUITER';
                router.push(getDashboardUrl(userRole));
              }}
              disabled={isLoading}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
