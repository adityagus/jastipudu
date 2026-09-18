import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'
const port = 3199
const base = 'http://127.0.0.1:' + port
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    PORT: String(port),
    HOST: '127.0.0.1',
    NUXT_SUPABASE_URL: '',
    NUXT_SUPABASE_ANON_KEY: '',
  },
  stdio: 'pipe',
})
let logs = ''
child.stderr.on('data', (chunk) => {
  logs += chunk
})
try {
  let ready = false
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base + '/api/auth/me')
      ready = true
      break
    } catch {
      await setTimeout(200)
    }
  }
  assert.ok(ready, 'Server did not start: ' + logs)
  for (const page of ['/', '/concerts', '/cara-kerja', '/testimoni', '/login', '/register']) {
    const response = await fetch(base + page)
    assert.equal(response.status, 200, page)
    assert.ok((await response.text()).includes('titip'), page)
  }
  for (const page of [
    '/dashboard',
    '/orders',
    '/profile',
    '/admin',
    '/admin/concerts',
    '/admin/orders',
  ]) {
    const response = await fetch(base + page, { redirect: 'manual' })
    assert.equal(response.status, 302, page)
    assert.ok(response.headers.get('location').startsWith('/login'), page)
  }
  assert.equal((await fetch(base + '/api/concerts')).status, 503)
  assert.equal((await fetch(base + '/api/admin/overview')).status, 503)
  assert.equal((await fetch(base + '/api/admin/concerts/lookup?q=radiohead')).status, 503)
  assert.equal(
    (
      await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.invalid' },
        body: '{}',
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: base },
        body: '{}',
      })
    ).status,
    422,
  )
  console.log(
    'PASS: public SSR pages, protected redirects, missing-config response, CSRF rejection, input validation',
  )
} finally {
  child.kill()
}
