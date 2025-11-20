import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  BriefcaseIcon,
  Building2,
  FileText,
  Users,
  Menu,
} from 'lucide-react';

interface NavigationProps {
  className?: string;
}

export async function Navigation({ className = '' }: NavigationProps) {
  const session = await auth();

  const userRole = session?.user?.role;
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Mock unread counts (these would come from database in production)
  const unreadNotifications = 2;
  const unreadMessages = 1;

  return (
    <header className={`border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI JobX
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!session?.user ? (
              // Public Navigation
              <>
                <Link href="/jobs">
                  <Button variant="ghost">Browse Jobs</Button>
                </Link>
                <Link href="/schools">
                  <Button variant="ghost">Schools</Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="ghost">How It Works</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              // Authenticated Navigation
              <>
                {/* Teacher Navigation */}
                {userRole === 'TEACHER' && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/jobs">
                      <Button variant="ghost" className="gap-2">
                        <BriefcaseIcon className="h-4 w-4" />
                        Jobs
                      </Button>
                    </Link>
                    <Link href="/schools">
                      <Button variant="ghost" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Schools
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  </>
                )}

                {/* Recruiter Navigation */}
                {userRole === 'RECRUITER' && (
                  <>
                    <Link href="/recruiter/dashboard">
                      <Button variant="ghost" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/recruiter/jobs">
                      <Button variant="ghost" className="gap-2">
                        <BriefcaseIcon className="h-4 w-4" />
                        My Jobs
                      </Button>
                    </Link>
                    <Link href="/recruiter/applications">
                      <Button variant="ghost" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Applications
                      </Button>
                    </Link>
                    <Link href="/recruiter/profile">
                      <Button variant="ghost" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        School Profile
                      </Button>
                    </Link>
                  </>
                )}

                {/* Admin Navigation */}
                {userRole === 'ADMIN' && (
                  <>
                    <Link href="/admin/dashboard">
                      <Button variant="ghost" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/users">
                      <Button variant="ghost" className="gap-2">
                        <Users className="h-4 w-4" />
                        Users
                      </Button>
                    </Link>
                    <Link href="/admin/jobs">
                      <Button variant="ghost" className="gap-2">
                        <BriefcaseIcon className="h-4 w-4" />
                        Jobs
                      </Button>
                    </Link>
                  </>
                )}

                {/* Notifications */}
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessages > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {userRole}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/help" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Help Center
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout" className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!session?.user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs" className="cursor-pointer">
                        Browse Jobs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/schools" className="cursor-pointer">
                        Schools
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/how-it-works" className="cursor-pointer">
                        How It Works
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="cursor-pointer">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="cursor-pointer">
                        Get Started
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {userRole}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userRole === 'TEACHER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/jobs" className="cursor-pointer">
                            <BriefcaseIcon className="mr-2 h-4 w-4" />
                            Jobs
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {userRole === 'RECRUITER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/recruiter/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/recruiter/jobs" className="cursor-pointer">
                            <BriefcaseIcon className="mr-2 h-4 w-4" />
                            My Jobs
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/recruiter/applications" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Applications
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                        {unreadNotifications > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadNotifications}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Messages
                        {unreadMessages > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadMessages}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout" className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
