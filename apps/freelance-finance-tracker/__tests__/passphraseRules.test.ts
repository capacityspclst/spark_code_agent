import { validateBackupPassphrase } from '../src/lib/validation';

test('backup passphrase must be at least 12 characters', () => {
  expect(validateBackupPassphrase('short')).toBe('Passphrase must be at least 12 characters');
  expect(validateBackupPassphrase('exactly12!!')).toBeNull();
});
