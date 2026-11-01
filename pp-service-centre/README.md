# PP customer service centre

A website for the Poorly Pet team. It reads customer emails, writes a draft reply for each, and a person checks and sends it.

**Step 1 (this version):** the portal itself, with sign in, the queue, the summary, the draft editor, the DO NOT SEND blocker and the team page. It runs on sample emails. Gmail, Shopify, tracking and the AI come in steps 2 to 5. Sending is switched off.

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

## Next steps
2. Connect Gmail (read, sort customer from supplier and marketing).
3. Shopify order lookups, courier tracking, and the AI drafts.
4. Sending from hello@poorly-pet.com with your Gmail signature, labels and archive.
5. Happiness dashboard and finishing touches.
