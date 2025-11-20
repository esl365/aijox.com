import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edit Job Posting',
  description: 'Update your job posting',
};

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/recruiter/jobs/' + params.id + '/edit');
  }

  if (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Mock job data - in production this would come from database
  const job = {
    id: params.id,
    title: 'ESL Teacher',
    type: 'FULL_TIME',
    subject: 'ENGLISH',
    description: 'We are seeking an experienced ESL teacher to join our international school in Seoul...',
    country: 'KR',
    city: 'Seoul',
    workType: 'ON_SITE',
    salaryMin: 30000,
    salaryMax: 45000,
    currency: 'USD',
    requirements: 'Bachelor\'s degree required\nTEFL/TESOL certification\n2+ years teaching experience',
    experienceYears: 2,
    educationLevel: 'BACHELORS',
    preferredQualifications: 'Experience teaching in Asia\nFamiliarity with Cambridge or IB curriculum',
    benefits: 'Housing allowance\nHealth insurance\n20 days paid vacation\nFlight reimbursement',
    startDate: '2025-03-01',
    deadline: '2025-02-15',
    visaSupport: true,
    urgentHiring: false,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Job Posting</h1>
            <p className="text-muted-foreground">
              Update your teaching position details
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about the position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                defaultValue={job.title}
                placeholder="e.g., ESL Teacher, Math Teacher, Science Teacher"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select defaultValue={job.type}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Area *</Label>
                <Select defaultValue={job.subject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENGLISH">English/ESL</SelectItem>
                    <SelectItem value="MATH">Mathematics</SelectItem>
                    <SelectItem value="SCIENCE">Science</SelectItem>
                    <SelectItem value="SOCIAL_STUDIES">Social Studies</SelectItem>
                    <SelectItem value="LANGUAGES">Languages</SelectItem>
                    <SelectItem value="ARTS">Arts</SelectItem>
                    <SelectItem value="PE">Physical Education</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                defaultValue={job.description}
                placeholder="Describe the role, responsibilities, and what makes this position attractive..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Compensation</CardTitle>
            <CardDescription>
              Where the position is located and salary details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select defaultValue={job.country}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KR">South Korea</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="CN">China</SelectItem>
                    <SelectItem value="SG">Singapore</SelectItem>
                    <SelectItem value="TH">Thailand</SelectItem>
                    <SelectItem value="VN">Vietnam</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" defaultValue={job.city} placeholder="e.g., Seoul, Tokyo, Singapore" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workType">Work Type *</Label>
                <Select defaultValue={job.workType}>
                  <SelectTrigger id="workType">
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_SITE">On-site</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  defaultValue={job.salaryMin}
                  placeholder="30000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  defaultValue={job.salaryMax}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select defaultValue={job.currency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="KRW">KRW (₩)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                    <SelectItem value="SGD">SGD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Qualifications and requirements for candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="requirements">Required Qualifications *</Label>
              <Textarea
                id="requirements"
                defaultValue={job.requirements}
                placeholder="List required qualifications..."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Minimum Experience (Years)</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  defaultValue={job.experienceYears}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationLevel">Education Level *</Label>
                <Select defaultValue={job.educationLevel}>
                  <SelectTrigger id="educationLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACHELORS">Bachelor's Degree</SelectItem>
                    <SelectItem value="MASTERS">Master's Degree</SelectItem>
                    <SelectItem value="DOCTORATE">Doctorate</SelectItem>
                    <SelectItem value="CERTIFICATE">Teaching Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredQualifications">Preferred Qualifications</Label>
              <Textarea
                id="preferredQualifications"
                defaultValue={job.preferredQualifications}
                placeholder="List preferred but not required qualifications..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefits & Application</CardTitle>
            <CardDescription>
              What you offer and application details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <Textarea
                id="benefits"
                defaultValue={job.benefits}
                placeholder="List benefits..."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" defaultValue={job.startDate} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input id="deadline" type="date" defaultValue={job.deadline} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="visaSupport" className="font-medium">
                  Visa Sponsorship Available
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  We can sponsor work visas for qualified candidates
                </p>
              </div>
              <Switch id="visaSupport" defaultChecked={job.visaSupport} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="urgentHiring" className="font-medium">
                  Urgent Hiring
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Mark this position as urgent to attract faster responses
                </p>
              </div>
              <Switch id="urgentHiring" defaultChecked={job.urgentHiring} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Job
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
