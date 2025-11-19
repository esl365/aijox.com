import { Metadata } from 'next';
import SignupPageClient from './SignupPageClient';

export const metadata: Metadata = {
  title: 'Sign Up | Global Educator Nexus',
  description: 'Create your account and join thousands of educators worldwide',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return <SignupPageClient />;
}
