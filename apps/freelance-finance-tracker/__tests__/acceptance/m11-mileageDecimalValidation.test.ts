import { validateMileageMiles } from '../../src/lib/validation';

describe('M11: mileage validation accepts decimal strings and rejects too many decimals', () => {
  it('accepts a valid decimal mileage supplied as a string', () => {
    expect(validateMileageMiles('12.5')).toBeNull();
  });

  it('rejects a mileage string with more than one decimal place', () => {
    expect(validateMileageMiles('12.55')).toBe('Miles can have at most 1 decimal place');
  });
});
