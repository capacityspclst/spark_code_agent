import { validateReceiptAmount, validateMileageMiles, validateMileageRate, validateTaxRate } from '../src/lib/validation';

test('receipt amount validation', () => {
  expect(validateReceiptAmount('')).toBeTruthy();
  expect(validateReceiptAmount('0')).toBeTruthy();
  expect(validateReceiptAmount('-5')).toBeTruthy();
  expect(validateReceiptAmount('1000001')).toBeTruthy();
  expect(validateReceiptAmount('123.456')).toBeTruthy();
  expect(validateReceiptAmount('123.45')).toBeNull();
});

test('mileage miles validation', () => {
  expect(validateMileageMiles('')).toBeTruthy();
  expect(validateMileageMiles('0')).toBeTruthy();
  expect(validateMileageMiles('10001')).toBeTruthy();
  expect(validateMileageMiles('12.345')).toBeTruthy();
  expect(validateMileageMiles('500')).toBeNull();
});

test('mileage rate validation', () => {
  expect(validateMileageRate('-0.1')).toBeTruthy();
  expect(validateMileageRate('5.1')).toBeTruthy();
  expect(validateMileageRate('3')).toBeNull();
});

test('tax rate validation', () => {
  expect(validateTaxRate('-1')).toBeTruthy();
  expect(validateTaxRate('101')).toBeTruthy();
  expect(validateTaxRate('22')).toBeNull();
});
