// Simple API wrapper using fetch. In a real app you would configure base URL and error handling.
interface RequestOptions extends RequestInit {
  token?: string;
}

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function register(email: string, password: string) {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: getHeaders(),
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
    headers: getHeaders(token),
  });
  return res.json();
}

export async function exportPdf(token: string) {
  const res = await fetch('/export/pdf', { headers: getHeaders(token) });
  return res.blob();
}

export async function exportCsv(token: string) {
  const res = await fetch('/export/csv', { headers: getHeaders(token) });
  return res.blob();
}
