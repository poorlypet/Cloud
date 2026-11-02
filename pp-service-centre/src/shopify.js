// Read-only look ups in Shopify: an order by its number, and a customer's recent orders by email.
// Uses a Dev Dashboard app with the client credentials grant, so the app only ever holds a short lived token.
const VERSION = (env) => env.SHOPIFY_API_VERSION || "2026-10";
const base = (env) => env.SHOPIFY_BASE || `https://${env.SHOPIFY_SHOP}`;

let cached = null;
async function token(env) {
  if (cached && cached.exp > Date.now() + 120000) return cached.token;
  const r = await fetch(`${base(env)}/admin/oauth/access_token`, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.SHOPIFY_CLIENT_ID, client_secret: env.SHOPIFY_CLIENT_SECRET, grant_type: "client_credentials" })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error("Shopify would not give access (" + r.status + ")");
  cached = { token: d.access_token, exp: Date.now() + (d.expires_in || 86399) * 1000 };
  return cached.token;
}
export const clearShopifyToken = () => { cached = null; };
export const shopifyReady = (env) => !!(env.SHOPIFY_SHOP && env.SHOPIFY_CLIENT_ID && env.SHOPIFY_CLIENT_SECRET);

async function gql(env, query, variables) {
  const r = await fetch(`${base(env)}/admin/api/${VERSION(env)}/graphql.json`, {
    method: "POST", headers: { "content-type": "application/json", "x-shopify-access-token": await token(env) }, body: JSON.stringify({ query, variables })
  });
  if (r.status === 401) clearShopifyToken();
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.errors) throw new Error("Shopify lookup failed: " + (d.errors ? JSON.stringify(d.errors).slice(0, 200) : r.status));
  return d.data;
}

const ORDER = `name createdAt cancelledAt displayFinancialStatus displayFulfillmentStatus returnStatus
  totalPriceSet{shopMoney{amount currencyCode}} totalRefundedSet{shopMoney{amount}} shippingLine{title}
  customer{ displayName numberOfOrders amountSpent{amount} createdAt defaultEmailAddress{emailAddress} }
  shippingAddress{ city zip }
  lineItems(first:8){nodes{title quantity variantTitle}}
  fulfillments(first:5){ createdAt status displayStatus deliveredAt estimatedDeliveryAt inTransitAt trackingInfo(first:3){company number url} }`;

const money = (m) => (m && m.shopMoney ? Number(m.shopMoney.amount) : 0);
export function shapeOrder(o) {
  const f = (o.fulfillments || []).map((x) => ({
    dispatched: x.createdAt, status: x.displayStatus || x.status, delivered: x.deliveredAt, estimatedDelivery: x.estimatedDeliveryAt, inTransit: x.inTransitAt,
    tracking: (x.trackingInfo || []).map((t) => ({ company: t.company, number: t.number, url: t.url }))
  }));
  return {
    name: o.name, created: o.createdAt, cancelled: o.cancelledAt, payment: o.displayFinancialStatus, fulfilment: o.displayFulfillmentStatus, returnStatus: o.returnStatus,
    total: money(o.totalPriceSet), refunded: money(o.totalRefundedSet), shipping: o.shippingLine ? o.shippingLine.title : null,
    customer: o.customer ? { name: o.customer.displayName, email: o.customer.defaultEmailAddress && o.customer.defaultEmailAddress.emailAddress, orders: Number(o.customer.numberOfOrders) || 0, spent: Number(o.customer.amountSpent && o.customer.amountSpent.amount) || 0, since: o.customer.createdAt } : null,
    city: o.shippingAddress ? o.shippingAddress.city : null,
    items: ((o.lineItems && o.lineItems.nodes) || []).map((i) => ({ title: i.title, qty: i.quantity, variant: i.variantTitle })), fulfillments: f
  };
}

export async function orderByName(env, name) {
  const n = String(name).replace(/^#?/, "#");
  const d = await gql(env, `query($q:String!){ orders(first:3, query:$q){ nodes{ ${ORDER} } } }`, { q: `name:${n}` });
  const hit = d.orders.nodes.map(shapeOrder).find((o) => o.name.toLowerCase() === n.toLowerCase());
  return hit || null;
}
export async function ordersByEmail(env, email, limit = 5) {
  const d = await gql(env, `query($q:String!,$n:Int!){ orders(first:$n, query:$q, sortKey:CREATED_AT, reverse:true){ nodes{ ${ORDER} } } }`, { q: `email:${email}`, n: limit });
  return d.orders.nodes.map(shapeOrder);
}
