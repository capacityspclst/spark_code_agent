// Simple API wrapper using fetch. Provides functions for backend endpoints.

function getHeaders(token?: string, isJson: boolean = true): HeadersInit {
  const headers: HeadersInit = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function register(email: string, password: string) {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: getHeaders(undefined, true),
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: getHeaders(undefined, true),
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function uploadReceipt(data: FormData, token: string) {
  const res = await fetch('/receipts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  return res.json();
}

export async function getDashboard(token: string) {
  const res = await fetch('/dashboard/summary', {
    headers: getHeaders(token, false),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load dashboard');
  }
  return res.json();
}

export async function exportPdf(token: string) {
  const res = await fetch('/export/pdf', { headers: getHeaders(token, false) });
  if (!res.ok) throw new Error('Export PDF failed');
  return res.blob();
}

export async function exportCsv(token: string) {
  const res = await fetch('/export/csv', { headers: getHeaders(token, false) });
  if (!res.ok) throw new Error('Export CSV failed');
  return res.blob();
}
