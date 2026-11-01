CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',          -- 'owner' or 'staff'
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  ip TEXT,
  at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- what the team has done to each email thread (shared between everyone who is signed in)
CREATE TABLE IF NOT EXISTS thread_state (
  thread_id TEXT PRIMARY KEY,
  status TEXT,                  -- needs_reply, done, ignored
  draft TEXT,                   -- the draft as edited by a person
  offer TEXT,                   -- what the team decided to offer (refund, replacement ...)
  updated_by INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- step 2: Gmail
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,                 -- the Gmail thread id
  history_id TEXT,
  subject TEXT,
  customer_name TEXT,
  customer_email TEXT,
  last_message_at TEXT,
  last_inbound_at TEXT,
  last_from_us INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'customer',   -- customer, supplier, marketing, spam
  category_source TEXT,                         -- rule, ai, heuristic, person
  category_reason TEXT,
  confidence REAL,
  priority TEXT DEFAULT 'normal',
  priority_reason TEXT,
  sentiment TEXT DEFAULT 'neutral',
  flags TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'needs_reply',   -- needs_reply, replied, done, ignored
  message_count INTEGER DEFAULT 0,
  snippet TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS threads_status ON threads(status, last_inbound_at);
CREATE INDEX IF NOT EXISTS threads_customer ON threads(customer_email);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,                 -- the Gmail message id
  thread_id TEXT NOT NULL,
  from_name TEXT,
  from_email TEXT,
  to_email TEXT,
  at TEXT,
  body TEXT,
  from_us INTEGER DEFAULT 0,
  attachments TEXT DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS messages_thread ON messages(thread_id, at);

-- what a person has taught the portal about senders: an email address or a whole domain such as @karnlea.co.uk
CREATE TABLE IF NOT EXISTS sender_rules (
  pattern TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
