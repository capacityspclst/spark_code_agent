import { validateMileageMiles } from '../../src/lib/validation';

describe('M5: mileage miles validation edge cases', () => {
  it('rejects zero miles', () => {
    const result = validateMileageMiles(0);
    expect(result).toBeTruthy();
  });

  it('rejects negative miles', () => {
    const result = validateMileageMiles(-5);
    expect(result).toBeTruthy();
  });

  it('rejects miles greater than 10,000', () => {
    const result = validateMileageMiles(10001);
    expect(result).toBeTruthy();
  });

  it('accepts a valid integer mileage', () => {
    const result = validateMileageMiles(250);
    expect(result).toBeNull();
  });

  it('accepts a decimal mileage with a single decimal place (number)', () => {
    const result = validateMileageMiles(12.5);
    expect(result).toBeNull();
  });

  it('accepts a decimal mileage with a single decimal place (string)', () => {
    const result = validateMileageMiles('12.5');
    expect(result).toBeNull();
  });

  it('rejects a mileage with more than one decimal place', () => {
    const result = validateMileageMiles(12.55);
    expect(result).toBeTruthy();
  });

  it('rejects non‑numeric input', () => {
    const result = validateMileageMiles('abc' as any);
    expect(result).toBeTruthy();
  });
});
