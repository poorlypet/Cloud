// A stand-in for Cloudflare D1 using Node's built-in SQLite, so the database code can be tested without Cloudflare.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
export function makeDB() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  const wrap = (sql, args = []) => ({
    bind: (...a) => wrap(sql, a),
    first: async () => db.prepare(sql).get(...args) || null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => { const r = db.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } }; }
  });
  return { prepare: (sql) => wrap(sql), raw: db };
}
