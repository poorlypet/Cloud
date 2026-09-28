# Poorly Pet Club and account: how points and vouchers should work

Written 28 Sep 2026 for the new account and Club pages (`account-*.html`, `club-*.html`, `club.js`).
All store facts below were read (read only) from the live store `bnq8ig-iq.myshopify.com` (www.poorly-pet.com)
through the Shopify Admin API and GemPages. Nothing in the store was changed.

---

## 1. What exists today

| Area | What the store has | Source |
|---|---|---|
| Customer accounts | **New customer accounts** (`customerAccountsVersion: NEW_CUSTOMER_ACCOUNTS`). Passwordless: email plus 6-digit code, hosted at `https://shopify.com/104740421964/account`. Login links shown, login not required at checkout. | `shop.customerAccountsV2` |
| Customer account pages | Orders, Profile, Settings, plus two app pages: "View my Reviews page" (Judge.me) and "Management page" (probably Subscriptions). | `customerAccountPages` |
| Own account page | GemPages page **Account Dashboard**, handle `account-dashboard` (`/pages/account-dashboard`), published 5 Jul 2026. A Free HTML/Liquid element. No `/pages/account`, `/pages/my-account`, `/pages/account-and-dogs` or `/pages/my-dogs` exist. | `gempages_list_pages`, `gempages_get_page` |
| How that page works | Liquid writes `window.PP_ACCT` (name, email, `orders_count`, default address, last 12 orders with status, total and items, and `customer.metafields.custom.dogs`). JS then calls an **App Proxy at `/apps/account`**: `GET ?action=bootstrap` (profile, orders, addresses, dogs) and `POST` actions `save-dogs`, `address-create`, `address-update`, `address-delete`, `profile-update`. Dog profiles (`name, breed, age, weight, conditions[]`, condition slugs match the shop-by-condition collections) are saved to `localStorage` key `pp_dogs_v1` and, when the proxy answers, to the customer metafield. | page code |
| The app behind the proxy | A custom app **"Poorly Pet Account"** (handle `poorly-pet-account`) is installed. Its server (where `/apps/account` is forwarded to) is not visible through the Admin API. | `appInstallations` |
| Dog data in Shopify | **No customer metafield definitions** exist, and none of the 50 most recently updated customers has a `custom.dogs` value (or any metafield). So dog profiles are, in practice, only in browsers today. | `metafieldDefinitions(ownerType: CUSTOMER)`, `customers` |
| Metaobjects | Only Shopify taxonomy types and `product_category_content`. No dog or loyalty metaobject. | `metaobjectDefinitions` |
| Loyalty app | **None.** No Smile, LoyaltyLion, Rivo, Joy, BON, Yotpo or similar installed. The Club (points, tiers, vouchers) exists only as signed-off design copy. | `appInstallations` |
| Other relevant apps | Judge.me Reviews, Klaviyo, Shopify Subscriptions, Shopify Messaging, Qikify Mega Menu, GemPages, Consentmo GDPR, Microsoft Clarity, Helm (Despatch Cloud), ReturnZap, Loop Returns, AfterShip Returns, Collective, Lincoln OS, SEO Bulk Updater. | `appInstallations` |
| Discounts | Three code discounts: `POORLYPET10` (10% off one-time items in "Discount Eligible", once per customer), `POORLY10` (10% off "Discount Eligible", £10 minimum, once per customer), `PS0BKR2ZCF5H` (100% off "Discount Eligible", usage limit 1, looks like a one-off manual code). No automatic discounts, no app discounts. | `discountNodes` |
| Webhooks | None registered for the connector app used here. Webhooks belong to each app, so the "Poorly Pet Account" app may have its own; they cannot be seen from here. | `webhookSubscriptions` |
| Order tracker | The track-my-order page uses a Cloudflare Worker (`poorlypet-track.green-mud-a533.workers.dev`), so there is already a Cloudflare account that could host the Club back end. | track-my-order.js |

**Consequences for the new pages**
- Sign in is one button to `/account/login` (in Liquid, `{{ routes.account_login_url }}`). A classic email and password form (`customer[email]`, `customer[password]`) will not work while new customer accounts are on. There is no separate register page and no password to reset.
- The storefront Liquid `customer` object still works on a GemPages page when the customer is signed in, so the new account page can be built the same way as `/pages/account-dashboard`.
- Dogs should move from `localStorage` to a real customer metafield (definition below). The new pages keep the same key and shape (`pp_dogs_v1`) and add `id` and `birthday`, so the live page keeps working.

---

## 2. Club rules (signed off, from `signed-off/home.html`)

| Rule | Value |
|---|---|
| Member (from first order) | 5 points per £1 |
| Regular (after £150 spent) | 6 points per £1, free delivery on every order |
| Committed (after £400 spent) | 8 points per £1, free delivery, first look at new brands |
| First order | Double points |
| Verified Judge.me review | 50 points |
| Referral | 500 points each when a friend places a first order |
| Dog's birthday | 250 points |
| Timing | Points added the day the order ships |
| Spending | 500 points = £5 off, 1,000 points = £10 off, no minimum spend |
| Early access | Members see sale prices a day early |

**Maths used in `club.js` (proposed; owner to confirm):**
- Order points = `floor(product subtotal after discounts, before delivery) × tier rate`, × 2 on the first order.
- Tier rate is the tier held **before** the order (spend to date). Crossing £150 upgrades the next order.
- Spend to date = sum of shipped order subtotals net of refunds. Pending orders do not count.
- Refund or return: take back `floor(refunded subtotal) × the rate that order earned at`. The balance may go negative; redemption waits until it is back above 500.
- 1 point = 1p in value, but only redeemable in 500 and 1,000 blocks.

**Decisions the owner still needs to make** (not in the signed-off copy, so not shown on the pages):
points expiry; voucher expiry; whether a Club voucher combines with POORLY10 or other codes; birthday points per dog or per account, and whether a birthday can be changed after it is set (to stop repeat claims); whether subscription orders earn; referral limits.

---

## 3. Recommended design (custom build)

### 3.1 Where things live

| Data | Store | Why |
|---|---|---|
| Points ledger (every earn, reversal, redemption) | **Cloudflare D1** table behind a Worker (same Cloudflare account as the order tracker), or the existing "Poorly Pet Account" app server if it has a database | Append-only, queryable, idempotent. Metafields are not a ledger. |
| Balance, tier, lifetime spend (snapshot) | Customer metafields `loyalty.points` (number_integer), `loyalty.tier` (single_line_text), `loyalty.spend` (number_decimal) | Liquid can show the balance instantly with no API call; Klaviyo and segments can read them. |
| Tier for discounts | Customer tags `club-member`, `club-regular`, `club-committed` | Customer segments (for free delivery and early access) can filter on tags. |
| Dogs | Customer metafield `custom.dogs` (type `json`), definition with storefront read access | Already read by the live page; add `birthday` (YYYY-MM-DD). A `dog` metaobject is only worth it if dogs need their own admin screens. |
| Vouchers | D1 `vouchers` table (code, value, points, discount id, created, used, order) | Shown in the account; the discount itself lives in Shopify. |

D1 tables (sketch):
```
ledger(id, customer_id, type, points, order_id, ref, created_at, pending, UNIQUE(customer_id, type, ref))
vouchers(code PRIMARY KEY, customer_id, value, points, discount_id, created_at, used_at, order_id)
referrals(code, customer_id, friend_customer_id, order_id, status)
```
`UNIQUE(customer_id, type, ref)` makes every webhook safe to receive twice (ref = order id, review id, `dogId:year`, etc.).

### 3.2 Events

| Event | Shopify / source | Action |
|---|---|---|
| Order placed | `orders/create` | Insert a **pending** ledger row (shown as "points on their way"). Record referral code from `note_attributes` (see referrals). Mark any `PPC-` code in `discount_codes` as used. |
| Order ships | `fulfillments/create` (first fulfilment of the order) or `orders/fulfilled` | Turn pending into earned: `floor(subtotal) × rate`, × 2 if first order. For partial fulfilment, earn on the fulfilled lines. Update spend, recompute tier, write metafields and tags. |
| Refund | `refunds/create` | Negative row for the refunded subtotal at that order's rate; reduce spend; recompute tier. |
| Cancel | `orders/cancelled` | Delete the pending row; if a Club code was used, recredit its points or recreate a code (owner choice). |
| Review | Judge.me webhook `review/created` (Judge.me supports webhooks on its paid plan; otherwise poll its API daily) | If `verified_buyer` and published, +50, one per product per customer. |
| Birthday | Worker **Cron Trigger** daily at 06:00 | For each customer whose `custom.dogs[].birthday` is today, +250 with ref `dogId:year`. Keep a small D1 index of birthdays (written on `save-dogs`) so the cron does not scan every customer. |
| Referral | Landing on `?ref=CODE` stores a cookie; theme JS copies it into cart attributes (`/cart/update.js` `attributes[ref]`), which arrive as `note_attributes` | On the friend's first order **shipping**: +500 to both, if the friend is a new customer and not the same email or address as the referrer. |
| New account | `customers/create` | Create a Member row (no points until the first order). |

Webhooks are registered by the app (`webhookSubscriptionCreate`, HMAC verified in the Worker). App Proxy calls are verified with the proxy `signature` and `logged_in_customer_id` parameters, so the browser never says who it is.

### 3.3 Redeeming (automatic voucher)

1. Account page: `POST /apps/account {action: "club-redeem", points: 500 | 1000}` (this is `PPClub.API.redeem` in `club.js`).
2. Server, inside one D1 transaction: check balance ≥ points; insert ledger row `-points`; generate `PPC-XXXX-XXXX` (8 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`).
3. Create the Shopify code:
```graphql
mutation($d: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $d) {
    codeDiscountNode { id }
    userErrors { field message }
  }
}
```
```json
{ "d": {
  "title": "Club £10 voucher PPC-7KQ2-M9XD",
  "code": "PPC-7KQ2-M9XD",
  "startsAt": "2026-09-28T10:00:00Z",
  "endsAt": null,
  "context": { "customers": { "add": ["gid://shopify/Customer/123"] } },
  "customerGets": { "value": { "discountAmount": { "amount": "10.00", "appliesOnEachItem": false } }, "items": { "all": true } },
  "minimumRequirement": null,
  "usageLimit": 1,
  "appliesOncePerCustomer": true,
  "combinesWith": { "productDiscounts": true, "orderDiscounts": false, "shippingDiscounts": true }
} }
```
   (`context` replaces the deprecated `customerSelection`. `items.all` versus the existing "Discount Eligible" collection is an owner choice.)
4. If Shopify returns `userErrors`, roll back the ledger row. Otherwise store the voucher and return `{code, value, points, balance}`.
5. The page shows the code with **Copy code** and **Add to basket** (`/discount/CODE?redirect=/cart` applies it to the cart).
6. `orders/create` marks the voucher used; the account moves it to "Used vouchers".

Needs the app scopes `write_discounts`, `read_orders`, `read_customers`, `write_customers` (metafields and tags).

### 3.4 Tier perks
- **Free delivery (Regular, Committed):** one automatic free-shipping discount whose `context` is a customer segment `customer_tags CONTAINS 'club-regular' OR customer_tags CONTAINS 'club-committed'`. Only works when the customer is signed in at checkout.
- **Sale prices a day early:** the sale's automatic discount goes live a day earlier for the segment `club-member OR club-regular OR club-committed`, then for everyone.
- **First look at new brands:** a collection shown only when the Liquid `customer.tags` contains `club-committed`.

### 3.5 Showing it in the account
- Fast path: Liquid reads `customer.metafields.loyalty.points` and `loyalty.tier` for the header and tiles.
- Full path: `GET /apps/account?action=club` returns `{spend, balance, ledger[], vouchers[], referralUrl}`, which `club.js` already renders (set `PPClub.API.endpoint = "/apps/account"`).
- Optional: the same UI as a customer account full-page extension, so it also appears inside Shopify's hosted account next to Orders and Profile.

---

## 4. Would a loyalty app be simpler?

**Yes, for the points engine.** Smile.io, LoyaltyLion, Rivo, Joy and BON all do points per £, VIP tiers by spend, referrals with fraud checks, birthday rewards, Judge.me review points, refund reversals, and automatic single-use customer codes, and all work with new customer accounts. Check current plan prices and which plans include tiers, referrals and the Judge.me integration before choosing.

| | Loyalty app | Custom (Worker + D1) |
|---|---|---|
| Time to launch | Days | Several weeks, plus testing refunds, partial fulfilments, cancels |
| Monthly cost | Plan fee, usually higher for tiers and API access | Hosting close to nil; developer time instead |
| Edge cases and fraud | Handled and maintained by the app | Yours to find and fix |
| Look and feel | App widget, or its API / JS SDK to drive these pages | Exactly the signed-off design |
| Data | In the app; export if you leave | Yours |
| Birthday per dog | Usually one birthday per customer | Any rule you like |
| Tier perks (free delivery, early access) | Some apps apply perks; others only tag customers, and the segments above are still needed | As in 3.4 |

**Recommendation:** use a loyalty app with a storefront API (so the new account and Club pages keep this design and read the balance, tier and vouchers from it), and keep the custom "Poorly Pet Account" app for what an app cannot do: dog profiles in `custom.dogs`, per-dog birthday points (posted to the app as a custom activity), and the dog-based product picks. Go fully custom only if the plan price for tiers plus API is more than the ongoing cost of maintaining the edge cases.

---

## 5. Prototype plug-in points

- `club.js`: `PPClub.API.endpoint` (null = mock). `getAccount()` and `redeem(points)` are the only two calls. The example member lives in `EXAMPLE` and `localStorage` key `pp_club_example_v1`.
- `account.js`: `EXAMPLE` customer and `ORDERS` at the top; replace with `window.PP_ACCT` from Liquid or the `bootstrap` proxy call. `saveDogs()` has the `save-dogs` call marked.
- `account-sign-in.html`: sign in button to `/account/login`; comment in the file explains why there is no password form.
