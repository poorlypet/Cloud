/* Netlify function: ask Claude where the customer's home starts and ends.
   The page sends Google's roof photo, turned so the row of homes runs left to
   right, with numbered lines every metre and a red dot on the home. Claude picks
   the line at each end of this home's roof (its party walls). Google's own roof
   outline then gives the exact edges.
   Needs ANTHROPIC_API_KEY set in Netlify (Site configuration > Environment variables). */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SCHEMA = {
  type: "object",
  properties: {
    joined: { type: "string", enum: ["none", "left", "right", "both"], description: "Which sides the customer's home shares a wall and roof with a neighbour" },
    leftLine: { type: "integer", description: "Numbered line nearest the left end of the customer's home roof" },
    rightLine: { type: "integer", description: "Numbered line nearest the right end of the customer's home roof" },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["joined", "leftLine", "rightLine", "confidence"],
  additionalProperties: false
};

const TYPES = { semi: "semi-detached", end: "end of terrace", terrace: "mid-terrace", detached: "detached" };

// The storefront may be on another address (e.g. Shopify), so browsers need these headers.
const CORS = { "access-control-allow-origin": process.env.ALLOWED_ORIGIN || "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, OPTIONS" };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } });

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  const allowed = process.env.ALLOWED_ORIGIN;   // optional: e.g. https://yoursite.co.uk
  if (allowed && req.headers.get("origin") !== allowed) return json({ error: "Not allowed" }, 403);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const { image, metres, lines, homeType } = b || {};
  if (typeof image !== "string" || image.length > 4_000_000 || !/^[A-Za-z0-9+/=]+$/.test(image) || !(metres > 0) || !(lines > 1)) {
    return json({ error: "Bad request" }, 400);
  }
  const prompt = [
    `Aerial photo looking straight down at UK homes, turned so the row of homes runs left to right. It covers ${metres} metres across. The ${lines} numbered cyan lines are 1 metre apart. The red dot is on the roof of the customer's home. The customer says it is ${TYPES[homeType] || "a house"}. Roof measurements show this roof carries on into the neighbouring home${homeType === "terrace" ? "s on both sides" : ""}, so it is joined: find the party wall${homeType === "terrace" ? "s" : ""}.`,
    "",
    "Find where the customer's home starts and ends along the row. Clues for where one home ends and the next begins: a gap between buildings, a step or change in the roof, a chimney, a change in roof colour or tiles, and the fences, walls and hedges dividing front gardens and driveways (each home usually has its own). UK terraced homes are usually 4.5 to 6 metres wide, semi-detached homes 6 to 9 metres.",
    "",
    "Give the numbered line nearest each end of the customer's home roof."
  ].join("\n");

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
          { type: "text", text: prompt }
        ]
      }]
    });
    if (response.stop_reason === "refusal") return json({ error: "Declined" }, 422);
    if (response.stop_reason === "max_tokens") return json({ error: "Incomplete answer" }, 502);
    const text = response.content.filter((c) => c.type === "text").map((c) => c.text).join("");
    const out = JSON.parse(text);
    return json(out);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: "Busy, try again" }, 429);
    if (err instanceof Anthropic.APIError) return json({ error: "AI unavailable" }, 502);
    if (err instanceof SyntaxError) return json({ error: "Unreadable answer" }, 502);
    throw err;
  }
};
