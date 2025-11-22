import { describe, it, expect } from 'vitest';
import { emailSchema, passwordSchema, signupSchema, calculatePasswordStrength } from '../auth';

describe('Email Validation & Normalization', () => {
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'admin@test.org',
        'teacher123@school.edu',
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should normalize email to lowercase', () => {
      const testCases = [
        { input: 'John@Example.COM', expected: 'john@example.com' },
        { input: 'ADMIN@SITE.COM', expected: 'admin@site.com' },
        { input: 'User@Test.Org', expected: 'user@test.org' },
        { input: 'MixedCase@Email.COM', expected: 'mixedcase@email.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = emailSchema.parse(input);
        expect(result).toBe(expected);
      });
    });

    it('should trim whitespace from email', () => {
      const testCases = [
        { input: '  user@test.com  ', expected: 'user@test.com' },
        { input: 'admin@site.com  ', expected: 'admin@site.com' },
        { input: '  teacher@school.edu', expected: 'teacher@school.edu' },
        { input: '   spaces@everywhere.com   ', expected: 'spaces@everywhere.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = emailSchema.parse(input);
        expect(result).toBe(expected);
      });
    });

    it('should normalize both case and whitespace', () => {
      const testCases = [
        { input: '  John@Example.COM  ', expected: 'john@example.com' },
        { input: ' ADMIN@SITE.COM ', expected: 'admin@site.com' },
        { input: '  User@Test.Org  ', expected: 'user@test.org' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = emailSchema.parse(input);
        expect(result).toBe(expected);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        '',
        '   ',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should prevent duplicate emails with different casing', () => {
      // This test demonstrates that these all normalize to the same value
      const variants = [
        'user@example.com',
        'User@example.com',
        'USER@EXAMPLE.COM',
        'user@EXAMPLE.com',
        'UsEr@ExAmPlE.cOm',
      ];

      const normalized = variants.map((email) => emailSchema.parse(email));
      const uniqueValues = new Set(normalized);

      // All variants should normalize to the same email
      expect(uniqueValues.size).toBe(1);
      expect(uniqueValues.has('user@example.com')).toBe(true);
    });
  });

  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'password123',
        'MySecureP@ss',
        'LongPassword1234567890',
        'Test!@#$1234',
      ];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const shortPasswords = ['short', '1234567', 'test', ''];

      shortPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 8 characters');
        }
      });
    });

    it('should reject passwords longer than 100 characters', () => {
      const longPassword = 'a'.repeat(101);
      const result = passwordSchema.safeParse(longPassword);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 100 characters');
      }
    });

    it('should accept passwords exactly 8 characters', () => {
      const result = passwordSchema.safeParse('12345678');
      expect(result.success).toBe(true);
    });

    it('should accept passwords exactly 100 characters', () => {
      const password = 'a'.repeat(100);
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(true);
    });
  });

  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const validSignup = {
        email: 'teacher@school.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'TEACHER' as const,
        terms: true,
        marketing: false,
      };

      const result = signupSchema.safeParse(validSignup);
      expect(result.success).toBe(true);
    });

    it('should normalize email in signup data', () => {
      const signupData = {
        email: '  John@Example.COM  ',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'TEACHER' as const,
        terms: true,
      };

      const result = signupSchema.parse(signupData);
      expect(result.email).toBe('john@example.com');
    });

    it('should trim first and last names', () => {
      const signupData = {
        email: 'user@test.com',
        password: 'SecurePass123',
        firstName: '  John  ',
        lastName: '  Smith  ',
        role: 'TEACHER' as const,
        terms: true,
      };

      const result = signupSchema.parse(signupData);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Smith');
    });

    it('should require terms acceptance', () => {
      const signupData = {
        email: 'user@test.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'TEACHER' as const,
        terms: false, // Not accepted
      };

      const result = signupSchema.safeParse(signupData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid roles', () => {
      const roles = ['TEACHER', 'SCHOOL', 'RECRUITER'] as const;

      roles.forEach((role) => {
        const signupData = {
          email: 'user@test.com',
          password: 'SecurePass123',
          firstName: 'John',
          lastName: 'Smith',
          role,
          terms: true,
        };

        const result = signupSchema.safeParse(signupData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid roles', () => {
      const signupData = {
        email: 'user@test.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'INVALID_ROLE',
        terms: true,
      };

      const result = signupSchema.safeParse(signupData);
      expect(result.success).toBe(false);
    });

    it('should default marketing to false', () => {
      const signupData = {
        email: 'user@test.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'TEACHER' as const,
        terms: true,
        // marketing not provided
      };

      const result = signupSchema.parse(signupData);
      expect(result.marketing).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should rate short simple passwords as weak', () => {
      const result = calculatePasswordStrength('password');
      expect(result.score).toBe('weak');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should rate medium complexity passwords as medium', () => {
      const result = calculatePasswordStrength('Password123');
      expect(result.score).toBe('medium');
    });

    it('should rate complex long passwords as strong', () => {
      const result = calculatePasswordStrength('MyVerySecureP@ssw0rd2024!');
      expect(result.score).toBe('strong');
    });

    it('should provide feedback for weak passwords', () => {
      const result = calculatePasswordStrength('test');
      expect(result.feedback).toContain('Use at least 8 characters');
    });

    it('should suggest adding numbers', () => {
      const result = calculatePasswordStrength('testpassword');
      expect(result.feedback.some((f) => f.includes('number'))).toBe(true);
    });

    it('should suggest longer passwords for medium strength', () => {
      const result = calculatePasswordStrength('Pass123!');
      expect(result.feedback.some((f) => f.includes('Longer'))).toBe(true);
    });

    it('should have minimal feedback for strong passwords', () => {
      const result = calculatePasswordStrength('MySecurePassword123!@#');
      expect(result.score).toBe('strong');
      expect(result.feedback.length).toBeLessThanOrEqual(1);
    });
  });
});

/**
 * Additional test cases for duplication prevention
 *
 * These tests verify that the email normalization prevents common
 * duplication attempts that users might try (intentionally or not).
 */
describe('Duplication Prevention', () => {
  describe('Email Variations', () => {
    it('should treat all case variations as the same email', () => {
      const baseEmail = 'john.doe@example.com';
      const variations = [
        'john.doe@example.com',
        'John.Doe@example.com',
        'JOHN.DOE@EXAMPLE.COM',
        'john.doe@EXAMPLE.COM',
        'John.Doe@Example.Com',
        'JOHN.doe@example.COM',
      ];

      const normalized = variations.map((email) => emailSchema.parse(email));

      // All should normalize to lowercase
      normalized.forEach((email) => {
        expect(email).toBe(baseEmail);
      });

      // Verify uniqueness
      const uniqueEmails = new Set(normalized);
      expect(uniqueEmails.size).toBe(1);
    });

    it('should treat emails with whitespace as the same', () => {
      const variations = [
        'user@test.com',
        ' user@test.com',
        'user@test.com ',
        '  user@test.com  ',
        '\tuser@test.com\t',
      ];

      const normalized = variations.map((email) => emailSchema.parse(email));

      normalized.forEach((email) => {
        expect(email).toBe('user@test.com');
      });
    });

    it('should handle complex real-world scenarios', () => {
      // Common user mistakes
      const scenarios = [
        { input: '  Admin@Company.COM  ', expected: 'admin@company.com' },
        { input: 'Teacher@School.EDU', expected: 'teacher@school.edu' },
        { input: ' recruiter@agency.CO.UK ', expected: 'recruiter@agency.co.uk' },
      ];

      scenarios.forEach(({ input, expected }) => {
        const result = emailSchema.parse(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Database Constraint Simulation', () => {
    it('should demonstrate that normalized emails prevent duplicates', () => {
      // Simulates what would happen at the database level
      const registeredEmails = new Set<string>();

      // First registration
      const email1 = emailSchema.parse('john@example.com');
      registeredEmails.add(email1);

      // Attempted duplicates with different casing
      const attemptedDuplicates = [
        'John@example.com',
        'JOHN@EXAMPLE.COM',
        '  john@example.com  ',
        'john@EXAMPLE.com',
      ];

      attemptedDuplicates.forEach((attempt) => {
        const normalized = emailSchema.parse(attempt);

        // Check if email already exists (simulating database check)
        const isDuplicate = registeredEmails.has(normalized);

        // All attempts should be detected as duplicates
        expect(isDuplicate).toBe(true);
        expect(normalized).toBe('john@example.com');
      });

      // Verify set still has only 1 unique email
      expect(registeredEmails.size).toBe(1);
    });
  });
});
