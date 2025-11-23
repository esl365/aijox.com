/**
 * Unit tests for lib/db/check-pgvector.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

// Import after mocking
import {
  ensurePgvectorInstalled,
  checkVectorIndexes,
  performPgvectorHealthCheck,
} from '@/lib/db/check-pgvector';

describe('ensurePgvectorInstalled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return true when pgvector is installed', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);

    const result = await ensurePgvectorInstalled();

    expect(result).toBe(true);
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });

  it('should throw error when pgvector is not installed', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(
      new Error('type "vector" does not exist')
    );

    await expect(ensurePgvectorInstalled()).rejects.toThrow(
      'Database is missing pgvector extension'
    );
  });

  it('should log success message when extension is verified', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);

    await ensurePgvectorInstalled();

    expect(consoleSpy).toHaveBeenCalledWith('✅ pgvector extension verified');
  });

  it('should log error message when extension check fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(
      new Error('type "vector" does not exist')
    );

    await expect(ensurePgvectorInstalled()).rejects.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ pgvector extension not installed!'
    );
  });
});

describe('checkVectorIndexes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return true for both indexes when they exist', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { indexname: 'idx_teacher_embedding_ivfflat' },
      { indexname: 'idx_job_embedding_ivfflat' },
    ]);

    const result = await checkVectorIndexes();

    expect(result).toEqual({
      teacherIndex: true,
      jobIndex: true,
    });
  });

  it('should return false when indexes are missing', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);

    const result = await checkVectorIndexes();

    expect(result).toEqual({
      teacherIndex: false,
      jobIndex: false,
    });
  });

  it('should warn when teacher index is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { indexname: 'idx_job_embedding_ivfflat' },
    ]);

    await checkVectorIndexes();

    expect(warnSpy).toHaveBeenCalledWith(
      '⚠️ Missing vector index on TeacherProfile.embedding'
    );
  });

  it('should warn when job index is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { indexname: 'idx_teacher_embedding_ivfflat' },
    ]);

    await checkVectorIndexes();

    expect(warnSpy).toHaveBeenCalledWith(
      '⚠️ Missing vector index on JobPosting.embedding'
    );
  });

  it('should return false for both on database error', async () => {
    const errorSpy = vi.spyOn(console, 'error');
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const result = await checkVectorIndexes();

    expect(result).toEqual({
      teacherIndex: false,
      jobIndex: false,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to check vector indexes:',
      expect.any(Error)
    );
  });

  it('should detect partial index matches', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { indexname: 'teacher_profile_embedding_idx' },
    ]);

    const result = await checkVectorIndexes();

    expect(result.teacherIndex).toBe(true);
    expect(result.jobIndex).toBe(false);
  });
});

describe('performPgvectorHealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should complete successfully when all checks pass', async () => {
    const logSpy = vi.spyOn(console, 'log');

    // Mock ensurePgvectorInstalled
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([]) // For ensurePgvectorInstalled
      .mockResolvedValueOnce([
        // For checkVectorIndexes
        { indexname: 'idx_teacher_embedding_ivfflat' },
        { indexname: 'idx_job_embedding_ivfflat' },
      ]);

    await performPgvectorHealthCheck();

    expect(logSpy).toHaveBeenCalledWith('🔍 Performing pgvector health check...');
    expect(logSpy).toHaveBeenCalledWith('✅ All vector indexes present');
    expect(logSpy).toHaveBeenCalledWith('✅ pgvector health check complete\n');
  });

  it('should warn when indexes are missing', async () => {
    const logSpy = vi.spyOn(console, 'log');
    const warnSpy = vi.spyOn(console, 'warn');

    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([]) // For ensurePgvectorInstalled
      .mockResolvedValueOnce([]); // For checkVectorIndexes - no indexes

    await performPgvectorHealthCheck();

    expect(logSpy).toHaveBeenCalledWith('🔍 Performing pgvector health check...');
    expect(warnSpy).toHaveBeenCalledWith(
      '⚠️ Some vector indexes missing - see warnings above'
    );
    expect(logSpy).toHaveBeenCalledWith('✅ pgvector health check complete\n');
  });

  it('should throw error if pgvector extension is not installed', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(
      new Error('type "vector" does not exist')
    );

    await expect(performPgvectorHealthCheck()).rejects.toThrow(
      'Database is missing pgvector extension'
    );
  });
});
