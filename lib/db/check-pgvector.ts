/**
 * pgvector Extension Verification
 *
 * CRITICAL: Ensures pgvector extension is installed before running vector queries
 * Prevents runtime errors in production
 */

import { prisma } from './prisma'

/**
 * Check if pgvector extension is installed and working
 * @throws Error if pgvector is not installed
 */
export async function ensurePgvectorInstalled(): Promise<boolean> {
  try {
    // Test basic vector type creation
    await prisma.$queryRaw`SELECT '1'::vector;`
    console.log('✅ pgvector extension verified')
    return true
  } catch (error: any) {
    console.error('❌ pgvector extension not installed!')
    console.error('Error:', error.message)

    throw new Error(
      'Database is missing pgvector extension. ' +
      'Please run the following SQL command:\n\n' +
      'CREATE EXTENSION IF NOT EXISTS vector;\n\n' +
      'Then restart the application.'
    )
  }
}

/**
 * Check if vector indexes exist for performance
 * @returns Object with index status for TeacherProfile and JobPosting
 */
export async function checkVectorIndexes(): Promise<{
  teacherIndex: boolean
  jobIndex: boolean
}> {
  try {
    // Query pg_indexes to check if ivfflat or hnsw indexes exist
    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND (
          indexname LIKE '%embedding%'
          OR indexname LIKE '%vector%'
        );
    `

    const teacherIndex = indexes.some(
      idx => idx.indexname.includes('teacher') && idx.indexname.includes('embedding')
    )
    const jobIndex = indexes.some(
      idx => idx.indexname.includes('job') && idx.indexname.includes('embedding')
    )

    if (!teacherIndex) {
      console.warn('⚠️ Missing vector index on TeacherProfile.embedding')
      console.warn('Performance may be degraded. Consider running:')
      console.warn('CREATE INDEX idx_teacher_embedding ON "TeacherProfile" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);')
    }

    if (!jobIndex) {
      console.warn('⚠️ Missing vector index on JobPosting.embedding')
      console.warn('Performance may be degraded. Consider running:')
      console.warn('CREATE INDEX idx_job_embedding ON "JobPosting" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);')
    }

    return { teacherIndex, jobIndex }
  } catch (error) {
    console.error('Failed to check vector indexes:', error)
    return { teacherIndex: false, jobIndex: false }
  }
}

/**
 * Comprehensive pgvector health check
 * Run this during application startup
 */
export async function performPgvectorHealthCheck(): Promise<void> {
  console.log('🔍 Performing pgvector health check...')

  // 1. Check extension installation
  await ensurePgvectorInstalled()

  // 2. Check indexes
  const indexes = await checkVectorIndexes()

  if (indexes.teacherIndex && indexes.jobIndex) {
    console.log('✅ All vector indexes present')
  } else {
    console.warn('⚠️ Some vector indexes missing - see warnings above')
  }

  console.log('✅ pgvector health check complete\n')
}
