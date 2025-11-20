import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { getDashboardUrl } from '@/lib/utils/routing';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any, // Type cast needed for NextAuth v5 beta compatibility
  session: {
    strategy: 'jwt', // Use JWT for credentials provider compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/error',
    verifyRequest: '/verify-email',
    newUser: '/select-role', // Redirect new users to role selection
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If URL is a relative path, prepend baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If URL is from the same domain, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise return baseUrl
      return baseUrl;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;

        // Check if user has completed profile setup
        const hasProfile = await checkProfileCompletion(
          token.id as string,
          token.role as string
        );
        session.user.hasProfile = hasProfile;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // OAuth sign-in (Google/LinkedIn)
      if (account?.provider === 'google' || account?.provider === 'linkedin') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user exists and has a role, allow sign in
        if (existingUser && existingUser.role) {
          return true;
        }

        // New user or user without role - will redirect to role selection via pages.newUser
        return true;
      }

      // Credentials sign-in
      return true;
    },
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
    async createUser({ user }) {
      // New user created - no role assigned yet
      console.log('New user created:', user.email);
    },
  },
});

/**
 * Check if user has completed their profile setup based on role
 */
async function checkProfileCompletion(userId: string, role: string): Promise<boolean> {
  // ADMIN doesn't need profile setup
  if (role === 'ADMIN') {
    return true;
  }

  if (role === 'TEACHER') {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });
    return !!profile;
  }

  if (role === 'RECRUITER') {
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
    });
    return !!profile;
  }

  if (role === 'SCHOOL') {
    const profile = await prisma.schoolProfile.findUnique({
      where: { userId },
    });
    return !!profile;
  }

  return false;
}
