'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
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
    // Server Actions must use redirectTo for NextAuth
    // This will trigger a NEXT_REDIRECT error which is expected
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/school/dashboard',
    });

    // This line won't be reached if redirectTo is used
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
    // Re-throw NEXT_REDIRECT errors to allow redirect to happen
    throw error;
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

  try {
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
    // This will trigger a NEXT_REDIRECT error which is expected
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/select-role',
    });

    // This line won't be reached if redirectTo is used
    return { success: true };
  } catch (error) {
    // If it's an AuthError, return error message
    if (error instanceof AuthError) {
      return { error: 'Failed to sign in after registration' };
    }
    // Re-throw NEXT_REDIRECT errors to allow redirect to happen
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
}
