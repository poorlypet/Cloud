// Call-booking slots for the solar quote tool.
//
//   GET    /.netlify/functions/slots            -> { booked: ["2026-11-20 09:00", ...] }   (today onwards)
//   POST   /.netlify/functions/slots  {slot}    -> 200 { ok: true } or 409 if someone already has it
//   DELETE /.netlify/functions/slots?slot=...   -> frees a slot (header x-admin-key must match BOOKINGS_ADMIN_KEY)
//
// Slots are Monday to Friday, on the hour from 09:00 to 16:00 (UK time), so the last call ends at 5pm.
// Only the slot itself is stored here; the customer's details go to the store's inbox by email.
import { getStore } from "@netlify/blobs";

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const CORS = {
  "access-control-allow-origin": process.env.ALLOWED_ORIGIN || "*",
  "access-control-allow-headers": "content-type, x-admin-key",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } });

// Current date and hour in the UK, whatever time zone the server runs in
function ukNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24 };
}

// "YYYY-MM-DD HH:00" on a weekday, within opening hours, not in the past, at most ~10 weeks ahead
function validSlot(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):00$/.exec(s || "");
  if (!m) return false;
  const day = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (day.toISOString().slice(0, 10) !== s.slice(0, 10)) return false;
  const wd = day.getUTCDay(), hour = +m[4];
  if (wd === 0 || wd === 6 || !HOURS.includes(hour)) return false;
  const now = ukNow(), date = s.slice(0, 10);
  if (date < now.date || (date === now.date && hour <= now.hour)) return false;
  return day - new Date(now.date + "T00:00:00Z") <= 70 * 864e5;
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const store = getStore({ name: "call-bookings", consistency: "strong" });

  if (req.method === "GET") {
    const today = ukNow().date;
    const { blobs } = await store.list({ prefix: "slot/" });
    const booked = blobs.map((b) => b.key.slice(5)).filter((s) => s.slice(0, 10) >= today).sort();
    return json({ booked });
  }

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
    if (!validSlot(b.slot)) return json({ error: "That time isn't available" }, 400);
    const res = await store.setJSON("slot/" + b.slot, { bookedAt: new Date().toISOString() }, { onlyIfNew: true });
    return res.modified ? json({ ok: true, slot: b.slot }) : json({ error: "taken" }, 409);
  }

  if (req.method === "DELETE") {
    const key = process.env.BOOKINGS_ADMIN_KEY;
    if (!key || req.headers.get("x-admin-key") !== key) return json({ error: "Not allowed" }, 403);
    const slot = new URL(req.url).searchParams.get("slot") || "";
    await store.delete("slot/" + slot);
    return json({ ok: true, freed: slot });
  }

  return json({ error: "Method not allowed" }, 405);
};
