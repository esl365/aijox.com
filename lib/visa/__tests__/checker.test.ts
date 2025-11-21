import { describe, it, expect } from 'vitest';
import { checkVisaEligibility, checkAllCountries, getEligibleCountries } from '../checker';
import type { TeacherProfile } from '@prisma/client';

describe('visa-checker', () => {
  const validSouthKoreaCandidate = {
    citizenship: 'United States',
    nativeSpeaker: true,
    degree: 'Bachelor',
    degreeField: 'Education',
    university: 'Example University',
    yearsExperience: 3,
    teachingCountries: ['China'],
    certifications: ['TEFL'],
    age: 28,
    criminalRecord: false,
  };

  describe('checkVisaEligibility', () => {
    it('Should return eligible for valid South Korea E-2 candidate', () => {
      const result = checkVisaEligibility('South Korea', validSouthKoreaCandidate);

      expect(result.eligible).toBe(true);
      expect(result.visaType).toBe('E-2');
      expect(result.confidence).toBeGreaterThanOrEqual(90);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('Should reject non-native speaker for South Korea', () => {
      const nonNative: TeacherVisaData = {
        ...validSouthKoreaCandidate,
        nativeSpeaker: false,
        citizenship: 'Philippines',
      };

      const result = checkVisaEligibility('South Korea', nonNative);

      expect(result.eligible).toBe(false);
      expect(result.confidence).toBeLessThan(30);
      expect(result.failedRequirements.length).toBeGreaterThan(0);
      expect(result.failedRequirements.some(r => r.includes('native speaker'))).toBe(true);
    });

    it('Should reject candidate without degree', () => {
      const noDegree = {
        ...validSouthKoreaCandidate,
        degree: null as any,
      };

      const result = checkVisaEligibility(noDegree, 'South Korea');

      expect(result.eligible).toBe(false);
      expect(result.failedRequirements.some(r => r.message.toLowerCase().includes('degree') || r.message.toLowerCase().includes('bachelor'))).toBe(true);
    });

    it('Should reject candidate with criminal record', () => {
      const withRecord: TeacherVisaData = {
        ...validSouthKoreaCandidate,
        criminalRecord: true,
      };

      const result = checkVisaEligibility('South Korea', withRecord);

      expect(result.eligible).toBe(false);
      expect(result.failedRequirements.some(r => r.toLowerCase().includes('criminal'))).toBe(true);
    });

    it('Should return confidence 95 for eligible', () => {
      const result = checkVisaEligibility('South Korea', validSouthKoreaCandidate);

      expect(result.eligible).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(90);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('Should return confidence 10 for disqualified', () => {
      const disqualified: TeacherVisaData = {
        ...validSouthKoreaCandidate,
        criminalRecord: true,
        nativeSpeaker: false,
      };

      const result = checkVisaEligibility('South Korea', disqualified);

      expect(result.eligible).toBe(false);
      expect(result.confidence).toBeLessThanOrEqual(20);
    });

    it('Should return confidence 30 for missing critical requirements', () => {
      const missingRequirements: TeacherVisaData = {
        ...validSouthKoreaCandidate,
        education: {
          degree: null as any,
          field: 'Education',
          university: 'Example University',
        },
      };

      const result = checkVisaEligibility('South Korea', missingRequirements);

      expect(result.eligible).toBe(false);
      expect(result.confidence).toBeLessThan(50);
    });

    it('Should sort failed requirements by priority', () => {
      const candidate: TeacherVisaData = {
        ...validSouthKoreaCandidate,
        nativeSpeaker: false,
        education: {
          degree: null as any,
          field: 'Education',
          university: 'Example University',
        },
      };

      const result = checkVisaEligibility('South Korea', candidate);

      expect(result.eligible).toBe(false);
      expect(result.failedRequirements.length).toBeGreaterThan(0);
    });

    it('Should handle unknown country gracefully', () => {
      const result = checkVisaEligibility('Unknown Country', validSouthKoreaCandidate);

      expect(result.eligible).toBe(false);
      expect(result.visaType).toBe('Unknown');
      expect(result.failedRequirements.some(r => r.includes('not found') || r.includes('Unknown'))).toBe(true);
    });
  });

  describe('evaluateCondition', () => {
    it('Should evaluate "eq" operator correctly', () => {
      expect(evaluateCondition('Bachelor', 'eq', 'Bachelor')).toBe(true);
      expect(evaluateCondition('Bachelor', 'eq', 'Master')).toBe(false);
    });

    it('Should evaluate "gte" operator correctly', () => {
      expect(evaluateCondition(3, 'gte', 2)).toBe(true);
      expect(evaluateCondition(2, 'gte', 2)).toBe(true);
      expect(evaluateCondition(1, 'gte', 2)).toBe(false);
    });

    it('Should evaluate "lte" operator correctly', () => {
      expect(evaluateCondition(25, 'lte', 60)).toBe(true);
      expect(evaluateCondition(60, 'lte', 60)).toBe(true);
      expect(evaluateCondition(65, 'lte', 60)).toBe(false);
    });

    it('Should evaluate "in" operator correctly', () => {
      expect(evaluateCondition('United States', 'in', ['United States', 'Canada', 'UK'])).toBe(true);
      expect(evaluateCondition('Philippines', 'in', ['United States', 'Canada', 'UK'])).toBe(false);
    });

    it('Should evaluate "notIn" operator correctly', () => {
      expect(evaluateCondition('Philippines', 'notIn', ['Iran', 'North Korea'])).toBe(true);
      expect(evaluateCondition('Iran', 'notIn', ['Iran', 'North Korea'])).toBe(false);
    });

    it('Should evaluate "includes" operator correctly', () => {
      expect(evaluateCondition(['TEFL', 'CELTA'], 'includes', 'TEFL')).toBe(true);
      expect(evaluateCondition(['CELTA'], 'includes', 'TEFL')).toBe(false);
    });

    it('Should return false for null values', () => {
      expect(evaluateCondition(null, 'eq', 'Bachelor')).toBe(false);
      expect(evaluateCondition(null, 'gte', 2)).toBe(false);
      expect(evaluateCondition(null, 'in', ['US', 'UK'])).toBe(false);
    });
  });

  describe('getNestedValue', () => {
    const data = {
      education: {
        degree: 'Bachelor',
        field: 'Education',
      },
      experience: {
        yearsTeaching: 3,
      },
      certifications: ['TEFL', 'CELTA'],
      age: 28,
    };

    it('Should retrieve top-level property', () => {
      expect(getNestedValue(data, 'age')).toBe(28);
    });

    it('Should retrieve nested property (dot notation)', () => {
      expect(getNestedValue(data, 'education.degree')).toBe('Bachelor');
      expect(getNestedValue(data, 'experience.yearsTeaching')).toBe(3);
    });

    it('Should return null for non-existent path', () => {
      expect(getNestedValue(data, 'nonexistent')).toBeNull();
      expect(getNestedValue(data, 'education.nonexistent')).toBeNull();
    });

    it('Should handle arrays', () => {
      expect(getNestedValue(data, 'certifications')).toEqual(['TEFL', 'CELTA']);
    });
  });

  describe('checkAllCountries', () => {
    it('Should check all 10 countries', () => {
      const results = checkAllCountries(validSouthKoreaCandidate);

      expect(Object.keys(results).length).toBeGreaterThanOrEqual(10);
    });

    it('Should return object with country keys', () => {
      const results = checkAllCountries(validSouthKoreaCandidate);

      expect(results).toHaveProperty('South Korea');
      expect(results).toHaveProperty('China');
      expect(results).toHaveProperty('UAE');
    });

    it('Should include visa type for each country', () => {
      const results = checkAllCountries(validSouthKoreaCandidate);

      Object.values(results).forEach(result => {
        expect(result).toHaveProperty('visaType');
        expect(result).toHaveProperty('eligible');
        expect(result).toHaveProperty('confidence');
      });
    });
  });

  describe('getEligibleCountries', () => {
    it('Should return only countries where eligible', () => {
      const results = getEligibleCountries(validSouthKoreaCandidate);

      results.forEach(country => {
        expect(checkVisaEligibility(country, validSouthKoreaCandidate).eligible).toBe(true);
      });
    });

    it('Should return empty array if eligible nowhere', () => {
      const ineligibleCandidate: TeacherVisaData = {
        citizenship: 'Iran',
        nativeSpeaker: false,
        education: {
          degree: null as any,
          field: '',
          university: '',
        },
        experience: {
          yearsTeaching: 0,
          previousCountries: [],
        },
        certifications: [],
        age: 70,
        criminalRecord: true,
      };

      const results = getEligibleCountries(ineligibleCandidate);

      expect(results).toHaveLength(0);
    });

    it('Should return all countries if eligible everywhere', () => {
      const results = getEligibleCountries(validSouthKoreaCandidate);

      expect(results.length).toBeGreaterThan(0);
    });
  });
});
