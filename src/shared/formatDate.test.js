import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, formatDateTime } from './formatDate';

describe('formatDate', () => {
  it('formats date-only string as Spanish long form', () => {
    expect(formatDate('2026-09-30')).toBe('30 de septiembre de 2026');
  });

  it('formats ISO 8601 date-time string', () => {
    expect(formatDate('2026-06-01T00:00:00.000Z')).toBe('1 de junio de 2026');
  });

  it('returns em dash for null input', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns em dash for undefined input', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns em dash for empty string', () => {
    expect(formatDate('')).toBe('—');
  });
});

describe('formatDateShort', () => {
  it('formats date-only string as compact dd/mm/yyyy', () => {
    expect(formatDateShort('2026-09-30')).toBe('30/09/2026');
  });

  it('formats ISO 8601 as compact dd/mm/yyyy', () => {
    expect(formatDateShort('2026-06-01T00:00:00.000Z')).toBe('01/06/2026');
  });

  it('returns em dash for null input', () => {
    expect(formatDateShort(null)).toBe('—');
  });

  it('returns em dash for undefined input', () => {
    expect(formatDateShort(undefined)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats ISO 8601 with time as compact es-ES datetime', () => {
    expect(formatDateTime('2026-06-01T23:00:00.000Z')).toBe('1 jun 2026, 23:00');
  });

  it('returns em dash for null input', () => {
    expect(formatDateTime(null)).toBe('—');
  });

  it('returns em dash for undefined input', () => {
    expect(formatDateTime(undefined)).toBe('—');
  });
});
