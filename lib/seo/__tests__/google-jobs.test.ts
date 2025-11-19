/**
 * Tests for Google for Jobs Schema generation
 */

import { describe, it, expect } from 'vitest';
import type { JobPosting } from '@prisma/client';
import {
  generateGoogleJobSchema,
  generateGoogleJobSchemaScript,
  isEligibleForGoogleJobs,
} from '../google-jobs';
import {
  validateGoogleJobSchema,
  formatGoogleJobDate,
  getDefaultExpirationDate,
  getCountryCode,
} from '@/lib/types/google-jobs';

// Mock job posting
const mockJob: JobPosting = {
  id: 'job123',
  createdAt: new Date('2025-01-20T10:00:00Z'),
  updatedAt: new Date('2025-01-20T10:00:00Z'),
  title: 'ESL Teacher',
  description: 'Teach English to elementary students in a modern international school environment.',
  subject: 'English',
  country: 'South Korea',
  city: 'Seoul',
  schoolId: 'school123',
  recruiterId: null,
  schoolName: 'Seoul International School',
  isAnonymous: false,
  hiddenOrgName: null,
  minYearsExperience: 2,
  requiredSubjects: ['English', 'ESL'],
  requirements: 'Bachelor degree in Education or related field. Native English speaker preferred.',
  salaryUSD: 2500,
  currency: 'USD',
  benefits: 'Health insurance, professional development opportunities',
  housingProvided: true,
  flightProvided: true,
  contractLength: 12,
  startDate: new Date('2025-03-01T00:00:00Z'),
  expiresAt: new Date('2025-02-20T00:00:00Z'),
  employmentType: 'FULL_TIME',
  educationRequirements: "Bachelor's degree in Education, TESOL, or related field",
  experienceRequirements: 'Minimum 2 years of teaching experience with elementary students',
  applicationUrl: null,
  embedding: null,
  matchNotificationsSent: 0,
  lastMatchedAt: null,
  status: 'ACTIVE',
};

describe('Google for Jobs Schema Generation', () => {
  describe('generateGoogleJobSchema', () => {
    it('should generate valid schema for complete job posting', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('JobPosting');
      expect(schema.title).toBe('ESL Teacher');
      expect(schema.description).toContain('Teach English');
      expect(schema.datePosted).toBeDefined();
      expect(schema.validThrough).toBeDefined();
      expect(schema.employmentType).toBe('FULL_TIME');
    });

    it('should include hiring organization', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema.hiringOrganization).toBeDefined();
      expect(schema.hiringOrganization.name).toBe('Seoul International School');
      expect(schema.hiringOrganization['@type']).toBe('Organization');
    });

    it('should include job location with ISO country code', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema.jobLocation).toBeDefined();
      expect(schema.jobLocation.address.addressLocality).toBe('Seoul');
      expect(schema.jobLocation.address.addressCountry).toBe('KR'); // ISO code
    });

    it('should include salary information', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema.baseSalary).toBeDefined();
      expect(schema.baseSalary?.currency).toBe('USD');
      expect(schema.baseSalary?.value.value).toBe(2500);
      expect(schema.baseSalary?.value.unitText).toBe('MONTH');
    });

    it('should include education requirements', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema.educationRequirements).toBe("Bachelor's degree in Education, TESOL, or related field");
    });

    it('should include experience requirements', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema.experienceRequirements).toBe('Minimum 2 years of teaching experience with elementary students');
    });

    it('should convert minYearsExperience to experience object when experienceRequirements not provided', () => {
      const jobWithoutExpReqs = { ...mockJob, experienceRequirements: null };
      const schema = generateGoogleJobSchema(jobWithoutExpReqs);

      expect(schema.experienceRequirements).toEqual({
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: 24, // 2 years * 12 months
      });
    });

    it('should include benefits from multiple sources', () => {
      const schema = generateGoogleJobSchema(mockJob);

      expect(schema.benefits).toBeDefined();
      expect(schema.benefits).toContain('Housing provided');
      expect(schema.benefits).toContain('Flight tickets provided');
    });

    it('should handle jobs without explicit benefits', () => {
      const jobWithoutBenefits = {
        ...mockJob,
        benefits: null,
        housingProvided: false,
        flightProvided: false,
      };
      const schema = generateGoogleJobSchema(jobWithoutBenefits);

      expect(schema.benefits).toBeUndefined();
    });

    it('should use default expiration date when not provided', () => {
      const jobWithoutExpiry = { ...mockJob, expiresAt: null };
      const schema = generateGoogleJobSchema(jobWithoutExpiry);

      expect(schema.validThrough).toBeDefined();

      // Should be ~30 days from creation date
      const expiryDate = new Date(schema.validThrough!);
      const expectedDate = getDefaultExpirationDate(mockJob.createdAt);
      expect(Math.abs(expiryDate.getTime() - expectedDate.getTime())).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('validateGoogleJobSchema', () => {
    it('should validate correct schema', () => {
      const schema = generateGoogleJobSchema(mockJob);
      const validation = validateGoogleJobSchema(schema);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const schema = generateGoogleJobSchema(mockJob);
      // @ts-expect-error - Testing invalid schema
      schema.title = '';

      const validation = validateGoogleJobSchema(schema);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
    });

    it('should detect expired validThrough date', () => {
      const expiredJob = {
        ...mockJob,
        expiresAt: new Date('2020-01-01T00:00:00Z'), // Past date
      };
      const schema = generateGoogleJobSchema(expiredJob);
      const validation = validateGoogleJobSchema(schema);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('validThrough should be in the future');
    });
  });

  describe('isEligibleForGoogleJobs', () => {
    it('should mark active jobs as eligible', () => {
      expect(isEligibleForGoogleJobs(mockJob)).toBe(true);
    });

    it('should mark inactive jobs as ineligible', () => {
      const inactiveJob = { ...mockJob, status: 'CLOSED' };
      expect(isEligibleForGoogleJobs(inactiveJob)).toBe(false);
    });

    it('should mark jobs with missing fields as ineligible', () => {
      const incompleteJob = { ...mockJob, city: '' };
      expect(isEligibleForGoogleJobs(incompleteJob)).toBe(false);
    });

    it('should mark expired jobs as ineligible', () => {
      const expiredJob = {
        ...mockJob,
        expiresAt: new Date('2020-01-01T00:00:00Z'),
      };
      expect(isEligibleForGoogleJobs(expiredJob)).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should format dates to ISO 8601', () => {
      const date = new Date('2025-01-20T10:30:00Z');
      const formatted = formatGoogleJobDate(date);

      expect(formatted).toBe('2025-01-20T10:30:00.000Z');
    });

    it('should calculate default expiration date (30 days)', () => {
      const startDate = new Date('2025-01-20T00:00:00Z');
      const expiryDate = getDefaultExpirationDate(startDate);
      const expectedDate = new Date('2025-02-19T00:00:00Z');

      expect(expiryDate.getTime()).toBe(expectedDate.getTime());
    });

    it('should map country names to ISO codes', () => {
      expect(getCountryCode('South Korea')).toBe('KR');
      expect(getCountryCode('Korea')).toBe('KR');
      expect(getCountryCode('China')).toBe('CN');
      expect(getCountryCode('UAE')).toBe('AE');
      expect(getCountryCode('Japan')).toBe('JP');
      expect(getCountryCode('Unknown Country')).toBe('Unknown Country'); // Fallback
    });
  });

  describe('generateGoogleJobSchemaScript', () => {
    it('should generate valid JSON-LD string', () => {
      const script = generateGoogleJobSchemaScript(mockJob);
      const parsed = JSON.parse(script);

      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('JobPosting');
      expect(parsed.title).toBe('ESL Teacher');
    });

    it('should throw error in development for invalid schema', () => {
      const invalidJob = { ...mockJob, title: '', status: 'ACTIVE' };

      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      expect(() => {
        generateGoogleJobSchemaScript(invalidJob);
      }).toThrow('Invalid Google Jobs Schema');

      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });
});
