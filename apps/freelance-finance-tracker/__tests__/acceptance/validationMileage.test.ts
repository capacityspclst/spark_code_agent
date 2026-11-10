import { validateMileageMiles } from '../../src/lib/validation';

describe('validateMileageMiles', () => {
  it('accepts a numeric value with one decimal place', () => {
    expect(validateMileageMiles(12.5)).toBeNull();
  });

  it('rejects a numeric value with more than one decimal place', () => {
    expect(validateMileageMiles(12.55)).toBe('Miles can have at most 1 decimal place');
  });

  it('coerces a numeric string with one decimal place', () => {
    expect(validateMileageMiles('12.5')).toBeNull();
  });

  it('rejects a non-numeric string', () => {
    expect(validateMileageMiles('abc')).toBe('Miles must be a number');
  });
});
