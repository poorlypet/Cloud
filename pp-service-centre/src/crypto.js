// Small crypto helpers. The Gmail refresh token is stored encrypted, and the sign-in link to Google is signed.
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (buf) => b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function aesKey(secret) {
  // the secret can be any string at least 32 characters long, it is hashed to a 256 bit key
  if (!secret || secret.length < 32) throw new Error("ENCRYPTION_KEY must be at least 32 characters");
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
export async function encrypt(plain, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), enc.encode(plain));
  return b64(iv) + "." + b64(ct);
}
export async function decrypt(blob, secret) {
  const [iv, ct] = String(blob).split(".");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(secret), unb64(ct));
  return dec.decode(pt);
}
export async function sign(text, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}
export async function makeState(userId, secret) {
  const body = `${userId}.${Date.now()}.${b64url(crypto.getRandomValues(new Uint8Array(12)))}`;
  return body + "." + (await sign(body, secret));
}
export async function checkState(state, secret, maxAgeMs = 10 * 60 * 1000) {
  const parts = String(state || "").split(".");
  if (parts.length !== 4) return null;
  const body = parts.slice(0, 3).join(".");
  const want = await sign(body, secret);
  if (want.length !== parts[3].length || want !== parts[3]) return null;
  if (Date.now() - Number(parts[1]) > maxAgeMs) return null;
  return Number(parts[0]);
}
