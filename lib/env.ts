/**
 * Environment Variable Validation
 *
 * CRITICAL: Validates all required environment variables at startup
 * Prevents runtime errors due to missing/invalid configuration
 */

import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),

  // Auth.js
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters')
    .describe('Generate with: openssl rand -base64 32'),

  // AI APIs
  OPENAI_API_KEY: z
    .string()
    .startsWith('sk-', 'OPENAI_API_KEY must start with sk-')
    .min(20, 'OPENAI_API_KEY appears invalid'),
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with sk-ant-')
    .min(20, 'ANTHROPIC_API_KEY appears invalid'),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_BUCKET_NAME: z.string().default('aijox-videos'),

  // UploadThing
  UPLOADTHING_SECRET: z
    .string()
    .min(20, 'UPLOADTHING_SECRET is required')
    .optional(), // Optional for now

  // Resend (Email)
  RESEND_API_KEY: z
    .string()
    .startsWith('re_', 'RESEND_API_KEY must start with re_')
    .optional(), // Optional if email features not enabled

  // App Config
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Feature Flags (optional)
  NEXT_PUBLIC_ENABLE_VIDEO_RESUME: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_AI_MATCHING: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_ANONYMOUS_JOBS: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
})

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables
 * @throws ZodError if any required variables are missing or invalid
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.format())

    // Provide helpful error message
    const missingVars = Object.keys(parsed.error.format()).filter(
      (key) => key !== '_errors'
    )

    throw new Error(
      `Missing or invalid environment variables: ${missingVars.join(', ')}\n\n` +
      'Please check your .env.local file.\n' +
      'Refer to .env.example for required variables.'
    )
  }

  return parsed.data
}

// Export validated environment variables
export const env = validateEnv()

/**
 * Helper function to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Helper function to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Log environment status (safe - no secrets)
 */
if (isDevelopment) {
  console.log('🔧 Environment Configuration:')
  console.log('  NODE_ENV:', env.NODE_ENV)
  console.log('  NEXTAUTH_URL:', env.NEXTAUTH_URL)
  console.log('  Database:', env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured')
  console.log('  OpenAI:', env.OPENAI_API_KEY ? '✅ configured' : '❌ missing')
  console.log('  Anthropic:', env.ANTHROPIC_API_KEY ? '✅ configured' : '❌ missing')
  console.log('  R2 Storage:', env.R2_ACCOUNT_ID ? '✅ configured' : '❌ missing')
  console.log('')
}
