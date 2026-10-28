// Thin wrapper around the Fetch API for talking to the Express backend
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getBooks: () => request('/books'),
  addBook: (b) => request('/books', { method: 'POST', body: b }),
  updateBook: (id, b) => request(`/books/${id}`, { method: 'PUT', body: b }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  getTransactions: () => request('/transactions'),
  addTransaction: (t) => request('/transactions', { method: 'POST', body: t }),

  getUsers: () => request('/users'),
  addUser: (u) => request('/users', { method: 'POST', body: u }),
  updateUser: (id, u) => request(`/users/${id}`, { method: 'PUT', body: u }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  login: (creds) => request('/users/login', { method: 'POST', body: creds }),
};
