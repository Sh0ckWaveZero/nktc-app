import { describe, expect, it } from 'vitest';

import { toApiDate } from '../datetime';

describe('toApiDate', () => {
  it('keeps date-only API strings unchanged across time zones', () => {
    expect(toApiDate('2026-05-29')).toBe('2026-05-29');
  });

  it('formats Date objects as local YYYY-MM-DD values', () => {
    expect(toApiDate(new Date(2026, 4, 29))).toBe('2026-05-29');
  });
});
