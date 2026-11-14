import React, { useState, useEffect } from 'react';

const initialState = {
  name: '',
  email: '',
  company: '',
  request: '',
  message: '',
};

type FormState = typeof initialState;

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

const Contact: React.FC = () => {
  useEffect(() => {
    document.title = 'Book a consultation | The Bayes Group';
  }, []);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): Errors => {
    const newErrors: Errors = {};
    if (!form.name.trim()) newErrors.name = 'Please enter your name.';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      newErrors.email = 'Please enter a valid email address.';
    if (!form.message.trim()) newErrors.message = 'Please enter a message.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      // Simulate async submission
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
        setForm(initialState);
      }, 500);
    }
  };

  if (submitted) {
    return (
      <section>
        <h1>Book a consultation</h1>
        <p>Thanks, we'll be in touch within one business day.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Book a consultation</h1>
      <p>Email us at</p>
      <p>hello@thebayesgroup.com</p>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            aria-describedby={errors.name ? 'error-name' : undefined}
          />
          {errors.name && (
            <div id="error-name" role="alert" className="error-text">
              {errors.name}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            aria-describedby={errors.email ? 'error-email' : undefined}
          />
          {errors.email && (
            <div id="error-email" role="alert" className="error-text">
              {errors.email}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={form.company}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="request">What can we help with?</label>
          <select
            id="request"
            name="request"
            value={form.request}
            onChange={handleChange}
          >
            <option value="">Select an option</option>
            <option value="AI Enablement">AI Enablement</option>
            <option value="Training">Training</option>
            <option value="Custom Development">Custom Development</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            aria-describedby={errors.message ? 'error-message' : undefined}
          />
          {errors.message && (
            <div id="error-message" role="alert" className="error-text">
              {errors.message}
            </div>
          )}
        </div>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </section>
  );
};

export default Contact;
