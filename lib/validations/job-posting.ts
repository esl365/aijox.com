import { z } from 'zod';

// Job Posting Form Schema
export const jobPostingSchema = z.object({
  // Basic Information
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  subject: z.string().min(1, 'Subject is required'),

  // Location
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),

  // School Information
  schoolName: z.string().min(1, 'School name is required').max(200),
  isAnonymous: z.boolean().default(false),
  hiddenOrgName: z.string().optional(),

  // Requirements
  minYearsExperience: z.coerce.number().int().min(0).max(30).optional(),
  requiredSubjects: z.array(z.string()).default([]),
  requirements: z.string().max(2000).optional(),

  // Compensation
  salaryUSD: z.coerce.number().int().min(500, 'Minimum salary is $500').max(20000, 'Maximum salary is $20,000'),
  currency: z.string().default('USD'),
  benefits: z.string().max(2000).optional(),
  housingProvided: z.boolean().default(false),
  flightProvided: z.boolean().default(false),

  // Contract Details
  contractLength: z.coerce.number().int().min(1).max(36).optional(), // months
  startDate: z.date().optional(),

  // Status
  status: z.enum(['ACTIVE', 'CLOSED', 'FILLED']).default('ACTIVE'),
});

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;

// School Type Options
export const SCHOOL_TYPE_OPTIONS = [
  'International School',
  'Public School',
  'Private School',
  'Language Center',
  'University',
  'Online School',
  'Bilingual School',
  'Other',
] as const;

// Benefits Options
export const BENEFITS_OPTIONS = [
  'Housing',
  'Flight Allowance',
  'Health Insurance',
  'Visa Sponsorship',
  'Professional Development',
  'Paid Vacation',
  'End of Contract Bonus',
  'Relocation Allowance',
  'Tuition Discount',
  'Retirement Plan',
] as const;

// Contract Length Options (in months)
export const CONTRACT_LENGTH_OPTIONS = [
  { value: 12, label: '1 Year' },
  { value: 24, label: '2 Years' },
  { value: 36, label: '3 Years' },
  { value: 6, label: '6 Months' },
  { value: 3, label: '3 Months (Short-term)' },
] as const;

// Currency Options
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)', rate: 1 },
  { value: 'KRW', label: 'KRW (₩)', rate: 1300 },
  { value: 'CNY', label: 'CNY (¥)', rate: 7 },
  { value: 'AED', label: 'AED (د.إ)', rate: 3.67 },
  { value: 'THB', label: 'THB (฿)', rate: 33 },
  { value: 'VND', label: 'VND (₫)', rate: 24000 },
  { value: 'JPY', label: 'JPY (¥)', rate: 110 },
  { value: 'TWD', label: 'TWD (NT$)', rate: 28 },
  { value: 'SGD', label: 'SGD (S$)', rate: 1.35 },
  { value: 'SAR', label: 'SAR (﷼)', rate: 3.75 },
] as const;

// Helper function to convert to USD
export function convertToUSD(amount: number, currency: string): number {
  const currencyData = CURRENCY_OPTIONS.find(c => c.value === currency);
  if (!currencyData) return amount;
  return Math.round(amount / currencyData.rate);
}

// Helper function to convert from USD
export function convertFromUSD(amountUSD: number, currency: string): number {
  const currencyData = CURRENCY_OPTIONS.find(c => c.value === currency);
  if (!currencyData) return amountUSD;
  return Math.round(amountUSD * currencyData.rate);
}
