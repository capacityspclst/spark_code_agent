import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import userEvent from '@testing-library/user-event';

test('Contact form validates email format and shows error for invalid email', async () => {
  render(<App />);

  // Navigate to Contact page via header navigation link
  const header = screen.getByRole('banner');
  const contactLink = within(header).getByRole('link', { name: /contact/i });
  await userEvent.click(contactLink);

  // Wait for title to contain “Contact”
  await waitFor(() => {
    expect(document.title).toContain('Contact');
  });

  // Form fields
  const nameInput = screen.getByLabelText(/name/i);
  const emailInput = screen.getByLabelText(/^email$/i);
  const messageTextarea = screen.getByLabelText(/message/i);
  const sendButton = screen.getByRole('button', { name: /send message/i });

  // Fill in valid name and message, but an invalid email address
  await userEvent.type(nameInput, 'Jane Doe');
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.type(messageTextarea, 'I would like to learn more.');

  // Submit the form
  await userEvent.click(sendButton);

  // Expect the specific email validation error
  expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();

  // No success message should be displayed
  expect(
    screen.queryByText("Thanks, we'll be in touch within one business day.")
  ).not.toBeInTheDocument();
});
