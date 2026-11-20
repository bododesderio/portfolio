// Registers (idempotently) the two Brevo webhooks the site needs:
//   transactional -> /api/webhooks/brevo          (delivered, bounces, spam, unsubscribes)
//   inbound       -> /api/webhooks/brevo-inbound  (mail sent to any @domain address)
// Reads BREVO_API_KEY, EMAIL_WEBHOOK_SECRET and NEXT_PUBLIC_SITE_URL from the
// environment. Brevo only accepts API calls from authorised IPs, so run it on
// the server:  set -a && . ./.env && set +a && node scripts/register-brevo-webhooks.mjs
const key = process.env.BREVO_API_KEY
const secret = process.env.EMAIL_WEBHOOK_SECRET
const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com').replace(/\/$/, '')
if (!key || !secret) {
  console.error('BREVO_API_KEY and EMAIL_WEBHOOK_SECRET must both be set.')
  process.exit(1)
}
const domain = new URL(site).hostname.replace(/^www\./, '')
const mask = (url) => url.replace(secret, `${secret.slice(0, 4)}...`)

const wanted = [
  {
    type: 'transactional',
    url: `${site}/api/webhooks/brevo?token=${secret}`,
    description: `${domain} delivery events`,
    events: ['delivered', 'hardBounce', 'softBounce', 'blocked', 'spam', 'invalid', 'deferred', 'unsubscribed'],
  },
  {
    type: 'inbound',
    url: `${site}/api/webhooks/brevo-inbound?token=${secret}`,
    description: `Forward mail sent to @${domain}`,
    events: ['inboundEmailProcessed'],
    domain,
  },
]

async function brevo(method, path, body) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method,
    headers: { 'api-key': key, accept: 'application/json', 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { ok: res.ok, status: res.status, json: text ? JSON.parse(text) : {} }
}

for (const hook of wanted) {
  const existing = await brevo('GET', `/webhooks?type=${hook.type}`)
  if (!existing.ok) {
    console.error(`Listing ${hook.type} webhooks failed (${existing.status})`, existing.json)
    process.exitCode = 1
    continue
  }
  const match = (existing.json.webhooks ?? []).find((h) => h.url === hook.url)
  if (match) {
    console.log(`Already registered ${hook.type} (id=${match.id}): ${mask(hook.url)}`)
    continue
  }
  const created = await brevo('POST', '/webhooks', hook)
  if (!created.ok) {
    console.error(`Creating ${hook.type} webhook failed (${created.status})`, created.json)
    process.exitCode = 1
  } else console.log(`Registered ${hook.type} (id=${created.json.id}): ${mask(hook.url)}`)
}
