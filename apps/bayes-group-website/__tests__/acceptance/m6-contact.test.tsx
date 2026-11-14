import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Contact page form validates required fields, shows errors, and displays success message without network request', async () => {
  render(<App />);

  // Navigate to Contact page
  const contactLink = screen.getByRole('link', { name: /contact/i });
  await userEvent.click(contactLink);

  // Title should include brand name
  await waitFor(() => {
    expect(document.title).toContain('The Bayes Group');
    expect(document.title).toContain('Contact');
  });

  // H1
  const h1 = screen.getByRole('heading', { level: 1 });
  expect(h1).toHaveTextContent('Book a consultation');

  // Email address displayed
  expect(screen.getByText('hello@thebayesgroup.com')).toBeInTheDocument();

  // Form fields
  const nameInput = screen.getByLabelText(/name/i);
  const emailInput = screen.getByLabelText(/^email$/i);
  const companyInput = screen.getByLabelText(/company/i);
  const helpSelect = screen.getByLabelText(/what can we help with\?/i);
  const messageTextarea = screen.getByLabelText(/message/i);
  const sendButton = screen.getByRole('button', { name: /send message/i });

  // Submit empty form – expect validation messages
  await userEvent.click(sendButton);
  expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
  expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  expect(screen.getByText('Please enter a message.')).toBeInTheDocument();

  // Fill in valid data
  await userEvent.type(nameInput, 'Jane Doe');
  await userEvent.type(emailInput, 'test.user@example.com');
  // Optional fields left blank / default
  await userEvent.selectOptions(helpSelect, 'Training');
  await userEvent.type(messageTextarea, 'I would like to learn more about AI Enablement.');

  // Ensure no network request is made (fetch may be undefined in JSDOM)
  if (typeof window.fetch === 'function') {
    const fetchSpy = jest.spyOn(window, 'fetch');
    await userEvent.click(sendButton);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  } else {
    await userEvent.click(sendButton);
  }

  // Success message appears
  await waitFor(() => {
    expect(
      screen.getByText("Thanks, we'll be in touch within one business day.")
    ).toBeInTheDocument();
  });

  // Form fields are cleared
  expect(nameInput).toHaveValue('');
  expect(emailInput).toHaveValue('');
  expect(messageTextarea).toHaveValue('');
});
