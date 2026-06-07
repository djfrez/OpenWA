const BASE_URL = process.env.OPENWA_BASE_URL ?? 'http://openwa-api:2785';
const API_KEY = process.env.OPENWA_API_KEY ?? '';

async function request(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(`OpenWA API error ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

// Sessions
export const sessions = {
  list: () => request('GET', '/api/sessions'),
  create: (id: string, config?: Record<string, unknown>) =>
    request('POST', '/api/sessions', { id, ...config }),
  get: (id: string) => request('GET', `/api/sessions/${id}`),
  delete: (id: string) => request('DELETE', `/api/sessions/${id}`),
  qr: (id: string) => request('GET', `/api/sessions/${id}/qr`),
  status: (id: string) => request('GET', `/api/sessions/${id}/status`),
};

// Messages
export const messages = {
  sendText: (sessionId: string, chatId: string, text: string) =>
    request('POST', `/api/sessions/${sessionId}/messages/send-text`, { chatId, text }),
  sendImage: (sessionId: string, chatId: string, url: string, caption?: string) =>
    request('POST', `/api/sessions/${sessionId}/messages/send-image`, { chatId, url, caption }),
  sendFile: (sessionId: string, chatId: string, url: string, filename?: string) =>
    request('POST', `/api/sessions/${sessionId}/messages/send-file`, { chatId, url, filename }),
  sendLocation: (sessionId: string, chatId: string, lat: number, lng: number, name?: string) =>
    request('POST', `/api/sessions/${sessionId}/messages/send-location`, {
      chatId, latitude: lat, longitude: lng, name,
    }),
  sendAudio: (sessionId: string, chatId: string, url: string) =>
    request('POST', `/api/sessions/${sessionId}/messages/send-audio`, { chatId, url }),
};

// Contacts
export const contacts = {
  list: (sessionId: string) => request('GET', `/api/sessions/${sessionId}/contacts`),
  get: (sessionId: string, contactId: string) =>
    request('GET', `/api/sessions/${sessionId}/contacts/${contactId}`),
  check: (sessionId: string, number: string) =>
    request('GET', `/api/sessions/${sessionId}/contacts/check/${number}`),
};

// Groups
export const groups = {
  list: (sessionId: string) => request('GET', `/api/sessions/${sessionId}/groups`),
  create: (sessionId: string, name: string, participants: string[]) =>
    request('POST', `/api/sessions/${sessionId}/groups`, { name, participants }),
  get: (sessionId: string, groupId: string) =>
    request('GET', `/api/sessions/${sessionId}/groups/${groupId}`),
  addParticipant: (sessionId: string, groupId: string, participant: string) =>
    request('POST', `/api/sessions/${sessionId}/groups/${groupId}/participants`, { participant }),
  removeParticipant: (sessionId: string, groupId: string, participant: string) =>
    request('DELETE', `/api/sessions/${sessionId}/groups/${groupId}/participants/${participant}`),
};

// Webhooks
export const webhooks = {
  list: () => request('GET', '/api/webhooks'),
  create: (url: string, events: string[], secret?: string) =>
    request('POST', '/api/webhooks', { url, events, secret }),
  get: (id: string) => request('GET', `/api/webhooks/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    request('PUT', `/api/webhooks/${id}`, data),
  delete: (id: string) => request('DELETE', `/api/webhooks/${id}`),
};

// API Keys
export const apiKeys = {
  list: () => request('GET', '/api/auth/api-keys'),
  create: (name: string, permissions: string[], expiresAt?: string) =>
    request('POST', '/api/auth/api-keys', { name, permissions, expiresAt }),
  get: (id: string) => request('GET', `/api/auth/api-keys/${id}`),
  revoke: (id: string) => request('POST', `/api/auth/api-keys/${id}/revoke`),
  delete: (id: string) => request('DELETE', `/api/auth/api-keys/${id}`),
};
