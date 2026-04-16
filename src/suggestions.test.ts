import { describe, expect, test } from 'vitest';
import { toValueWithMeta } from './suggestions.js';

describe('suggestions', () => {
  describe('toValueWithMeta', () => {
    test('single', () => {
      const actual = toValueWithMeta([{ values: [13], location: 'a' }]);
      expect(actual).toEqual([{ value: 13, meta: [], locations: ['a'] }]);
    });

    test('per value', () => {
      const actual = toValueWithMeta([{ values: [13, 14], location: 'a' }]);
      expect(actual).toEqual([
        { value: 13, meta: [], locations: ['a'] },
        { value: 14, meta: [], locations: ['a'] },
      ]);
    });

    test('collect locations', () => {
      const actual = toValueWithMeta([
        { values: [13], location: 'a' },
        { values: [13], location: 'b' },
      ]);
      expect(actual).toEqual([{ value: 13, meta: [], locations: ['a', 'b'] }]);
    });

    test('propagate meta', () => {
      const actual = toValueWithMeta([
        {
          meta: ['foo'],
          group: [{ values: [13], location: 'a' }],
        },
      ]);
      expect(actual).toEqual([{ value: 13, meta: ['foo'], locations: ['a'] }]);
    });

    test('collect meta', () => {
      const actual = toValueWithMeta([
        {
          meta: ['foo'],
          group: [{ values: [13], location: 'a' }],
        },
        {
          meta: ['bar'],
          group: [{ values: [13], location: 'b' }],
        },
      ]);
      expect(actual).toEqual([
        { value: 13, meta: ['foo', 'bar'], locations: ['a', 'b'] },
      ]);
    });
  });
});
