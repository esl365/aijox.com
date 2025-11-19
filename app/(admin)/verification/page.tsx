import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPendingVerifications, getVerificationStats } from '@/app/actions/verification';
import { VerificationTable } from '@/components/admin/VerificationTable';
import { StatCard } from '@/components/analytics/StatCard';
import { Building2, User, CheckCircle2, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verification Management | Admin Dashboard',
  description: 'Manage verification requests for schools and recruiters.',
};

export default async function VerificationManagementPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const [requests, stats] = await Promise.all([
    getPendingVerifications(),
    getVerificationStats(),
  ]);

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unable to Load Verification Data</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Verification Management</h1>
        <p className="mt-2 text-muted-foreground">
          Review and verify schools and recruiters to build platform trust
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Pending Schools"
          value={stats.schools.pending}
          icon={Clock}
          subtitle="Awaiting verification"
        />
        <StatCard
          title="Verified Schools"
          value={stats.schools.verified}
          icon={Building2}
          subtitle={`${stats.schools.verificationRate.toFixed(1)}% verified`}
        />
        <StatCard
          title="Pending Recruiters"
          value={stats.recruiters.pending}
          icon={Clock}
          subtitle="Awaiting verification"
        />
        <StatCard
          title="Verified Recruiters"
          value={stats.recruiters.verified}
          icon={User}
          subtitle={`${stats.recruiters.verificationRate.toFixed(1)}% verified`}
        />
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Pending Verification Requests ({requests.length})
          </h2>
        </div>
        <VerificationTable requests={requests} />
      </div>

      {/* Verification Guidelines */}
      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-3">📋 Verification Guidelines</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">Approve if:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Email domain is from recognized educational institution (.edu, .ac.uk, etc.)</li>
              <li>✅ Website is legitimate and matches school/company name</li>
              <li>✅ Organization can be verified through online search</li>
              <li>✅ Email domain contains "school", "academy", "university", etc.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Reject if:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>❌ Free email provider (gmail.com, yahoo.com, etc.)</li>
              <li>❌ Website is missing or suspicious</li>
              <li>❌ Cannot verify organization legitimacy</li>
              <li>❌ Duplicate or fraudulent request</li>
              <li>❌ Profile information is incomplete or inconsistent</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Verification builds trust on the platform. Only verify
            legitimate educational institutions and verified recruiters. When in doubt, request
            additional documentation via email.
          </p>
        </div>
      </div>
    </div>
  );
}
