# PP customer service centre

A website for the Poorly Pet team. It reads customer emails, writes a draft reply for each, and a person checks and sends it.

**Step 2 added:** Gmail connection, reading the inbox every 3 minutes, and sorting customer emails from supplier, marketing and spam. Drafts and sending come next.

**Step 1:** the portal itself, with sign in, the queue, the summary, the draft editor, the DO NOT SEND blocker and the team page. It runs on sample emails. Gmail, Shopify, tracking and the AI come in steps 2 to 5. Sending is switched off.

## What is in step 1
- Email and password sign in. The owner is created once with a setup code. The owner adds staff on the Team page.
- Inbox sorted by priority (urgent, high, normal, low) with how long each customer has waited.
- For each email: a PP summary (order, date, pet, issue, what they want), the full conversation, a customer panel, and a draft reply.
- Refund or return emails ask "what are we offering?" first, then write the reply around your answer.
- Gaps a person must fill in (tracking number and so on) show as red boxes, with a red DO NOT SEND banner. Send then asks you to confirm.
- Em dashes are removed from every draft on the server, whatever the AI or a person types.
- Everything the team does is shared and logged.

## Run it on your own computer
```
npm install
echo 'SETUP_TOKEN=pick-any-code' > .dev.vars
npm run db:local
npm run dev        # http://localhost:8787
npm test           # checks no sample reply has a dash
```

## Put it online (Cloudflare)
1. `npx wrangler login`
2. `npx wrangler d1 create pp-service-centre`, then paste the `database_id` it prints into `wrangler.toml`.
3. `npm run db:remote` to create the tables.
4. `npx wrangler secret put SETUP_TOKEN` and enter a code only you know.
5. `npm run deploy`, then open the web address it prints and create the owner login.
6. Optional: in Cloudflare, put the site behind a custom address such as `service.poorly-pet.com`.

Secrets (passwords, tokens, API keys) are only ever entered in the Cloudflare dashboard or with `wrangler secret put`. They are never stored in this repository.

## Step 2: connect Gmail (one-off set up)
Do this once, as the Google Workspace admin for poorly-pet.com.

1. Go to console.cloud.google.com, create a project called "PP customer service centre".
2. APIs and services, Library: enable **Gmail API**.
3. APIs and services, OAuth consent screen: choose **Internal** (this means only people in your Workspace can use it, and no Google review is needed). Add the scope `.../auth/gmail.readonly`.
4. Credentials, Create credentials, **OAuth client ID**, type **Web application**. Under "Authorised redirect URIs" add `https://YOUR-PORTAL-ADDRESS/api/gmail/callback` (the address wrangler printed, or your custom one).
5. Copy the client ID and client secret. In your terminal run, one at a time (each asks you to type or paste the value, nothing goes in a file):
   ```
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put ENCRYPTION_KEY      # any long random string, 32+ characters
   npx wrangler secret put ANTHROPIC_API_KEY   # from console.anthropic.com
   ```
6. `npm run db:remote` again (it adds the new tables safely) and `npm run deploy`.
7. Sign in as the owner, click **Connect Gmail**, choose hello@poorly-pet.com and allow read access.

What it can do with that permission: **read** the mailbox only. It cannot send, delete or change anything yet. Step 4 asks for send permission separately, so you approve it again then.

Without an Anthropic key the portal still works, using simple word rules to sort emails. The AI is better at the grey cases.

**How sorting works.** Free rules first (a bulk mailing with an unsubscribe link is marketing), then the AI for the rest. Shopify contact form emails use the customer's address, not Shopify's. If you move an email to or from Ignored, the portal remembers that sender (or the whole domain for suppliers) and it is never overruled by the AI. Anything it is unsure about is treated as a customer, so a real customer is never hidden.

**Local testing without Google.** `node test/mock-google.mjs` starts a pretend Google and AI, `npm run dev` points at it through `.dev.vars`, and `node --no-warnings test/gmail-sync.test.mjs` checks the reading, sorting and learning end to end.

## Next steps
2. DONE: Connect Gmail (read, sort customer from supplier and marketing).
3. Shopify order lookups, courier tracking, and the AI drafts.
4. Sending from hello@poorly-pet.com with your Gmail signature, labels and archive.
5. Happiness dashboard and finishing touches.

## Step 3: Shopify lookups and AI drafts

The portal looks up the customer's order and history in Shopify and the AI writes a draft reply for a person to check.

### Shopify setup (Dev Dashboard app)
1. Create an app in the Shopify Dev Dashboard with scopes `read_orders,read_customers` and install it on the store.
2. Enter the app's client ID and secret as Cloudflare secrets (never in chat or in files):
   ```
   npx wrangler secret put SHOPIFY_CLIENT_ID
   npx wrangler secret put SHOPIFY_CLIENT_SECRET
   ```
3. `SHOPIFY_SHOP` is set in `wrangler.toml` `[vars]`.

Notes:
- Without `read_all_orders`, only orders from the last 60 days are visible.
- Evri: the portal shows the tracking number and link that Shopify holds. It does not read live Evri events. If an order has no tracking number recorded, the draft gets a red "DO NOT SEND until you add: tracking number" blocker.

### Drafting
- `ANTHROPIC_API_KEY` is needed. Models: `CLASSIFIER_MODEL` (default claude-haiku-5-5), `DRAFT_MODEL` (default claude-sonnet-5-5).
- Drafts never contain em dashes. Order numbers, tracking numbers and amounts that are not in Shopify or the knowledge text are turned into gaps for a person to fill.
- Settings page (owner edits): tone guide, pasted example replies, and the knowledge text (delivery, returns, FAQs). Defaults come from the website.
- Refunds and returns: the AI summarises, a person picks the offer (or types a custom one), and the AI writes the reply around it.
- Sending is still switched off.
