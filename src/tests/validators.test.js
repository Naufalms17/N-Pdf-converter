/**
 * Unit tests for validators
 * Run with: jest src/tests/validators.test.js
 */

import {
  parsePageRange,
  validateFileSize,
  validatePassword,
  validateText,
} from '../utils/validators.js';
import { FILE_LIMITS } from '../utils/constants.js';

describe('parsePageRange', () => {
  test('parses single page', () => {
    expect(parsePageRange('2', 5)).toEqual([1]);
  });

  test('parses multiple pages', () => {
    expect(parsePageRange('1,3,5', 5)).toEqual([0, 2, 4]);
  });

  test('parses range', () => {
    expect(parsePageRange('1-3', 5)).toEqual([0, 1, 2]);
  });

  test('parses mixed range and pages', () => {
    expect(parsePageRange('1-2,4,5-5', 5)).toEqual([0, 1, 3, 4]);
  });

  test('throws on empty input', () => {
    expect(() => parsePageRange('', 5)).toThrow();
  });

  test('throws on invalid format', () => {
    expect(() => parsePageRange('abc', 5)).toThrow();
  });

  test('throws on page out of range', () => {
    expect(() => parsePageRange('10', 5)).toThrow();
  });

  test('throws on invalid range (start > end)', () => {
    expect(() => parsePageRange('5-1', 5)).toThrow();
  });

  test('handles whitespace', () => {
    expect(parsePageRange('  1 - 3  , 5  ', 5)).toEqual([0, 1, 2, 4]);
  });
});

describe('validateFileSize', () => {
  test('accepts file under limit', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    expect(() => validateFileSize(file)).not.toThrow();
  });

  test('throws on file exceeding limit', () => {
    const largeData = new Array((FILE_LIMITS.MAX_FILE_SIZE + 1) / 2).fill('x');
    const file = new File(largeData, 'large.pdf', { type: 'application/pdf' });
    expect(() => validateFileSize(file)).toThrow();
  });
});

describe('validatePassword', () => {
  test('accepts non-empty password', () => {
    expect(() => validatePassword('mypassword')).not.toThrow();
  });

  test('throws on empty password', () => {
    expect(() => validatePassword('')).toThrow();
  });

  test('throws on whitespace-only password', () => {
    expect(() => validatePassword('   ')).toThrow();
  });
});

describe('validateText', () => {
  test('accepts non-empty text', () => {
    expect(() => validateText('Hello world')).not.toThrow();
  });

  test('throws on empty text', () => {
    expect(() => validateText('')).toThrow();
  });

  test('throws on whitespace-only text', () => {
    expect(() => validateText('   ')).toThrow();
  });

  test('uses custom field name in error', () => {
    expect(() => validateText('', 'Custom Field')).toThrow(/Custom Field/);
  });
});
