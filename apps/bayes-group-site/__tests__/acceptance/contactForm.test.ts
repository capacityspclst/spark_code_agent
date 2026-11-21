import {
  EMPTY_CONTACT_FORM,
  HELP_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGE,
  COMPANY_SIZE_OPTIONS,
  isValidEmail,
  validateContact,
  submitContact,
} from '../../src/lib/contactForm';

const valid = {
  name: 'Test User',
  email: 'test.user@example.com',
  company: 'Example Corp',
  companySize: '50-249 employees',
  topic: 'Training',
  message: 'We would like a workshop for our analytics team.',
};

const EMPTY = { name: '', email: '', company: '', companySize: '', topic: '', message: '' };

describe('contact form constants', () => {
  test('values', () => {
    expect(EMPTY_CONTACT_FORM).toEqual(EMPTY);
    expect([...HELP_OPTIONS]).toEqual(['AI Enablement', 'Training', 'Custom Development', 'Not sure yet']);
    expect(ERROR_MESSAGES).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please enter a message.',
    });
    expect(SUCCESS_MESSAGE).toBe("Thanks, we'll be in touch within one business day.");
  });

  test('company size options', () => {
    expect([...COMPANY_SIZE_OPTIONS]).toEqual([
      '1-49 employees',
      '50-249 employees',
      '250-999 employees',
      '1,000+ employees',
    ]);
  });
});

describe('isValidEmail', () => {
  test.each(['test.user@example.com', 'a.b@sub.example.co.uk', '  test.user@example.com  '])(
    'valid: %s',
    (e) => expect(isValidEmail(e)).toBe(true),
  );
  test.each(['', 'not-an-email', 'a@b', 'a b@example.com', '@example.com', 'test.user@'])(
    'invalid: %s',
    (e) => expect(isValidEmail(e)).toBe(false),
  );
});

describe('validateContact', () => {
  test('valid input has no errors', () => {
    expect(validateContact(valid)).toEqual({});
  });

  test('company, company size and topic are optional', () => {
    expect(validateContact({ ...valid, company: '', companySize: '', topic: '' })).toEqual({});
  });

  test.each(['1-49 employees', '50-249 employees', '250-999 employees', '1,000+ employees'])(
    'company size %s gives no error',
    (size) => {
      expect(validateContact({ ...valid, companySize: size })).toEqual({});
    },
  );

  test('empty form reports all three errors', () => {
    expect(validateContact({ ...EMPTY_CONTACT_FORM })).toEqual({
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please enter a message.',
    });
  });

  test('whitespace-only counts as empty', () => {
    const errors = validateContact({ ...valid, name: '   ', message: '\n  ' });
    expect(errors).toEqual({
      name: 'Please enter your name.',
      message: 'Please enter a message.',
    });
  });

  test('invalid email only', () => {
    expect(validateContact({ ...valid, email: 'not-an-email' })).toEqual({
      email: 'Please enter a valid email address.',
    });
  });
});

describe('submitContact', () => {
  const g = globalThis as any;
  let originalFetch: any;
  let originalXHR: any;
  beforeEach(() => {
    originalFetch = g.fetch;
    originalXHR = g.XMLHttpRequest;
    g.fetch = jest.fn(() => Promise.reject(new Error('network not allowed')));
    g.XMLHttpRequest = jest.fn(() => {
      throw new Error('network not allowed');
    });
  });
  afterEach(() => {
    g.fetch = originalFetch;
    g.XMLHttpRequest = originalXHR;
  });

  test('valid submit succeeds, clears values, makes no request', async () => {
    const result: any = await submitContact({ ...valid });
    expect(result.ok).toBe(true);
    expect(result.message).toBe("Thanks, we'll be in touch within one business day.");
    expect(result.values).toEqual(EMPTY);
    expect(g.fetch).not.toHaveBeenCalled();
    expect(g.XMLHttpRequest).not.toHaveBeenCalled();
  });

  test('invalid submit returns errors and keeps values', async () => {
    const input = { ...valid, email: 'bad', message: '' };
    const result: any = await submitContact(input);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({
      email: 'Please enter a valid email address.',
      message: 'Please enter a message.',
    });
    expect(result.values).toEqual(input);
    expect(g.fetch).not.toHaveBeenCalled();
  });
});
