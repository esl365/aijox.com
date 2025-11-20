'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <LogOut className="h-4 w-4" />
      Log Out
    </Button>
  );
}
