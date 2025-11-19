import { z } from 'zod';

// Teacher Profile Form Schema
export const teacherProfileSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  bio: z.string().max(2000, 'Bio must be less than 2000 characters').optional(),

  // Location
  currentCountry: z.string().min(1, 'Current country is required'),
  preferredCountries: z.array(z.string()).min(1, 'Select at least one preferred country'),

  // Experience & Education
  yearsExperience: z.coerce.number().int().min(0, 'Years of experience must be 0 or more').max(50),
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
  degreeLevel: z.enum(['BA', 'BS', 'MA', 'MS', 'MEd', 'PhD'], {
    required_error: 'Degree level is required',
  }),
  degreeMajor: z.string().min(1, 'Major is required').max(100),
  certifications: z.array(z.string()).default([]),
  hasTeachingLicense: z.boolean().default(false),
  hasTEFL: z.boolean().default(false),

  // Visa & Legal
  citizenship: z.string().min(1, 'Citizenship is required'),
  criminalRecord: z.enum(['clean', 'minor', 'felony']).default('clean'),
  hasApostille: z.boolean().default(false),
  hasHealthCertificate: z.boolean().default(false),
  age: z.coerce.number().int().min(18, 'Must be 18 or older').max(100).optional(),

  // Preferences
  minSalaryUSD: z.coerce.number().int().min(0).max(20000).optional(),
  maxSalaryUSD: z.coerce.number().int().min(0).max(20000).optional(),
  availableFrom: z.date().optional(),
}).refine(
  (data) => {
    if (data.minSalaryUSD && data.maxSalaryUSD) {
      return data.minSalaryUSD <= data.maxSalaryUSD;
    }
    return true;
  },
  {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['maxSalaryUSD'],
  }
);

export type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;

// Subject options
export const SUBJECT_OPTIONS = [
  'English',
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education',
  'ESL/EFL',
  'Computer Science',
  'Business',
  'Economics',
  'Special Education',
  'Early Childhood',
  'Other',
] as const;

// Country options (frequently hired)
export const COUNTRY_OPTIONS = [
  'South Korea',
  'China',
  'Japan',
  'Taiwan',
  'Vietnam',
  'Thailand',
  'UAE',
  'Saudi Arabia',
  'Qatar',
  'Singapore',
  'Malaysia',
  'Spain',
  'Mexico',
  'Brazil',
  'Other',
] as const;

// Citizenship options (for E-2 visa eligibility)
export const CITIZENSHIP_OPTIONS = [
  'US',
  'UK',
  'CA',
  'AU',
  'NZ',
  'IE',
  'ZA',
  'Other',
] as const;

// Certification options
export const CERTIFICATION_OPTIONS = [
  'TEFL',
  'TESOL',
  'CELTA',
  'DELTA',
  'State Teaching License',
  'PGCE',
  'IB Certificate',
  'Montessori',
  'None',
] as const;
