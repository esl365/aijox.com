'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Application, JobPosting } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { withdrawApplication } from '@/app/actions/applications';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type ApplicationWithJob = Application & { job: JobPosting };

type ApplicationsClientProps = {
  applications: ApplicationWithJob[];
};

export function ApplicationsClient({ applications: initialApplications }: ApplicationsClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-500',
      SCREENING: 'bg-yellow-500',
      INTERVIEW: 'bg-purple-500',
      OFFER: 'bg-green-500',
      HIRED: 'bg-green-700',
      REJECTED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    const result = await withdrawApplication(applicationId);

    if (result.success) {
      toast({
        title: 'Application Withdrawn',
        description: result.message,
      });
      // Remove from local state
      setApplications(apps => apps.filter(app => app.id !== applicationId));
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const stats = {
    total: applications.length,
    new: applications.filter((app) => app.status === 'NEW').length,
    screening: applications.filter((app) => app.status === 'SCREENING').length,
    interview: applications.filter((app) => app.status === 'INTERVIEW').length,
    offer: applications.filter((app) => app.status === 'OFFER').length,
    hired: applications.filter((app) => app.status === 'HIRED').length,
    rejected: applications.filter((app) => app.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Link href="/jobs">
          <Button>Browse More Jobs</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Screening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.screening}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offer}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filter by status:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="SCREENING">Screening</SelectItem>
            <SelectItem value="INTERVIEW">Interview</SelectItem>
            <SelectItem value="OFFER">Offer</SelectItem>
            <SelectItem value="HIRED">Hired</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Showing {filteredApplications.length} of {stats.total} applications
        </span>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold">No applications found</h3>
            <p className="mt-2 text-muted-foreground">
              {filterStatus === 'all'
                ? "You haven't applied to any jobs yet"
                : `No applications with status: ${getStatusLabel(filterStatus)}`}
            </p>
            <Link href="/jobs">
              <Button className="mt-4">Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          href={`/jobs/${app.jobId}`}
                          className="hover:underline"
                        >
                          <h3 className="text-xl font-semibold">
                            {app.job.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground">
                          {app.job.schoolName} • {app.job.city}, {app.job.country}
                        </p>
                      </div>
                      <Badge
                        className={getStatusColor(app.status)}
                        variant="secondary"
                      >
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-lg font-semibold text-primary">
                        {formatSalary(app.job.salaryUSD)}/mo
                      </span>
                      <Badge variant="outline">{app.job.subject}</Badge>
                      {app.aiMatchScore && (
                        <Badge variant="secondary">
                          {app.aiMatchScore}% match
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Applied</p>
                        <p className="font-medium">{formatDate(app.createdAt)}</p>
                      </div>
                      {app.viewedAt && (
                        <div>
                          <p className="text-muted-foreground">Viewed</p>
                          <p className="font-medium">{formatDate(app.viewedAt)}</p>
                        </div>
                      )}
                      {app.interviewedAt && (
                        <div>
                          <p className="text-muted-foreground">Interview</p>
                          <p className="font-medium">
                            {formatDate(app.interviewedAt)}
                          </p>
                        </div>
                      )}
                      {app.offeredAt && (
                        <div>
                          <p className="text-muted-foreground">Offer</p>
                          <p className="font-medium">{formatDate(app.offeredAt)}</p>
                        </div>
                      )}
                    </div>

                    {app.coverLetter && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-md">
                        <p className="text-sm font-medium mb-1">Cover Letter:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/jobs/${app.jobId}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                    {['NEW', 'SCREENING'].includes(app.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWithdraw(app.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
