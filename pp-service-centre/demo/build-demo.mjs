// Builds one self-contained demo page (no server) from the real portal files. Run: node demo/build-demo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { THREADS } from "../src/sample.js";
const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const now = Date.now();
const noDashSrc = read("src/nodash.js").replace(/export /g, "");
let app = read("public/app.js")
  .replace(/#\/inbox\//g, "#inbox--").replace(/"#\/(inbox|team|dashboard)"/g, '"#$1"').replace(/href="#\/(\w+)"/g, 'href="#$1"')
  .replace('.split("/")', '.split(/\\/|--/)');
const css = read("public/app.css") + "\n.card::after{content:'Demo only: any email and password signs you in.';display:block;margin-top:14px;color:var(--mute);font-size:13px}\n";
const html = `<title>PP customer service centre</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Domine:wght@400;600;700&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${css}
body{margin:0;background:var(--pale);color:var(--ink)}
</style>
<div id="app"></div>
<script>
window.__DEMO = { now: ${now}, threads: ${JSON.stringify(THREADS(now))} };
${noDashSrc}
</script>
<script>
${readFileSync(new URL("demo/mock-api.js", root), "utf8")}
</script>
<script type="module">
${app}
</script>`;
writeFileSync(new URL("demo/demo.html", root), html);
console.log("demo built", (html.length / 1024).toFixed(0) + " KB");
