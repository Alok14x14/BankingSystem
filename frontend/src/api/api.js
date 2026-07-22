const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // send cookies
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─── Auth ──────────────────────────────────────

export function register({ name, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

// ─── Accounts ──────────────────────────────────

export function createAccount({ currency = 'INR', status = 'ACTIVE' } = {}) {
  return request('/accounts/', {
    method: 'POST',
    body: JSON.stringify({ currency, status }),
  });
}

export function getAccounts() {
  return request('/accounts/accounts', {
    method: 'GET',
  });
}

export function getBalance(accountId) {
  return request(`/accounts/balance/${accountId}`, {
    method: 'GET',
  });
}

// ─── Transactions ──────────────────────────────

export function createTransaction({ fromAccount, toAccount, amount, idempotencyKey }) {
  return request('/transactions/', {
    method: 'POST',
    body: JSON.stringify({ fromAccount, toAccount, amount, idempotencyKey }),
  });
}
