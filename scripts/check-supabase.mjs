import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

// Read-only check against the configured project. Never print keys or user data.
const url = process.env.NUXT_SUPABASE_URL
const key = process.env.NUXT_SUPABASE_ANON_KEY
assert.ok(url && key, 'Isi environment Supabase terlebih dahulu.')
let role = ''
if (key.split('.').length === 3) {
  role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role
}
assert.ok(!key.startsWith('sb_secret_') && role !== 'service_role', 'Gunakan publishable/anon key.')

const base = 'http://127.0.0.1:3198'
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: { ...process.env, HOST: '127.0.0.1', PORT: '3198' },
  stdio: 'ignore',
})
try {
  let ready = false
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base + '/api/auth/me', { signal: AbortSignal.timeout(3000) })
      ready = true
      break
    } catch {
      await setTimeout(200)
    }
  }
  assert.ok(ready, 'Server belum siap. Jalankan npm run build terlebih dahulu.')
  const response = await fetch(base + '/api/concerts')
  assert.equal(response.status, 200, 'Concert API')
  const concerts = await response.json()
  assert.ok(Array.isArray(concerts), 'Concert response must be an array')
  for (const concert of concerts) {
    assert.ok(Array.isArray(concert.ticket_categories), 'Embedded categories')
    assert.equal((await fetch(base + '/api/concerts/' + concert.id)).status, 200)
    const page = await fetch(base + '/concerts/' + concert.id)
    assert.equal(page.status, 200, 'Concert detail SSR')
    assert.ok((await page.text()).includes('Titip tiketmu'), 'Concert detail content')
  }
  assert.equal((await fetch(base + '/')).status, 200, 'Home SSR')
  assert.equal((await fetch(base + '/api/orders')).status, 401, 'Anonymous order access')
  assert.equal((await fetch(base + '/api/customers')).status, 401, 'Anonymous customer access')
  assert.equal((await fetch(base + '/api/concerts?admin=true')).status, 401, 'Admin concert access')
  const whatsapp = await (await fetch(base + '/api/whatsapp')).json()
  assert.ok(whatsapp.url && new URL(whatsapp.url).hostname === 'wa.me', 'WhatsApp configuration')
  for (const table of ['profiles', 'orders', 'order_status_history']) {
    const result = await fetch(new URL('/rest/v1/' + table + '?select=id&limit=0', url), {
      headers: { apikey: key },
    })
    assert.ok([401, 403].includes(result.status), 'Anonymous access to ' + table)
  }
  console.log(
    'PASS: live Supabase + Nitro, concert/category data, detail SSR, anonymous access denied, WhatsApp config. Concerts: ' +
      concerts.length,
  )
} finally {
  child.kill()
}
