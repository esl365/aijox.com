'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, Building2, Users } from 'lucide-react';
import { setUserRole } from '@/app/actions/set-role';

type Role = 'TEACHER' | 'RECRUITER' | 'SCHOOL';

interface RoleOption {
  value: Role;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleOptions: RoleOption[] = [
  {
    value: 'TEACHER',
    label: 'Teacher',
    description: 'Find international teaching opportunities and manage your profile',
    icon: GraduationCap,
  },
  {
    value: 'RECRUITER',
    label: 'Recruiter',
    description: 'Discover qualified teachers and manage job postings',
    icon: Users,
  },
  {
    value: 'SCHOOL',
    label: 'School',
    description: 'Post jobs and hire teachers for your institution',
    icon: Building2,
  },
];

export function RoleSelector() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    setIsLoading(true);
    setError(null);

    try {
      const result = await setUserRole(role);

      if (!result.success) {
        setError(result.message || 'Failed to set role. Please try again.');
        setIsLoading(false);
        return;
      }

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to set role:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.value;
          const isDisabled = isLoading;

          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && handleRoleSelect(option.value)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>{option.label}</CardTitle>
                <CardDescription className="min-h-[3rem]">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={isSelected ? 'default' : 'outline'}
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) handleRoleSelect(option.value);
                  }}
                >
                  {isLoading && isSelected ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    `Continue as ${option.label}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
