// Fake Gmail threads in the exact shape the Gmail API returns, used by the tests and by the local mock Google server.
const b64u = (s) => Buffer.from(s, "utf8").toString("base64url");
const NOW = Date.now(), H = 3600000;
export const MAILBOX = "hello@poorly-pet.com";

function msg({ id, thread, from, to = MAILBOX, replyTo, subject, ageH, plain, html, extra = [], attachments = [], labels = ["INBOX"] }) {
  const headers = [{ name: "From", value: from }, { name: "To", value: to }, { name: "Subject", value: subject }, { name: "Date", value: new Date(NOW - ageH * H).toUTCString() }, ...extra];
  if (replyTo) headers.push({ name: "Reply-To", value: replyTo });
  const parts = [];
  if (plain != null) parts.push({ mimeType: "text/plain", body: { data: b64u(plain), size: plain.length } });
  if (html != null) parts.push({ mimeType: "text/html", body: { data: b64u(html), size: html.length } });
  for (const a of attachments) parts.push({ mimeType: a.mime, filename: a.name, body: { attachmentId: "att-" + a.name, size: a.size } });
  return { id, threadId: thread, labelIds: labels, internalDate: String(NOW - ageH * H), payload: { mimeType: "multipart/mixed", headers, parts } };
}

export const THREADS = [
  { id: "th-angry", historyId: "101", messages: [
    msg({ id: "m1", thread: "th-angry", from: "Helen Marsh <helen.marsh@example.com>", subject: "Re: Order PP-10431", ageH: 100, plain: "Where is my order PP-10431? It was due Monday for my dog Barney." }),
    msg({ id: "m2", thread: "th-angry", from: MAILBOX, to: "helen.marsh@example.com", subject: "Re: Order PP-10431", ageH: 98, plain: "Hi Helen, sorry for the wait, we are checking with the courier." }),
    msg({ id: "m3", thread: "th-angry", from: "Helen Marsh <helen.marsh@example.com>", subject: "Re: Order PP-10431", ageH: 2, plain: "This is disgusting service. If I do not get a full refund by tomorrow I will dispute the payment with my bank and leave reviews everywhere.\n\nOn Mon, 12 Oct 2026 at 10:02, Poorly Pet <hello@poorly-pet.com> wrote:\n> Hi Helen, sorry for the wait" })
  ] },
  { id: "th-wismo", historyId: "102", messages: [
    msg({ id: "m4", thread: "th-wismo", from: "Aisha Rahman <aisha.r@example.com>", subject: "Where is my order PP-10466?", ageH: 5, plain: "Hello, I ordered a ramp for my Labrador Kito and it has not arrived. Can you tell me where the parcel is? Thanks, Aisha" })
  ] },
  { id: "th-form", historyId: "103", messages: [
    msg({ id: "m5", thread: "th-form", from: "Shopify <mailer@shopify.com>", replyTo: "Tom Whitaker <tom.w@example.com>", subject: "New customer message on Poorly Pet", ageH: 6, plain: "Name: Tom Whitaker\nEmail: tom.w@example.com\n\nHi, the hock brace for my dog Biscuit arrived torn at the strap. Order #10459. Photos to follow." })
  ] },
  { id: "th-supplier", historyId: "104", messages: [
    msg({ id: "m6", thread: "th-supplier", from: "Karnlea Accounts <accounts@karnlea.example>", subject: "Invoice 2290 for October", ageH: 8, plain: "Please find attached invoice 2290 for October supplies. Payment terms 30 days.", attachments: [{ name: "invoice-2290.pdf", mime: "application/pdf", size: 48213 }] })
  ] },
  { id: "th-news", historyId: "105", messages: [
    msg({ id: "m7", thread: "th-news", from: "Pet Trade Weekly <news@pettrade.example>", subject: "This week in pet retail", ageH: 10, plain: "Top stories this week. Unsubscribe any time.", extra: [{ name: "List-Unsubscribe", value: "<mailto:unsub@pettrade.example>" }], labels: ["INBOX", "CATEGORY_PROMOTIONS"] })
  ] },
  { id: "th-seo", historyId: "106", messages: [
    msg({ id: "m8", thread: "th-seo", from: "Dan at RankBoost <dan@seo-offers.example>", subject: "Get your shop to page 1 of Google", ageH: 12, plain: "We can rank your website at the top of Google in 30 days with guaranteed backlinks. Reply for a free audit." })
  ] },
  { id: "th-replied", historyId: "107", messages: [
    msg({ id: "m9", thread: "th-replied", from: "Priya Shah <priya.shah@example.com>", subject: "Return the joint chews?", ageH: 30, plain: "Can I return the joint chews for my dog Mango? She will not eat them." }),
    msg({ id: "m10", thread: "th-replied", from: MAILBOX, to: "priya.shah@example.com", subject: "Re: Return the joint chews?", ageH: 20, plain: "Hi Priya, yes of course, here is how to return them." })
  ] },
  { id: "th-html", historyId: "108", messages: [
    msg({ id: "m11", thread: "th-html", from: "Caroline Doyle <c.doyle@example.com>", subject: "Neck brace size for my cat", ageH: 3, html: "<html><body><style>p{color:red}</style><p>Hi,</p><p>Which size neck brace for my 4kg cat Pickle?&nbsp;Thank you</p><br><div class=\"gmail_quote\">On Tue, someone wrote:</div></body></html>" })
  ] }
];
export const LIST = THREADS.map((t) => ({ id: t.id, historyId: t.historyId }));
export const byId = Object.fromEntries(THREADS.map((t) => [t.id, t]));
