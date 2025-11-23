/**
 * Unit tests for lib/utils.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, formatDate, formatCurrency, sleep, chunk } from '@/lib/utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', true && 'visible');
    expect(result).toContain('base-class');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('should handle tailwind conflicts correctly', () => {
    const result = cn('p-4', 'p-8');
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-8');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });
});

describe('formatDate', () => {
  it('should format Date object correctly', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toBe('January 15, 2024');
  });

  it('should format date string correctly', () => {
    const result = formatDate('2024-12-25');
    expect(result).toBe('December 25, 2024');
  });

  it('should handle ISO date strings', () => {
    const result = formatDate('2024-06-01T12:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('June');
  });
});

describe('formatCurrency', () => {
  it('should format USD currency by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('should format with custom currency', () => {
    const result = formatCurrency(1000, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('1,000');
  });

  it('should handle zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  it('should handle large amounts', () => {
    const result = formatCurrency(1000000);
    expect(result).toBe('$1,000,000.00');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrency(-500.75);
    expect(result).toBe('-$500.75');
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after specified milliseconds', async () => {
    const promise = sleep(1000);

    vi.advanceTimersByTime(500);
    expect(promise).toBeInstanceOf(Promise);

    vi.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should handle zero delay', async () => {
    const promise = sleep(0);
    vi.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('chunk', () => {
  it('should split array into chunks of specified size', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = chunk(input, 3);
    expect(result).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });

  it('should handle arrays not evenly divisible', () => {
    const input = [1, 2, 3, 4, 5];
    const result = chunk(input, 2);
    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('should handle empty array', () => {
    const result = chunk([], 3);
    expect(result).toEqual([]);
  });

  it('should handle chunk size larger than array', () => {
    const input = [1, 2, 3];
    const result = chunk(input, 10);
    expect(result).toEqual([[1, 2, 3]]);
  });

  it('should handle chunk size of 1', () => {
    const input = [1, 2, 3];
    const result = chunk(input, 1);
    expect(result).toEqual([[1], [2], [3]]);
  });

  it('should work with different types', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = chunk(input, 2);
    expect(result).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});
