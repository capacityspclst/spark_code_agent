// Simple API wrapper using fetch. Provides functions for backend endpoints.

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getHeaders(token?: string, isJson: boolean = true): HeadersInit {
  const headers: HeadersInit = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const t = token ?? getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
}

export async function register(email: string, password: string) {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: getHeaders(undefined, true),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: getHeaders(undefined, true),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }
  return data;
}

export async function uploadReceipt(data: FormData) {
  const res = await fetch('/receipts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: data,
  });
  return res.json();
}

export async function getDashboard() {
  const res = await fetch('/dashboard/summary', {
    headers: getHeaders(undefined, false),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load dashboard');
  }
  return res.json();
}

export async function exportPdf() {
  const res = await fetch('/export/pdf', { headers: getHeaders(undefined, false) });
  if (!res.ok) throw new Error('Export PDF failed');
  return res.blob();
}

export async function exportCsv() {
  const res = await fetch('/export/csv', { headers: getHeaders(undefined, false) });
  if (!res.ok) throw new Error('Export CSV failed');
  return res.blob();
}
