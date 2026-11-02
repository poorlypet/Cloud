// Numbers for the happiness page, worked out from the emails already stored.
export async function dashboard(env, days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const day = (d) => d.toISOString().slice(0, 10);
  const { results: rows } = await env.DB.prepare(
    `SELECT t.id, t.customer_name, t.customer_email, t.subject, t.sentiment, t.priority, t.flags, t.status, t.last_inbound_at,
       (SELECT MIN(at) FROM messages m WHERE m.thread_id = t.id AND m.from_us = 0) AS first_in,
       (SELECT MIN(at) FROM messages m WHERE m.thread_id = t.id AND m.from_us = 1 AND m.at > (SELECT MIN(at) FROM messages m2 WHERE m2.thread_id = t.id AND m2.from_us = 0)) AS first_out
     FROM threads t WHERE t.category = 'customer' AND t.last_message_at >= ?`
  ).bind(since).all();
  const mood = { happy: 0, neutral: 0, upset: 0, angry: 0 };
  const perDay = {};
  for (let i = days > 14 ? 13 : days - 1; i >= 0; i--) perDay[day(new Date(Date.now() - i * 86400000))] = { total: 0, upset: 0 };
  const waits = [];
  let open = 0, urgent = 0, replied = 0;
  const attention = [];
  for (const r of rows) {
    mood[r.sentiment in mood ? r.sentiment : "neutral"]++;
    const d = String(r.first_in || r.last_inbound_at || "").slice(0, 10);
    if (perDay[d]) { perDay[d].total++; if (r.sentiment === "angry" || r.sentiment === "upset") perDay[d].upset++; }
    if (r.status === "needs_reply") {
      open++;
      if (r.priority === "urgent" || r.priority === "high") urgent++;
      let flags = []; try { flags = JSON.parse(r.flags || "[]"); } catch (e) {}
      flags = flags.filter((f) => /complain|chargeback|dispute|review|legal|fraud|solicitor|trading/i.test(f));
      if (flags.length || r.sentiment === "angry") attention.push({ id: r.id, who: r.customer_name || r.customer_email, subject: r.subject, sentiment: r.sentiment, flags, since: r.last_inbound_at });
    }
    if (r.status === "replied" || r.status === "done") replied++;
    if (r.first_in && r.first_out) { const h = (Date.parse(r.first_out) - Date.parse(r.first_in)) / 3600000; if (h >= 0) waits.push(h); }
  }
  waits.sort((a, b) => a - b);
  const avg = waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : null;
  const median = waits.length ? waits[Math.floor(waits.length / 2)] : null;
  const upsetNow = rows.filter((r) => r.status === "needs_reply" && (r.sentiment === "angry" || r.sentiment === "upset")).length;
  return {
    days, total: rows.length, open, urgent, replied, upsetNow, mood,
    replyHours: { average: avg, median, answered: waits.length, within4h: waits.length ? Math.round((100 * waits.filter((h) => h <= 4).length) / waits.length) : null, within24h: waits.length ? Math.round((100 * waits.filter((h) => h <= 24).length) / waits.length) : null },
    perDay: Object.entries(perDay).map(([date, v]) => ({ date, ...v })),
    attention: attention.sort((a, b) => String(a.since).localeCompare(String(b.since))).slice(0, 8)
  };
}
