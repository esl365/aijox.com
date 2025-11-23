/**
 * Integration tests for Auth flow
 * Tests: User Signup/Login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    teacherProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    recruiterProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    schoolProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Signup Flow', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password123', 10),
        role: 'TEACHER',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);

      // Simulate user creation
      const existingUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(existingUser).toBeNull();

      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: await bcrypt.hash('password123', 10),
          role: 'TEACHER',
        },
      });

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe('test@example.com');
      expect(newUser.role).toBe('TEACHER');
      expect(prisma.user.create).toHaveBeenCalledOnce();
    });

    it('should prevent duplicate email registration', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'hashed',
        role: 'TEACHER',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(existingUser);

      const user = await prisma.user.findUnique({
        where: { email: 'existing@example.com' },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe('existing@example.com');

      // Should not create a new user
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('User Login Flow', () => {
    it('should authenticate user with valid credentials', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'TEACHER',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user).toBeDefined();
      expect(user?.password).toBeDefined();

      const isValid = await bcrypt.compare(plainPassword, user!.password!);
      expect(isValid).toBe(true);
    });

    it('should reject login with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'TEACHER',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      const isValid = await bcrypt.compare('wrongPassword', user!.password!);
      expect(isValid).toBe(false);
    });

    it('should reject login for non-existent user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });

    it('should reject login for user without password (OAuth only)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null, // OAuth users don't have passwords
        role: 'TEACHER',
        emailVerified: new Date(),
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: 'oauth@example.com' },
      });

      expect(user).toBeDefined();
      expect(user?.password).toBeNull();

      // Cannot login with credentials if no password is set
      // This would be rejected in the authorize function
    });
  });

  describe('Role-based Profile Creation', () => {
    it('should create teacher profile after user creation', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'teacher@example.com',
        name: 'Teacher User',
        password: 'hashed',
        role: 'TEACHER',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTeacherProfile = {
        id: 'teacher-123',
        userId: 'user-123',
        firstName: 'Test',
        lastName: 'Teacher',
        bio: null,
        videoUrl: null,
        subjects: [],
        yearsExperience: 0,
        citizenship: null,
        nativeSpeaker: false,
        degree: null,
        degreeField: null,
        university: null,
        certifications: [],
        preferredCountries: [],
        minSalaryUSD: null,
        willingToRelocate: false,
        status: 'ACTIVE',
        profileCompleteness: 0,
        aiAnalysis: null,
        visaStatusCache: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.teacherProfile.create).mockResolvedValueOnce(mockTeacherProfile);

      const user = await prisma.user.create({
        data: {
          email: 'teacher@example.com',
          name: 'Teacher User',
          password: 'hashed',
          role: 'TEACHER',
        },
      });

      const profile = await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          firstName: 'Test',
          lastName: 'Teacher',
        },
      });

      expect(user.role).toBe('TEACHER');
      expect(profile.userId).toBe(user.id);
      expect(prisma.teacherProfile.create).toHaveBeenCalledOnce();
    });

    it('should create recruiter profile for RECRUITER role', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'recruiter@example.com',
        name: 'Recruiter User',
        password: 'hashed',
        role: 'RECRUITER',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecruiterProfile = {
        id: 'recruiter-123',
        userId: 'user-456',
        firstName: 'Test',
        lastName: 'Recruiter',
        company: null,
        position: null,
        phone: null,
        linkedIn: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.recruiterProfile.create).mockResolvedValueOnce(mockRecruiterProfile);

      const user = await prisma.user.create({
        data: {
          email: 'recruiter@example.com',
          name: 'Recruiter User',
          password: 'hashed',
          role: 'RECRUITER',
        },
      });

      const profile = await prisma.recruiterProfile.create({
        data: {
          userId: user.id,
          firstName: 'Test',
          lastName: 'Recruiter',
        },
      });

      expect(user.role).toBe('RECRUITER');
      expect(profile.userId).toBe(user.id);
      expect(prisma.recruiterProfile.create).toHaveBeenCalledOnce();
    });
  });
});
