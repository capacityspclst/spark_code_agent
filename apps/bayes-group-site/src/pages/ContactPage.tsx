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
  COMPANY_SIZE_OPTIONS,
} from '../lib/contactForm';
import { CONTACT_EMAIL } from '../content/site';
import { DataGridMotif } from '../components/Motifs';
import { AlertIcon, CheckIcon } from '../components/Icons';

type FieldKey = keyof typeof ERROR_MESSAGES;
type Errors = Partial<Record<FieldKey, string>>;

import Photo from '../components/Photo';

export default function ContactPage() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname);

  const [values, setValues] = React.useState<ContactValues>({ ...EMPTY_CONTACT_FORM });
  const [errors, setErrors] = React.useState<Errors>({});
  const [success, setSuccess] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const [showSummary, setShowSummary] = React.useState(false);

  const invalidFields = (['name', 'email', 'message'] as FieldKey[]).filter((k) => errors[k]);
  const FIELD_LABELS: Record<string, string> = { name: 'Name', email: 'Email', message: 'Message' };

  const goToField = (e: React.MouseEvent<HTMLAnchorElement>, key: string) => {
    e.preventDefault();
    const input = document.getElementById(key) as HTMLElement | null;
    if (!input) return;
    const wrapper = (input.closest('.field') as HTMLElement | null) || input;
    input.focus({ preventScroll: true });
    wrapper.scrollIntoView?.({ block: 'start' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name as FieldKey];
      return next;
    });
    if (success) setSuccess(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FieldKey;
    if (!(name in ERROR_MESSAGES)) return;
    const found = validateContact({ ...values, [name]: e.target.value })[name];
    if (found) setErrors((prev) => ({ ...prev, [name]: found }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const validation = validateContact(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setSuccess(false);
      setShowSummary(true);
      const firstInvalid = (['name', 'email', 'message'] as FieldKey[]).find((k) => validation[k]);
      setTimeout(() => {
        const input = firstInvalid ? (document.getElementById(firstInvalid) as HTMLElement | null) : null;
        if (!input) {
          const banner = summaryRef.current;
          banner?.focus({ preventScroll: true });
          banner?.scrollIntoView?.({ block: 'start' });
          return;
        }
        const wrapper = (input.closest('.field') as HTMLElement | null) || input;
        input.focus({ preventScroll: true });
        wrapper.scrollIntoView?.({ block: 'start' });
      }, 0);
      void form;
      return;
    }
    const result = await submitContact(values);
    if (result.ok) {
      setSuccess(true);
      setValues({ ...EMPTY_CONTACT_FORM });
      setErrors({});
      setTimeout(() => bannerRef.current?.focus(), 0);
    }
  };

  return (
    <div className="contact-page">
      <section className="page-hero band-navy" aria-labelledby="contact-hero">
        <DataGridMotif className="band-motif" />
        <div className="container band-content">
          <p className="eyebrow">CONTACT</p>
          <h1 id="contact-hero">Book a consultation</h1>
          <p className="lead">Tell us what you're working on and we'll reply within one business day.</p>
          <p className="band-email">Prefer email? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        </div>
      </section>
      <section className="section contact-section">
      <div className="container contact-grid">
        <div className="card contact-form-card">
          {success && (
            <div role="status" className="success-banner" tabIndex={-1} ref={bannerRef}>
              <CheckIcon />
              <span>{SUCCESS_MESSAGE}</span>
            </div>
          )}
          <form noValidate onSubmit={handleSubmit}>
            {showSummary && invalidFields.length > 0 && (
              <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
                <span>Please fix {invalidFields.length} {invalidFields.length === 1 ? 'field' : 'fields'}:</span>{' '}
                <ul>
                  {invalidFields.map((k) => (
                    <li key={k}><a href={`#${k}`} onClick={(e) => goToField(e, k)}>{FIELD_LABELS[k]}</a></li>
                  ))}
                </ul>
              </div>
            )}
            <p className="form-note muted">Fields marked Required must be filled in.</p>
            <div className="field">
              <div className="field-head"><label htmlFor="name">Name</label><span className="required-tag">(required)</span></div>
              <input className="form-control" id="name" required aria-required="true" name="name" type="text" autoComplete="name" value={values.name} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
              {errors.name && <p id="name-error" className="error-message"><AlertIcon />{errors.name}</p>}
            </div>
            <div className="field">
              <div className="field-head"><label htmlFor="email">Email</label><span className="required-tag">(required)</span></div>
              <input className="form-control" id="email" required aria-required="true" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
              {errors.email && <p id="email-error" className="error-message"><AlertIcon />{errors.email}</p>}
            </div>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input className="form-control" id="company" name="company" type="text" autoComplete="organization" value={values.company} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="topic">What can we help with?</label>
              <select className="form-control" id="topic" name="topic" value={values.topic} onChange={handleChange}>
                <option value="">Choose a topic</option>
                {HELP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="companySize">Company size</label>
              <select className="form-control" id="companySize" name="companySize" value={(values as any).companySize || ''} onChange={handleChange}>
                <option value="">Choose a size</option>
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="field-head"><label htmlFor="message">Message</label><span className="required-tag">(required)</span></div>
              <textarea className="form-control" id="message" required aria-required="true" name="message" value={values.message} onChange={handleChange} onBlur={handleBlur} rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />
              {errors.message && <p id="message-error" className="error-message"><AlertIcon />{errors.message}</p>}
            </div>
            <button type="submit" className="btn btn-primary">Send message</button>
          </form>
        </div>
        <aside className="contact-aside">
          <Photo name="contact-meeting" alt="Two colleagues in a consultation meeting at a table" sizes="(min-width: 1024px) 40vw, 100vw" />
          <p className="eyebrow">Next steps</p>
          <h2>What happens next</h2>
          <ol className="next-steps">
            <li>We reply within one business day</li>
            <li>A 30-minute call about your goals</li>
            <li>A written recommendation, no obligation</li>
          </ol>
        </aside>
      </div>
      </section>
    </div>
  );
}
