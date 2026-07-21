'use strict';

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

/** Set DEMO_BREAK=1 to flip the Create User button label — used in E8 */
const DEMO_BREAK = process.env.DEMO_BREAK === '1';

app.use(express.json());

// ---------------------------------------------------------------------------
// Data layer — in-memory store, fully resettable via POST /api/seed
// ---------------------------------------------------------------------------

function makeSeedUsers() {
  return [
    { id: 1, firstName: 'Alice',  lastName: 'Johnson', email: 'alice@example.com',  role: 'admin'     },
    { id: 2, firstName: 'Bob',    lastName: 'Smith',   email: 'bob@example.com',    role: 'user'      },
    { id: 3, firstName: 'Carol',  lastName: 'White',   email: 'carol@example.com',  role: 'user'      },
    { id: 4, firstName: 'David',  lastName: 'Brown',   email: 'david@example.com',  role: 'moderator' },
    { id: 5, firstName: 'Eve',    lastName: 'Davis',   email: 'eve@example.com',    role: 'user'      },
  ];
}

/** Passwords stored separately — never exposed via GET /api/users */
const SEED_PASSWORDS = { 1: 'password123', 2: 'password123', 3: 'password123', 4: 'password123', 5: 'password123' };

let users         = makeSeedUsers();
let userPasswords = { ...SEED_PASSWORDS };
let nextId        = 6;

// ---------------------------------------------------------------------------
// UI routes — serve the SPA, optionally patched by DEMO_BREAK (E8)
// ---------------------------------------------------------------------------

function serveHtml(res) {
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  if (DEMO_BREAK) {
    // Swaps the submit button label so existing "Create User" assertions fail (E8)
    html = html.replace(/>Create User</g, '>Add User<');
  }
  res.send(html);
}

app.get('/',          (req, res) => serveHtml(res));
app.get('/users',     (req, res) => serveHtml(res));
app.get('/users/new', (req, res) => serveHtml(res));

app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/demo-config — exposes safe runtime flags to the browser (no secrets)
app.get('/api/demo-config', (req, res) => {
  res.json({ demoBreak: DEMO_BREAK });
});

// POST /api/auth — returns 200 + mock token, or 401
// Demo password for all seeded users: password123
app.post('/api/auth', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u => u.email === (email || '').trim());
  if (!user || userPasswords[user.id] !== password) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  res.json({
    token: `mock-token-${user.id}-${Date.now()}`,
    user:  { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
});

// POST /api/seed — resets the in-memory database to its original seed state
app.post('/api/seed', (req, res) => {
  users         = makeSeedUsers();
  userPasswords = { ...SEED_PASSWORDS };
  nextId        = 6;
  res.json({ message: 'database reset to seed data', count: users.length });
});

// GET /api/users — optional ?role= filter
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  res.json(role ? users.filter(u => u.role === role) : users);
});

// POST /api/users
app.post('/api/users', (req, res) => {
  const { firstName, lastName, email, password } = req.body || {};

  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '')
    return res.status(400).json({ error: 'firstName is required' });

  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '')
    return res.status(400).json({ error: 'lastName is required' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return res.status(400).json({ error: 'valid email is required' });

  if (!password || typeof password !== 'string' || password.trim() === '')
    return res.status(400).json({ error: 'password is required' });

  if (users.find(u => u.email === email.trim()))
    return res.status(409).json({ error: 'email already exists' });

  const user = { id: nextId++, firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), role: 'user' };
  userPasswords[user.id] = password;
  users.push(user);
  res.status(201).json(user);
});

// GET /api/users/:id/summary — offline AI-style summary (E9)
// Wording varies between calls; name, email and role are always present in keyFacts.
const SUMMARY_TEMPLATES = [
  '{firstName} {lastName} is a {role} with email {email}. Their system ID is {id}.',
  'Account overview: {firstName} {lastName} holds the {role} role. Email: {email} | ID: {id}.',
  'This profile belongs to {firstName} {lastName} ({email}), assigned the {role} role. ID: {id}.',
];

app.get('/api/users/:id/summary', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) return res.status(404).json({ error: 'user not found' });

  const tmpl    = SUMMARY_TEMPLATES[Math.floor(Math.random() * SUMMARY_TEMPLATES.length)];
  const summary = tmpl
    .replace('{firstName}', user.firstName)
    .replace('{lastName}',  user.lastName)
    .replace('{role}',      user.role || 'user')
    .replace('{email}',     user.email)
    .replace('{id}',        user.id);

  res.json({
    summary,
    keyFacts: [`${user.firstName} ${user.lastName}`, user.email, user.role || 'user'],
  });
});

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

// DELETE /api/users — delete by email body (test-cleanup helper)
app.delete('/api/users', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: 'user not found' });
  const [removed] = users.splice(idx, 1);
  delete userPasswords[removed.id];
  res.status(204).send();
});

// DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'user not found' });
  const [removed] = users.splice(idx, 1);
  delete userPasswords[removed.id];
  res.status(204).send();
});

// ---------------------------------------------------------------------------
// LLM Demo — offline mock (E9)
// Each call returns the same question with a different response variant.
// ---------------------------------------------------------------------------

const LLM_RESPONSES = [
  'Dublin is the capital and largest city of Ireland, situated on the east coast at the mouth of the River Liffey.',
  'The capital of Ireland is Dublin. Home to approximately 1.4 million people in the greater metropolitan area, it is the economic heart of the country.',
  "Ireland's capital city is Dublin — a historic settlement founded by Viking settlers in the 9th century, now a thriving European capital.",
  'Dublin serves as the capital of Ireland. The city is celebrated for its literary heritage, being the birthplace of James Joyce, Oscar Wilde, and Samuel Beckett.',
  'The answer is Dublin, the capital of Ireland. It is home to Trinity College Dublin, founded in 1592, which houses the famous Book of Kells.',
  "Dublin is Ireland's capital. Its name derives from the Irish 'Dubh Linn', meaning 'black pool', referring to a dark tidal pool where the Rivers Liffey and Poddle once met.",
  "Ireland's capital is Dublin, a city on the east coast of the island. It serves as the seat of the Irish government and houses Dáil Éireann, the lower house of parliament.",
  'Dublin — that is the capital of Ireland. The city sits at roughly 53°N latitude and is noted for its Georgian architecture, particularly around Merrion Square.',
  'The capital of Ireland is Dublin. The city is divided by the River Liffey, with the Northside and Southside each holding distinct cultural identities.',
  'Dublin is the capital city of Ireland. Dublin Castle served as the seat of British rule for over 700 years until Irish independence in 1922.',
  "Ireland's capital is Dublin, affectionately called 'The Fair City' in folk song. It hosts a vibrant live music scene and some of Europe's most storied pubs.",
  "The capital of Ireland is Dublin. The city's two medieval cathedrals — Christ Church and St Patrick's — date from the 12th century and remain iconic landmarks.",
  "Dublin is Ireland's capital and most populous city. It consistently ranks among Europe's more expensive cities, driven by its booming tech sector.",
  "Ireland's capital, Dublin, overlooks Dublin Bay. The bay is flanked by Howth Head to the north and Dalkey to the south, with the Wicklow Mountains visible inland.",
  "The capital of Ireland is Dublin. As a leading EU tech hub, the city hosts the European headquarters of Google, Meta, and many other major technology firms — earning the docklands the nickname 'Silicon Docks'.",
];

// GET /llm — LLM demo UI
app.get('/llm', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'llm.html'));
});

// GET /api/llm/ask — returns the hardcoded question with a random response
app.get('/api/llm/ask', (req, res) => {
  const idx      = Math.floor(Math.random() * LLM_RESPONSES.length);
  const response = LLM_RESPONSES[idx];
  res.json({
    question:       'What is the capital of Ireland?',
    response,
    responseIndex:  idx + 1,
    totalVariants:  LLM_RESPONSES.length,
    model:          'mock-llm-v1',
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (DEMO_BREAK) console.warn('⚠️  DEMO_BREAK=1 — "Create User" button label replaced with "Add User".');
});
