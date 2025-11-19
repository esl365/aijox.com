'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  teacherProfileSchema,
  type TeacherProfileFormData,
  SUBJECT_OPTIONS,
  COUNTRY_OPTIONS,
  CITIZENSHIP_OPTIONS,
  CERTIFICATION_OPTIONS,
} from '@/lib/validations/teacher-profile';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface ProfileFormProps {
  userId: string;
  defaultValues?: Partial<TeacherProfileFormData>;
  onSubmit: (data: TeacherProfileFormData) => Promise<void>;
  profileCompleteness?: number;
}

export function TeacherProfileForm({
  userId,
  defaultValues,
  onSubmit,
  profileCompleteness = 0,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeacherProfileFormData>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: defaultValues || {
      subjects: [],
      preferredCountries: [],
      certifications: [],
      hasTeachingLicense: false,
      hasTEFL: false,
      criminalRecord: 'clean',
      hasApostille: false,
      hasHealthCertificate: false,
    },
  });

  const handleSubmit = async (data: TeacherProfileFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Profile Completeness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profile Completeness</span>
              <span className="text-2xl font-bold text-primary">
                {profileCompleteness}%
              </span>
            </CardTitle>
            <CardDescription>
              Complete your profile to unlock more job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profileCompleteness} className="h-3" />
            {profileCompleteness >= 70 && (
              <div className="flex items-center gap-2 mt-3 text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Your profile is visible to schools!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Tell schools about yourself..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief introduction about your teaching philosophy and experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where you are and where you want to teach</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="currentCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredCountries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Countries</FormLabel>
                  <FormDescription>
                    Select countries where you'd like to teach (hold Ctrl/Cmd for multiple)
                  </FormDescription>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRY_OPTIONS.map((country) => {
                      const isSelected = field.value?.includes(country);
                      return (
                        <Badge
                          key={country}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value.filter((c) => c !== country)
                              : [...(field.value || []), country];
                            field.onChange(newValue);
                          }}
                        >
                          {country}
                        </Badge>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Experience & Education */}
        <Card>
          <CardHeader>
            <CardTitle>Experience & Education</CardTitle>
            <CardDescription>Your professional qualifications</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="yearsExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Teaching Experience</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects</FormLabel>
                  <FormDescription>Select all subjects you can teach</FormDescription>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_OPTIONS.map((subject) => {
                      const isSelected = field.value?.includes(subject);
                      return (
                        <Badge
                          key={subject}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value.filter((s) => s !== subject)
                              : [...(field.value || []), subject];
                            field.onChange(newValue);
                          }}
                        >
                          {subject}
                        </Badge>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="degreeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="BS">BS</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                        <SelectItem value="MS">MS</SelectItem>
                        <SelectItem value="MEd">MEd</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degreeMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major</FormLabel>
                    <FormControl>
                      <Input placeholder="Education, English, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {CERTIFICATION_OPTIONS.map((cert) => {
                      const isSelected = field.value?.includes(cert);
                      return (
                        <Badge
                          key={cert}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value?.filter((c) => c !== cert) || []
                              : [...(field.value || []), cert];
                            field.onChange(newValue);
                          }}
                        >
                          {cert}
                        </Badge>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Visa & Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Visa & Legal Information</CardTitle>
            <CardDescription>Required for visa eligibility checks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="citizenship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citizenship</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select citizenship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CITIZENSHIP_OPTIONS.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="18" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="criminalRecord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Criminal Record Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clean">Clean</SelectItem>
                      <SelectItem value="minor">Minor offenses</SelectItem>
                      <SelectItem value="felony">Felony</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Salary Expectations */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Expectations</CardTitle>
            <CardDescription>Help us find jobs that match your needs</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minSalaryUSD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary (USD/month)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="20000" placeholder="2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSalaryUSD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary (USD/month)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="20000" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
