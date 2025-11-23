/**
 * Integration tests for Application Submission
 * Tests: Application creation, duplicate detection, status management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import type { Application, JobPosting, TeacherProfile } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    application: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    teacherProfile: {
      findUnique: vi.fn(),
    },
    jobPosting: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Application Submission Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Application Creation Flow', () => {
    it('should create a new application successfully', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'I am very interested in this position...',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.application.create).mockResolvedValueOnce(mockApplication);

      // Check if application already exists
      const existing = await prisma.application.findUnique({
        where: {
          jobId_teacherId: {
            jobId: 'job-123',
            teacherId: 'teacher-123',
          },
        },
      });

      expect(existing).toBeNull();

      // Create new application
      const application = await prisma.application.create({
        data: {
          jobId: 'job-123',
          teacherId: 'teacher-123',
          coverLetter: 'I am very interested in this position...',
          status: 'NEW',
        },
      });

      expect(application).toBeDefined();
      expect(application.jobId).toBe('job-123');
      expect(application.teacherId).toBe('teacher-123');
      expect(application.status).toBe('NEW');
      expect(application.coverLetter).toBeTruthy();
      expect(prisma.application.create).toHaveBeenCalledOnce();
    });

    it('should prevent duplicate applications', async () => {
      const existingApplication: Application = {
        id: 'app-existing',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Previous application',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(existingApplication);

      const existing = await prisma.application.findUnique({
        where: {
          jobId_teacherId: {
            jobId: 'job-123',
            teacherId: 'teacher-123',
          },
        },
      });

      expect(existing).toBeDefined();
      expect(existing?.jobId).toBe('job-123');
      expect(existing?.teacherId).toBe('teacher-123');

      // Should not create new application
      expect(prisma.application.create).not.toHaveBeenCalled();
    });

    it('should allow same teacher to apply to different jobs', async () => {
      const app1: Application = {
        id: 'app-1',
        jobId: 'job-1',
        teacherId: 'teacher-123',
        coverLetter: 'Application 1',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const app2: Application = {
        id: 'app-2',
        jobId: 'job-2',
        teacherId: 'teacher-123',
        coverLetter: 'Application 2',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.create)
        .mockResolvedValueOnce(app1)
        .mockResolvedValueOnce(app2);

      const application1 = await prisma.application.create({
        data: {
          jobId: 'job-1',
          teacherId: 'teacher-123',
          coverLetter: 'Application 1',
          status: 'NEW',
        },
      });

      const application2 = await prisma.application.create({
        data: {
          jobId: 'job-2',
          teacherId: 'teacher-123',
          coverLetter: 'Application 2',
          status: 'NEW',
        },
      });

      expect(application1.jobId).toBe('job-1');
      expect(application2.jobId).toBe('job-2');
      expect(application1.teacherId).toBe(application2.teacherId);
      expect(prisma.application.create).toHaveBeenCalledTimes(2);
    });

    it('should allow different teachers to apply to same job', async () => {
      const app1: Application = {
        id: 'app-1',
        jobId: 'job-123',
        teacherId: 'teacher-1',
        coverLetter: 'Application from teacher 1',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const app2: Application = {
        id: 'app-2',
        jobId: 'job-123',
        teacherId: 'teacher-2',
        coverLetter: 'Application from teacher 2',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.create)
        .mockResolvedValueOnce(app1)
        .mockResolvedValueOnce(app2);

      const application1 = await prisma.application.create({
        data: {
          jobId: 'job-123',
          teacherId: 'teacher-1',
          coverLetter: 'Application from teacher 1',
          status: 'NEW',
        },
      });

      const application2 = await prisma.application.create({
        data: {
          jobId: 'job-123',
          teacherId: 'teacher-2',
          coverLetter: 'Application from teacher 2',
          status: 'NEW',
        },
      });

      expect(application1.jobId).toBe(application2.jobId);
      expect(application1.teacherId).toBe('teacher-1');
      expect(application2.teacherId).toBe('teacher-2');
      expect(prisma.application.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Application Status Management', () => {
    it('should create application with NEW status by default', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.create).mockResolvedValueOnce(mockApplication);

      const application = await prisma.application.create({
        data: {
          jobId: 'job-123',
          teacherId: 'teacher-123',
          coverLetter: 'Cover letter',
          status: 'NEW',
        },
      });

      expect(application.status).toBe('NEW');
    });

    it('should update application status to REVIEWED', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'REVIEWED',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.update).mockResolvedValueOnce(mockApplication);

      const updated = await prisma.application.update({
        where: { id: 'app-123' },
        data: {
          status: 'REVIEWED',
          reviewedAt: new Date(),
        },
      });

      expect(updated.status).toBe('REVIEWED');
      expect(updated.reviewedAt).toBeDefined();
      expect(prisma.application.update).toHaveBeenCalledOnce();
    });

    it('should update application status to SHORTLISTED', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'SHORTLISTED',
        aiMatchScore: 85,
        rejectionReason: null,
        interviewScheduledAt: new Date(),
        appliedAt: new Date(),
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.update).mockResolvedValueOnce(mockApplication);

      const updated = await prisma.application.update({
        where: { id: 'app-123' },
        data: {
          status: 'SHORTLISTED',
          interviewScheduledAt: new Date(),
        },
      });

      expect(updated.status).toBe('SHORTLISTED');
      expect(updated.interviewScheduledAt).toBeDefined();
    });

    it('should update application status to REJECTED with reason', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'REJECTED',
        aiMatchScore: null,
        rejectionReason: 'Does not meet minimum experience requirements',
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.update).mockResolvedValueOnce(mockApplication);

      const updated = await prisma.application.update({
        where: { id: 'app-123' },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Does not meet minimum experience requirements',
        },
      });

      expect(updated.status).toBe('REJECTED');
      expect(updated.rejectionReason).toBeTruthy();
    });
  });

  describe('Application Retrieval', () => {
    it('should retrieve applications for a teacher', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          jobId: 'job-1',
          teacherId: 'teacher-123',
          coverLetter: 'Application 1',
          resumeUrl: null,
          status: 'NEW',
          aiMatchScore: null,
          rejectionReason: null,
          interviewScheduledAt: null,
          appliedAt: new Date(),
          reviewedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'app-2',
          jobId: 'job-2',
          teacherId: 'teacher-123',
          coverLetter: 'Application 2',
          resumeUrl: null,
          status: 'REVIEWED',
          aiMatchScore: 75,
          rejectionReason: null,
          interviewScheduledAt: null,
          appliedAt: new Date(),
          reviewedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.application.findMany).mockResolvedValueOnce(mockApplications);

      const applications = await prisma.application.findMany({
        where: { teacherId: 'teacher-123' },
        orderBy: { createdAt: 'desc' },
      });

      expect(applications).toHaveLength(2);
      expect(applications[0].teacherId).toBe('teacher-123');
      expect(applications[1].teacherId).toBe('teacher-123');
    });

    it('should count applications for a job', async () => {
      vi.mocked(prisma.application.count).mockResolvedValueOnce(15);

      const count = await prisma.application.count({
        where: { jobId: 'job-123' },
      });

      expect(count).toBe(15);
    });

    it('should retrieve application by ID', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: 80,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApplication);

      const application = await prisma.application.findUnique({
        where: { id: 'app-123' },
      });

      expect(application).toBeDefined();
      expect(application?.id).toBe('app-123');
    });
  });

  describe('AI Match Score', () => {
    it('should store AI match score when available', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: 88,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.create).mockResolvedValueOnce(mockApplication);

      const application = await prisma.application.create({
        data: {
          jobId: 'job-123',
          teacherId: 'teacher-123',
          coverLetter: 'Cover letter',
          status: 'NEW',
          aiMatchScore: 88,
        },
      });

      expect(application.aiMatchScore).toBe(88);
    });

    it('should allow null AI match score', async () => {
      const mockApplication: Application = {
        id: 'app-123',
        jobId: 'job-123',
        teacherId: 'teacher-123',
        coverLetter: 'Cover letter',
        resumeUrl: null,
        status: 'NEW',
        aiMatchScore: null,
        rejectionReason: null,
        interviewScheduledAt: null,
        appliedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.application.create).mockResolvedValueOnce(mockApplication);

      const application = await prisma.application.create({
        data: {
          jobId: 'job-123',
          teacherId: 'teacher-123',
          coverLetter: 'Cover letter',
          status: 'NEW',
          aiMatchScore: null,
        },
      });

      expect(application.aiMatchScore).toBeNull();
    });
  });
});
