/* Netlify function: ask Claude to outline the customer's home on the aerial photo.
   The page sends a cropped roof photo (JPEG, base64) with a red dot on the home,
   a labelled pixel grid, the scale and the type of home. Claude returns two
   outlines in the photo's pixels: the home's roof and the property boundary.
   Needs ANTHROPIC_API_KEY set in Netlify (Site configuration > Environment variables). */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const POINT = {
  type: "object",
  properties: { x: { type: "number" }, y: { type: "number" } },
  required: ["x", "y"],
  additionalProperties: false
};
const SCHEMA = {
  type: "object",
  properties: {
    house: { type: "array", items: POINT, description: "Outline of the roof of the one home the red dot is on, clockwise" },
    plot: { type: "array", items: POINT, description: "Property boundary of that home: the home plus its own front and back garden or driveway, clockwise" },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["house", "plot", "confidence"],
  additionalProperties: false
};

const TYPES = {
  detached: "a detached house (no shared walls)",
  semi: "a semi-detached house (one shared wall with the house next door)",
  end: "an end-of-terrace house (one shared wall, at the end of a row)",
  terrace: "a mid-terrace house (shared walls on both sides)"
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  const allowed = process.env.ALLOWED_ORIGIN;   // optional: e.g. https://yoursite.co.uk
  if (allowed && req.headers.get("origin") !== allowed) return json({ error: "Not allowed" }, 403);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const { image, width, height, pin, metresPerPixel, homeType, grid } = b || {};
  if (typeof image !== "string" || image.length > 4_000_000 || !/^[A-Za-z0-9+/=]+$/.test(image) ||
      !(width > 0 && height > 0 && pin && pin.x >= 0 && pin.y >= 0 && metresPerPixel > 0)) {
    return json({ error: "Bad request" }, 400);
  }

  const houseWidthPx = Math.round(5.5 / metresPerPixel);
  const prompt = [
    `This is a straight-down aerial photo of homes in the UK, north at the top. It is ${width} x ${height} pixels and 1 pixel is ${metresPerPixel.toFixed(3)} metres.`,
    `Thin grid lines are drawn every ${grid} pixels, labelled with their pixel position along the top and left edges. Use them to read coordinates accurately.`,
    `The red dot at x=${Math.round(pin.x)}, y=${Math.round(pin.y)} marks the customer's home. It is ${TYPES[homeType] || "a house"}.`,
    "",
    "Return two outlines, in this image's pixel coordinates, each going clockwise:",
    "1. house: the edge of the roof of the one home the red dot is on. Follow the roof's eaves. Where the roof joins a neighbour's roof, stop at the party wall: the line where the roof colour, texture, ridge or chimney changes between the two homes." +
      ` A typical UK terraced or semi-detached home is about ${houseWidthPx} pixels wide. Include the home's own rear extension or porch if it clearly belongs to it. Use 4 to 16 points.`,
    "2. plot: the property boundary of that home: the home plus its own front garden or driveway and its own back garden, following fences, hedges, walls and the edge of the pavement. Do not include the road, the pavement or a neighbour's garden. Use 4 to 20 points.",
    "Set confidence to low if you cannot tell where this home ends."
  ].join("\n");

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
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
