'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface TopJob {
  id: string;
  title: string;
  country: string;
  applicationCount: number;
  hiredCount: number;
  conversionRate: number;
}

interface TopJobsTableProps {
  jobs: TopJob[];
}

export function TopJobsTable({ jobs }: TopJobsTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Top Performing Jobs</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Job Title
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Country
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Applications
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Hired
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Conversion
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  No jobs posted yet
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {job.country}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {job.applicationCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {job.hiredCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold">{job.conversionRate}%</span>
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${job.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
