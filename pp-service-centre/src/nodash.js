// Replies must never contain em dashes (or en dashes used like them).
// This is the last line of defence: every draft is passed through here before a person sees it or it is sent.
export function noDash(text) {
  if (text == null) return text;
  return String(text)
    .replace(/\s*—\s*/g, ", ")          // em dash with or without spaces
    .replace(/\s+–\s+/g, ", ")          // spaced en dash used as a dash
    .replace(/(\d)–(\d)/g, "$1-$2")     // ranges such as 2-3 days
    .replace(/–/g, "-")                 // any other en dash
    .replace(/―|⸺|⸻/g, ", ")  // horizontal bar and other long dashes
    .replace(/,\s*,/g, ",")
    .replace(/ {2,}/g, " ");
}
export function hasDash(text) {
  return /[—–―⸺⸻]/.test(String(text || ""));
}
