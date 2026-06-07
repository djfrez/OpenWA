import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { sessions, messages, contacts, groups, webhooks, apiKeys } from './openwa.js';

function createServer() {
  const server = new McpServer({
    name: 'openwa',
    version: '1.0.0',
  });

  // ── SESSIONS ──────────────────────────────────────────────────────────────

  server.tool('list_sessions', 'List all WhatsApp sessions', {}, async () => {
    const data = await sessions.list();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('create_session', 'Create a new WhatsApp session', {
    id: z.string().describe('Unique session ID'),
  }, async ({ id }) => {
    const data = await sessions.create(id);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_session', 'Get details of a specific session', {
    sessionId: z.string().describe('Session ID'),
  }, async ({ sessionId }) => {
    const data = await sessions.get(sessionId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_session_qr', 'Get the QR code for a session (for scanning with WhatsApp)', {
    sessionId: z.string().describe('Session ID'),
  }, async ({ sessionId }) => {
    const data = await sessions.qr(sessionId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_session_status', 'Get the connection status of a session', {
    sessionId: z.string().describe('Session ID'),
  }, async ({ sessionId }) => {
    const data = await sessions.status(sessionId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('delete_session', 'Delete a WhatsApp session', {
    sessionId: z.string().describe('Session ID'),
  }, async ({ sessionId }) => {
    const data = await sessions.delete(sessionId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── MESSAGES ──────────────────────────────────────────────────────────────

  server.tool('send_text_message', 'Send a text message via WhatsApp', {
    sessionId: z.string().describe('Session ID to send from'),
    chatId: z.string().describe('Recipient. Personal: 5519999999999@c.us — Group: groupid@g.us'),
    text: z.string().describe('Message text'),
  }, async ({ sessionId, chatId, text }) => {
    const data = await messages.sendText(sessionId, chatId, text);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('send_image_message', 'Send an image via WhatsApp', {
    sessionId: z.string().describe('Session ID'),
    chatId: z.string().describe('Recipient chat ID'),
    url: z.string().describe('Publicly accessible image URL'),
    caption: z.string().optional().describe('Optional caption'),
  }, async ({ sessionId, chatId, url, caption }) => {
    const data = await messages.sendImage(sessionId, chatId, url, caption);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('send_file_message', 'Send a file/document via WhatsApp', {
    sessionId: z.string().describe('Session ID'),
    chatId: z.string().describe('Recipient chat ID'),
    url: z.string().describe('Publicly accessible file URL'),
    filename: z.string().optional().describe('Optional display filename'),
  }, async ({ sessionId, chatId, url, filename }) => {
    const data = await messages.sendFile(sessionId, chatId, url, filename);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('send_location_message', 'Send a location via WhatsApp', {
    sessionId: z.string().describe('Session ID'),
    chatId: z.string().describe('Recipient chat ID'),
    latitude: z.number().describe('Latitude'),
    longitude: z.number().describe('Longitude'),
    name: z.string().optional().describe('Optional location name'),
  }, async ({ sessionId, chatId, latitude, longitude, name }) => {
    const data = await messages.sendLocation(sessionId, chatId, latitude, longitude, name);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('send_audio_message', 'Send an audio file via WhatsApp', {
    sessionId: z.string().describe('Session ID'),
    chatId: z.string().describe('Recipient chat ID'),
    url: z.string().describe('Publicly accessible audio URL'),
  }, async ({ sessionId, chatId, url }) => {
    const data = await messages.sendAudio(sessionId, chatId, url);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── CONTACTS ──────────────────────────────────────────────────────────────

  server.tool('list_contacts', 'List all contacts for a session', {
    sessionId: z.string().describe('Session ID'),
  }, async ({ sessionId }) => {
    const data = await contacts.list(sessionId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_contact', 'Get details of a specific contact', {
    sessionId: z.string().describe('Session ID'),
    contactId: z.string().describe('Contact ID (e.g. 5519999999999@c.us)'),
  }, async ({ sessionId, contactId }) => {
    const data = await contacts.get(sessionId, contactId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('check_contact', 'Check if a phone number is registered on WhatsApp', {
    sessionId: z.string().describe('Session ID'),
    number: z.string().describe('Phone number with country code, no + (e.g. 5519999999999)'),
  }, async ({ sessionId, number }) => {
    const data = await contacts.check(sessionId, number);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── GROUPS ────────────────────────────────────────────────────────────────

  server.tool('list_groups', 'List all WhatsApp groups for a session', {
    sessionId: z.string().describe('Session ID'),
  }, async ({ sessionId }) => {
    const data = await groups.list(sessionId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('create_group', 'Create a new WhatsApp group', {
    sessionId: z.string().describe('Session ID'),
    name: z.string().describe('Group name'),
    participants: z.array(z.string()).describe('List of participant chat IDs'),
  }, async ({ sessionId, name, participants }) => {
    const data = await groups.create(sessionId, name, participants);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_group', 'Get details of a specific group', {
    sessionId: z.string().describe('Session ID'),
    groupId: z.string().describe('Group ID (e.g. 123456789-123456789@g.us)'),
  }, async ({ sessionId, groupId }) => {
    const data = await groups.get(sessionId, groupId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('add_group_participant', 'Add a participant to a WhatsApp group', {
    sessionId: z.string().describe('Session ID'),
    groupId: z.string().describe('Group ID'),
    participant: z.string().describe('Participant chat ID to add'),
  }, async ({ sessionId, groupId, participant }) => {
    const data = await groups.addParticipant(sessionId, groupId, participant);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('remove_group_participant', 'Remove a participant from a WhatsApp group', {
    sessionId: z.string().describe('Session ID'),
    groupId: z.string().describe('Group ID'),
    participant: z.string().describe('Participant chat ID to remove'),
  }, async ({ sessionId, groupId, participant }) => {
    const data = await groups.removeParticipant(sessionId, groupId, participant);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── WEBHOOKS ──────────────────────────────────────────────────────────────

  server.tool('list_webhooks', 'List all registered webhooks', {}, async () => {
    const data = await webhooks.list();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('create_webhook', 'Register a webhook to receive WhatsApp events', {
    url: z.string().describe('Endpoint URL that will receive POST events'),
    events: z.array(z.string()).describe(
      'Event types to subscribe to (e.g. ["message.received", "session.connected"])'
    ),
    secret: z.string().optional().describe('Optional HMAC-SHA256 signing secret'),
  }, async ({ url, events, secret }) => {
    const data = await webhooks.create(url, events, secret);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_webhook', 'Get details of a specific webhook', {
    webhookId: z.string().describe('Webhook ID'),
  }, async ({ webhookId }) => {
    const data = await webhooks.get(webhookId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('update_webhook', 'Update a webhook configuration', {
    webhookId: z.string().describe('Webhook ID'),
    url: z.string().optional().describe('New endpoint URL'),
    events: z.array(z.string()).optional().describe('New event list'),
    enabled: z.boolean().optional().describe('Enable or disable the webhook'),
  }, async ({ webhookId, ...updates }) => {
    const data = await webhooks.update(webhookId, updates);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('delete_webhook', 'Delete a webhook', {
    webhookId: z.string().describe('Webhook ID'),
  }, async ({ webhookId }) => {
    const data = await webhooks.delete(webhookId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── API KEYS ──────────────────────────────────────────────────────────────

  server.tool('list_api_keys', 'List all API keys', {}, async () => {
    const data = await apiKeys.list();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('create_api_key', 'Create a new API key', {
    name: z.string().describe('Human-readable name for the key'),
    permissions: z.array(z.string()).describe(
      'Permissions to grant (e.g. ["*"] for full access, ["messages:send"] for scoped)'
    ),
    expiresAt: z.string().optional().describe('ISO 8601 expiry date (optional)'),
  }, async ({ name, permissions, expiresAt }) => {
    const data = await apiKeys.create(name, permissions, expiresAt);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('get_api_key', 'Get details of a specific API key', {
    keyId: z.string().describe('API key ID'),
  }, async ({ keyId }) => {
    const data = await apiKeys.get(keyId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('revoke_api_key', 'Revoke an API key (disables it without deleting)', {
    keyId: z.string().describe('API key ID'),
  }, async ({ keyId }) => {
    const data = await apiKeys.revoke(keyId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('delete_api_key', 'Permanently delete an API key', {
    keyId: z.string().describe('API key ID'),
  }, async ({ keyId }) => {
    const data = await apiKeys.delete(keyId);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  return server;
}

// ── HTTP SERVER ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// Auth middleware — /health and /webhook are public; everything else requires X-API-Key
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/webhook') return next();
  const key = req.headers['x-api-key'];
  if (!process.env.MCP_API_KEY) {
    res.status(500).json({ error: 'MCP_API_KEY not configured on server' });
    return;
  }
  if (key !== process.env.MCP_API_KEY) {
    res.status(401).json({ error: 'Unauthorized: invalid or missing X-API-Key' });
    return;
  }
  next();
});

// ── WEBHOOK RECEIVER ─────────────────────────────────────────────────────────
// Receives events from OpenWA and forwards session disconnect alerts to Telegram.
// No API key required — called by OpenWA internally.

app.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const eventName: string = event?.event ?? event?.type ?? '';
    const isDisconnect = eventName === 'session.disconnected' || eventName === 'disconnected';

    if (isDisconnect) {
      const sessionId: string = event?.sessionId ?? event?.session ?? 'unknown';
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (token && chatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `⚠️ *OpenWA Alert*\nSession \`${sessionId}\` disconnected.\n\nReconnect at https://wa.qurt.com.br`,
            parse_mode: 'Markdown',
          }),
        });
      } else {
        console.warn('Telegram credentials not configured — skipping disconnect alert');
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ ok: true });
});

app.all('/', async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
  res.on('finish', () => server.close());
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`OpenWA MCP server listening on :${PORT}`));
