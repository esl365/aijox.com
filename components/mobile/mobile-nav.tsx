'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Home, Briefcase, Building2, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigationLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/jobs', label: 'Find Jobs', icon: Briefcase },
  { href: '/schools', label: 'Schools', icon: Building2 },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const closeDialog = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-2 mt-4">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeDialog}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg min-h-[44px] text-base transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
