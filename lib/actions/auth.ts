'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getDashboardUrl } from '@/lib/utils/routing';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function authenticate(formData: FormData) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0].message,
    };
  }

  try {
    const result = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Invalid email or password' };
    }

    // Return success - client will handle redirect
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function register(formData: FormData) {
  const rawFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = signupSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0].message,
    };
  }

  const { name, email, password } = parsed.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'User with this email already exists' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: new Date(), // Auto-verify for credentials signup
    },
  });

  // Automatically sign in the user after registration
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Failed to sign in after registration' };
    }

    // Return success - client will handle redirect
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Failed to sign in after registration' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
}
