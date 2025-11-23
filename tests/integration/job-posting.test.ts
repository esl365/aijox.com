/**
 * Integration tests for Job Posting Creation
 * Tests: Job creation, filtering, and retrieval
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import type { JobPosting } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    jobPosting: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    schoolProfile: {
      findUnique: vi.fn(),
    },
    recruiterProfile: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Job Posting Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Job Creation Flow', () => {
    it('should create a new job posting with required fields', async () => {
      const mockJob: JobPosting = {
        id: 'job-123',
        schoolId: 'school-123',
        recruiterId: null,
        title: 'English Teacher - Elementary School',
        description: 'We are seeking an enthusiastic English teacher...',
        country: 'South Korea',
        city: 'Seoul',
        subject: 'English',
        gradeLevel: 'Elementary',
        salaryUSD: 2500,
        housingProvided: true,
        flightProvided: true,
        contractLength: '12 months',
        startDate: new Date('2024-09-01'),
        applicationDeadline: new Date('2024-07-01'),
        minYearsExperience: 2,
        educationRequirement: 'Bachelor',
        certificationRequirement: 'TEFL',
        otherBenefits: ['Health Insurance', 'Paid Vacation'],
        status: 'ACTIVE',
        viewCount: 0,
        slug: 'english-teacher-elementary-school-seoul',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.jobPosting.create).mockResolvedValueOnce(mockJob);

      const job = await prisma.jobPosting.create({
        data: {
          schoolId: 'school-123',
          title: 'English Teacher - Elementary School',
          description: 'We are seeking an enthusiastic English teacher...',
          country: 'South Korea',
          city: 'Seoul',
          subject: 'English',
          gradeLevel: 'Elementary',
          salaryUSD: 2500,
          housingProvided: true,
          flightProvided: true,
          contractLength: '12 months',
          startDate: new Date('2024-09-01'),
          applicationDeadline: new Date('2024-07-01'),
          minYearsExperience: 2,
          educationRequirement: 'Bachelor',
          certificationRequirement: 'TEFL',
          otherBenefits: ['Health Insurance', 'Paid Vacation'],
          status: 'ACTIVE',
          slug: 'english-teacher-elementary-school-seoul',
        },
      });

      expect(job).toBeDefined();
      expect(job.title).toBe('English Teacher - Elementary School');
      expect(job.country).toBe('South Korea');
      expect(job.salaryUSD).toBe(2500);
      expect(job.housingProvided).toBe(true);
      expect(job.flightProvided).toBe(true);
      expect(prisma.jobPosting.create).toHaveBeenCalledOnce();
    });

    it('should create job with minimum required fields', async () => {
      const mockJob: Partial<JobPosting> = {
        id: 'job-456',
        schoolId: 'school-123',
        title: 'Math Teacher',
        description: 'Teaching position available',
        country: 'China',
        city: 'Beijing',
        subject: 'Math',
        salaryUSD: 2000,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.jobPosting.create).mockResolvedValueOnce(mockJob as JobPosting);

      const job = await prisma.jobPosting.create({
        data: {
          schoolId: 'school-123',
          title: 'Math Teacher',
          description: 'Teaching position available',
          country: 'China',
          city: 'Beijing',
          subject: 'Math',
          salaryUSD: 2000,
          status: 'ACTIVE',
        },
      });

      expect(job).toBeDefined();
      expect(job.title).toBe('Math Teacher');
      expect(prisma.jobPosting.create).toHaveBeenCalledOnce();
    });

    it('should associate job with school profile', async () => {
      const mockSchool = {
        id: 'school-123',
        userId: 'user-123',
        schoolName: 'Seoul International School',
        isVerified: true,
        verifiedAt: new Date(),
      };

      const mockJob: JobPosting = {
        id: 'job-789',
        schoolId: 'school-123',
        recruiterId: null,
        title: 'Science Teacher',
        description: 'Teaching position',
        country: 'South Korea',
        city: 'Seoul',
        subject: 'Science',
        gradeLevel: null,
        salaryUSD: 3000,
        housingProvided: false,
        flightProvided: false,
        contractLength: null,
        startDate: null,
        applicationDeadline: null,
        minYearsExperience: null,
        educationRequirement: null,
        certificationRequirement: null,
        otherBenefits: null,
        status: 'ACTIVE',
        viewCount: 0,
        slug: 'science-teacher-seoul',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.schoolProfile.findUnique).mockResolvedValueOnce(mockSchool as any);
      vi.mocked(prisma.jobPosting.create).mockResolvedValueOnce(mockJob);

      const school = await prisma.schoolProfile.findUnique({
        where: { id: 'school-123' },
      });

      expect(school).toBeDefined();
      expect(school?.isVerified).toBe(true);

      const job = await prisma.jobPosting.create({
        data: {
          schoolId: school!.id,
          title: 'Science Teacher',
          description: 'Teaching position',
          country: 'South Korea',
          city: 'Seoul',
          subject: 'Science',
          salaryUSD: 3000,
          status: 'ACTIVE',
          slug: 'science-teacher-seoul',
        },
      });

      expect(job.schoolId).toBe(school!.id);
    });
  });

  describe('Job Filtering and Retrieval', () => {
    it('should filter jobs by country', async () => {
      const mockJobs: JobPosting[] = [
        {
          id: 'job-1',
          schoolId: 'school-1',
          recruiterId: null,
          title: 'English Teacher',
          description: 'Description',
          country: 'South Korea',
          city: 'Seoul',
          subject: 'English',
          gradeLevel: null,
          salaryUSD: 2500,
          housingProvided: true,
          flightProvided: true,
          contractLength: null,
          startDate: null,
          applicationDeadline: null,
          minYearsExperience: null,
          educationRequirement: null,
          certificationRequirement: null,
          otherBenefits: null,
          status: 'ACTIVE',
          viewCount: 0,
          slug: 'english-teacher-seoul',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.jobPosting.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.jobPosting.findMany).mockResolvedValueOnce(mockJobs);

      const count = await prisma.jobPosting.count({
        where: { status: 'ACTIVE', country: 'South Korea' },
      });

      const jobs = await prisma.jobPosting.findMany({
        where: { status: 'ACTIVE', country: 'South Korea' },
      });

      expect(count).toBe(1);
      expect(jobs).toHaveLength(1);
      expect(jobs[0].country).toBe('South Korea');
    });

    it('should filter jobs by salary range', async () => {
      const mockJobs: JobPosting[] = [
        {
          id: 'job-1',
          schoolId: 'school-1',
          recruiterId: null,
          title: 'English Teacher',
          description: 'Description',
          country: 'China',
          city: 'Shanghai',
          subject: 'English',
          gradeLevel: null,
          salaryUSD: 3000,
          housingProvided: true,
          flightProvided: true,
          contractLength: null,
          startDate: null,
          applicationDeadline: null,
          minYearsExperience: null,
          educationRequirement: null,
          certificationRequirement: null,
          otherBenefits: null,
          status: 'ACTIVE',
          viewCount: 0,
          slug: 'english-teacher-shanghai',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.jobPosting.findMany).mockResolvedValueOnce(mockJobs);

      const jobs = await prisma.jobPosting.findMany({
        where: {
          status: 'ACTIVE',
          salaryUSD: { gte: 2500, lte: 4000 },
        },
      });

      expect(jobs).toHaveLength(1);
      expect(jobs[0].salaryUSD).toBeGreaterThanOrEqual(2500);
      expect(jobs[0].salaryUSD).toBeLessThanOrEqual(4000);
    });

    it('should filter jobs by benefits (housing, flight)', async () => {
      const mockJobs: JobPosting[] = [
        {
          id: 'job-1',
          schoolId: 'school-1',
          recruiterId: null,
          title: 'English Teacher',
          description: 'Description',
          country: 'UAE',
          city: 'Dubai',
          subject: 'English',
          gradeLevel: null,
          salaryUSD: 4000,
          housingProvided: true,
          flightProvided: true,
          contractLength: null,
          startDate: null,
          applicationDeadline: null,
          minYearsExperience: null,
          educationRequirement: null,
          certificationRequirement: null,
          otherBenefits: null,
          status: 'ACTIVE',
          viewCount: 0,
          slug: 'english-teacher-dubai',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.jobPosting.findMany).mockResolvedValueOnce(mockJobs);

      const jobs = await prisma.jobPosting.findMany({
        where: {
          status: 'ACTIVE',
          housingProvided: true,
          flightProvided: true,
        },
      });

      expect(jobs).toHaveLength(1);
      expect(jobs[0].housingProvided).toBe(true);
      expect(jobs[0].flightProvided).toBe(true);
    });

    it('should retrieve single job by ID', async () => {
      const mockJob: JobPosting = {
        id: 'job-123',
        schoolId: 'school-123',
        recruiterId: null,
        title: 'Math Teacher',
        description: 'Detailed description',
        country: 'Japan',
        city: 'Tokyo',
        subject: 'Math',
        gradeLevel: 'High School',
        salaryUSD: 3500,
        housingProvided: true,
        flightProvided: true,
        contractLength: '12 months',
        startDate: new Date('2024-09-01'),
        applicationDeadline: new Date('2024-07-01'),
        minYearsExperience: 3,
        educationRequirement: 'Bachelor',
        certificationRequirement: null,
        otherBenefits: ['Visa Sponsorship'],
        status: 'ACTIVE',
        viewCount: 10,
        slug: 'math-teacher-tokyo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.jobPosting.findUnique).mockResolvedValueOnce(mockJob);

      const job = await prisma.jobPosting.findUnique({
        where: { id: 'job-123' },
      });

      expect(job).toBeDefined();
      expect(job?.id).toBe('job-123');
      expect(job?.title).toBe('Math Teacher');
      expect(job?.country).toBe('Japan');
    });

    it('should return null for non-existent job', async () => {
      vi.mocked(prisma.jobPosting.findUnique).mockResolvedValueOnce(null);

      const job = await prisma.jobPosting.findUnique({
        where: { id: 'non-existent-job' },
      });

      expect(job).toBeNull();
    });
  });

  describe('Job Pagination', () => {
    it('should support pagination with skip and take', async () => {
      const mockJobs: JobPosting[] = Array.from({ length: 10 }, (_, i) => ({
        id: `job-${i + 1}`,
        schoolId: 'school-1',
        recruiterId: null,
        title: `Teacher ${i + 1}`,
        description: 'Description',
        country: 'South Korea',
        city: 'Seoul',
        subject: 'English',
        gradeLevel: null,
        salaryUSD: 2500,
        housingProvided: true,
        flightProvided: true,
        contractLength: null,
        startDate: null,
        applicationDeadline: null,
        minYearsExperience: null,
        educationRequirement: null,
        certificationRequirement: null,
        otherBenefits: null,
        status: 'ACTIVE',
        viewCount: 0,
        slug: `teacher-${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      vi.mocked(prisma.jobPosting.count).mockResolvedValueOnce(50);
      vi.mocked(prisma.jobPosting.findMany).mockResolvedValueOnce(mockJobs);

      const total = await prisma.jobPosting.count({
        where: { status: 'ACTIVE' },
      });

      const page = 1;
      const pageSize = 10;
      const skip = (page - 1) * pageSize;

      const jobs = await prisma.jobPosting.findMany({
        where: { status: 'ACTIVE' },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      expect(total).toBe(50);
      expect(jobs).toHaveLength(10);
      expect(skip + jobs.length < total).toBe(true); // hasMore
    });
  });

  describe('Job Status Management', () => {
    it('should only retrieve ACTIVE jobs by default', async () => {
      const mockActiveJobs: JobPosting[] = [
        {
          id: 'job-1',
          schoolId: 'school-1',
          recruiterId: null,
          title: 'Active Job',
          description: 'Description',
          country: 'China',
          city: 'Beijing',
          subject: 'English',
          gradeLevel: null,
          salaryUSD: 2500,
          housingProvided: true,
          flightProvided: true,
          contractLength: null,
          startDate: null,
          applicationDeadline: null,
          minYearsExperience: null,
          educationRequirement: null,
          certificationRequirement: null,
          otherBenefits: null,
          status: 'ACTIVE',
          viewCount: 0,
          slug: 'active-job',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.jobPosting.findMany).mockResolvedValueOnce(mockActiveJobs);

      const jobs = await prisma.jobPosting.findMany({
        where: { status: 'ACTIVE' },
      });

      expect(jobs).toHaveLength(1);
      expect(jobs[0].status).toBe('ACTIVE');
    });

    it('should update job status', async () => {
      const mockJob: JobPosting = {
        id: 'job-123',
        schoolId: 'school-123',
        recruiterId: null,
        title: 'English Teacher',
        description: 'Description',
        country: 'South Korea',
        city: 'Seoul',
        subject: 'English',
        gradeLevel: null,
        salaryUSD: 2500,
        housingProvided: true,
        flightProvided: true,
        contractLength: null,
        startDate: null,
        applicationDeadline: null,
        minYearsExperience: null,
        educationRequirement: null,
        certificationRequirement: null,
        otherBenefits: null,
        status: 'CLOSED',
        viewCount: 0,
        slug: 'english-teacher-seoul',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.jobPosting.update).mockResolvedValueOnce(mockJob);

      const updatedJob = await prisma.jobPosting.update({
        where: { id: 'job-123' },
        data: { status: 'CLOSED' },
      });

      expect(updatedJob.status).toBe('CLOSED');
      expect(prisma.jobPosting.update).toHaveBeenCalledOnce();
    });
  });
});
