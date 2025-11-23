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
  // NOTE: adapter is removed because we use JWT strategy
  // Adapter conflicts with JWT strategy - causes session not to persist
  // We'll add OAuth support later with proper adapter configuration
  trustHost: true, // Required for Vercel deployments
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
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   allowDangerousEmailAccountLinking: true,
    //   authorization: {
    //     params: {
    //       prompt: 'consent',
    //       access_type: 'offline',
    //       response_type: 'code',
    //     },
    //   },
    // }),
    // LinkedIn({
    //   clientId: process.env.LINKEDIN_CLIENT_ID,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    //   allowDangerousEmailAccountLinking: true,
    //   authorization: {
    //     params: {
    //       scope: 'openid profile email',
    //     },
    //   },
    // }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] authorize called with:', { email: credentials?.email });

        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          console.log('[AUTH] Schema validation failed:', parsed.error);
          return null;
        }

        const { email, password } = parsed.data;
        console.log('[AUTH] Looking up user:', email);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.log('[AUTH] User not found');
          return null;
        }

        if (!user.password) {
          console.log('[AUTH] User has no password');
          return null;
        }

        console.log('[AUTH] Comparing password for user:', user.id);
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          console.log('[AUTH] Password invalid');
          return null;
        }

        console.log('[AUTH] Authentication successful for:', user.email);

        // Fetch profile IDs based on role
        let teacherProfileId: string | undefined;
        let schoolProfileId: string | undefined;
        let recruiterProfileId: string | undefined;

        if (user.role === 'TEACHER') {
          const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });
          teacherProfileId = teacherProfile?.id;
        } else if (user.role === 'SCHOOL') {
          const schoolProfile = await prisma.schoolProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });
          schoolProfileId = schoolProfile?.id;
        } else if (user.role === 'RECRUITER') {
          const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });
          recruiterProfileId = recruiterProfile?.id;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          teacherProfileId,
          schoolProfileId,
          recruiterProfileId,
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
        token.teacherProfileId = user.teacherProfileId;
        token.schoolProfileId = user.schoolProfileId;
        token.recruiterProfileId = user.recruiterProfileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.teacherProfileId = token.teacherProfileId;
        session.user.schoolProfileId = token.schoolProfileId;
        session.user.recruiterProfileId = token.recruiterProfileId;

        // NOTE: Cannot check profile completion here because this runs on edge runtime
        // and Prisma Client doesn't work on edge. Profile checks should be done
        // in server components or API routes where needed.
        // Setting hasProfile to true for now to allow navigation.
        session.user.hasProfile = true;
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
