import { Metadata } from 'next';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Login | Global Educator Nexus',
  description: 'Sign in to your account',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginPageClient />;
}
