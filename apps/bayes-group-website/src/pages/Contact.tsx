import React, { useState } from 'react';

const initialState = {
  name: '',
  email: '',
  company: '',
  help: 'AI Enablement',
  message: '',
};

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

const Contact: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Errors = {};
    if (!form.name.trim()) newErrors.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Please enter a valid email address.';
    if (!form.message.trim()) newErrors.message = 'Please enter a message.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // No network request
      setSubmitted(true);
      setForm(initialState);
      setErrors({});
    }
  };

  if (submitted) {
    return (
      <div>
        <h1>Book a consultation</h1>
        <p>Thanks, we'll be in touch within one business day.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Book a consultation</h1>
      <p>hello@thebayesgroup.com</p>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            aria-describedby={errors.name ? 'error-name' : undefined}
          />
          {errors.name && <div id="error-name" className="error-text">{errors.name}</div>}
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            aria-describedby={errors.email ? 'error-email' : undefined}
          />
          {errors.email && <div id="error-email" className="error-text">{errors.email}</div>}
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="company">Company</label>
          <input id="company" name="company" value={form.company} onChange={handleChange} />
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="help">What can we help with?</label>
          <select id="help" name="help" value={form.help} onChange={handleChange}>
            <option value="AI Enablement">AI Enablement</option>
            <option value="Training">Training</option>
            <option value="Custom Development">Custom Development</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            className={errors.message ? 'error' : ''}
            aria-describedby={errors.message ? 'error-message' : undefined}
          />
          {errors.message && <div id="error-message" className="error-text">{errors.message}</div>}
        </div>
        <button type="submit" className="button-primary">
          Send message
        </button>
      </form>
    </div>
  );
};

export default Contact;
