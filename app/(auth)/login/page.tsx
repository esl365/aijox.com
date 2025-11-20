'use client';

import { SignIn } from '@stackframe/stack';
import { Metadata } from 'next';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </div>
  );
}
