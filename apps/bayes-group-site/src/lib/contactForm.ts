export type ContactValues = {
  name: string;
  email: string;
  company: string;
  companySize: string;
  topic: string;
  message: string;
};

export const EMPTY_CONTACT_FORM: ContactValues = {
  name: '',
  email: '',
  company: '',
  companySize: '',
  topic: '',
  message: '',
};

export const HELP_OPTIONS = ['AI Enablement','Training','Custom Development','Not sure yet'] as const;
export const COMPANY_SIZE_OPTIONS = ['1-49 employees','50-249 employees','250-999 employees','1,000+ employees'] as const;
export const COMPANY_SIZE_OPTIONS = ['1-49 employees','50-249 employees','250-999 employees','1,000+ employees'] as const;

export const ERROR_MESSAGES = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address.',
  message: 'Please enter a message.',
};

export const SUCCESS_MESSAGE = "Thanks, we'll be in touch within one business day.";

export function isValidEmail(s: string): boolean {
  const trimmed = s.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function validateContact(values: ContactValues) {
  const errors: Partial<Record<keyof typeof ERROR_MESSAGES, string>> = {};
  if (!values.name.trim()) errors.name = ERROR_MESSAGES.name;
  if (!isValidEmail(values.email)) errors.email = ERROR_MESSAGES.email;
  if (!values.message.trim()) errors.message = ERROR_MESSAGES.message;
  return errors;
}

export async function submitContact(values: ContactValues) {
  const errors = validateContact(values);
  if (Object.keys(errors).length === 0) {
    return { ok: true, message: SUCCESS_MESSAGE, values: { ...EMPTY_CONTACT_FORM } };
  }
  return { ok: false, errors, values };
}
