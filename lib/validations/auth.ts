import { z } from 'zod';

/**
 * Password validation schema
 * Following best practices: minimum length, no complexity requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

/**
 * Signup schema - Phase 1: Minimal required fields
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  role: z.enum(['TEACHER', 'SCHOOL', 'RECRUITER'], {
    required_error: 'Please select your role',
  }),
  terms: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the Terms and Privacy Policy',
    }),
  }),
  marketing: z.boolean().optional().default(false),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Type exports
 */
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Password strength calculator
 * Returns: 'weak' | 'medium' | 'strong'
 */
export function calculatePasswordStrength(password: string): {
  score: 'weak' | 'medium' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;

  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  // Feedback
  if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Include a number for better security');
  }
  if (password.length < 12) {
    feedback.push('Longer passwords are more secure');
  }

  // Score
  if (strength <= 3) {
    return { score: 'weak', feedback };
  } else if (strength <= 5) {
    return { score: 'medium', feedback };
  } else {
    return { score: 'strong', feedback };
  }
}
