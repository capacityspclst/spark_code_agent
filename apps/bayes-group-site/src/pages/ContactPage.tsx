import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import {
  EMPTY_CONTACT_FORM,
  HELP_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGE,
  validateContact,
  submitContact,
  ContactValues,
} from '../lib/contactForm';

export default function ContactPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  const [values, setValues] = React.useState<ContactValues>({ ...EMPTY_CONTACT_FORM });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof ERROR_MESSAGES, string>>>({});
  const [submitResult, setSubmitResult] = React.useState<{ ok: boolean; message?: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // clear errors for field when changed
    setErrors((prev) => {
      const { [name]: _, ...rest } = prev as any;
      return rest;
    });
    // hide success banner if editing after success
    if (submitResult?.ok) setSubmitResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContact(values);
    setErrors(validation as any);
    if (Object.keys(validation).length === 0) {
      const result = await submitContact(values);
      if (result.ok) {
        setSubmitResult({ ok: true, message: result.message });
        setValues({ ...EMPTY_CONTACT_FORM });
        setErrors({});
      } else {
        setSubmitResult({ ok: false });
        setErrors(result.errors as any);
      }
    }
  };

  return (
    <div className="contact-page">
      <h1>Book a consultation</h1>
      <p>Prefer email? <a href={`mailto:${'hello@thebayesgroup.com'}`}>hello@thebayesgroup.com</a></p>
      <p>Tell us what you're working on and we'll reply within one business day.</p>
      {submitResult?.ok && (
        <div role="status" className="success-banner" tabIndex={-1} style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
          {SUCCESS_MESSAGE}
        </div>
      )}
      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name <span className="required-tag">Required</span></label>
          <input id="name" name="name" type="text" value={values.name} onChange={handleChange} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
          {errors.name && <p id="name-error" className="error-message">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="email">Email <span className="required-tag">Required</span></label>
          <input id="email" name="email" type="email" value={values.email} onChange={handleChange} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
          {errors.email && <p id="email-error" className="error-message">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" value={values.company} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="topic">What can we help with?</label>
          <select id="topic" name="topic" value={values.topic} onChange={handleChange}>
            <option value="">Choose a topic</option>
            {HELP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="message">Message <span className="required-tag">Required</span></label>
          <textarea id="message" name="message" value={values.message} onChange={handleChange} rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />
          {errors.message && <p id="message-error" className="error-message">{errors.message}</p>}
        </div>
        <button type="submit">Send message</button>
      </form>
    </div>
  );
}
