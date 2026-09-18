import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import assert from 'node:assert/strict'

const db = new PGlite()
await db.exec(`
 create role anon; create role authenticated;
 create schema auth;
 create schema storage;
 create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner_id uuid);
 alter table storage.objects enable row level security;
 create table auth.users(id uuid primary key, raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth to anon,authenticated;
 grant execute on function auth.uid() to anon,authenticated;
 -- Match hosted Supabase defaults so tests detect inherited direct function grants.
 alter default privileges in schema public grant execute on functions to anon,authenticated;
`)
const migrationDir = new URL('../supabase/migrations/', import.meta.url)
for (const file of (await readdir(migrationDir)).filter((f) => f.endsWith('.sql')).sort()) {
  await db.exec(await readFile(new URL(file, migrationDir), 'utf8'))
}
await db.exec(await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8'))
const customer = '30000000-0000-4000-8000-000000000001'
const other = '30000000-0000-4000-8000-000000000002'
const admin = '30000000-0000-4000-8000-000000000003'
const category = '20000000-0000-4000-8000-000000000001'
await db.exec(
  `insert into auth.users values ('${customer}','{"full_name":"Customer","role":"admin"}'),('${other}','{}'),('${admin}','{}'); update public.profiles set role='admin' where id='${admin}';`,
)
async function as(role, id = '') {
  await db.exec(
    `reset role; set role ${role}; select set_config('request.jwt.claim.sub','${id}',false);`,
  )
}
async function denied(sql) {
  await assert.rejects(() => db.exec(sql))
}
await as('anon')
assert.equal((await db.query('select * from concerts')).rows.length, 3)
await denied('select * from orders')
await denied("insert into concerts(title) values ('bad')")
await denied(`select public.create_order('${category}',1,gen_random_uuid())`)
assert.equal(
  (
    await db.query(
      "select has_function_privilege('anon','public.create_order(uuid,integer,uuid)','execute') as allowed",
    )
  ).rows[0].allowed,
  false,
)
assert.equal(
  (
    await db.query(
      "select has_function_privilege('authenticated','private.handle_new_user()','execute') as allowed",
    )
  ).rows[0].allowed,
  false,
)
await as('authenticated', customer)
assert.equal((await db.query('select role from profiles')).rows[0].role, 'customer')
await denied("update profiles set role='admin'")
await denied("update orders set status='completed'")
await denied(`select create_order('${category}',7,gen_random_uuid())`)
const request = '40000000-0000-4000-8000-000000000001'
const {
  rows: [order],
} = await db.query(`select * from create_order('${category}',2,'${request}')`)
assert.equal(Number(order.total), 1700000)
const {
  rows: [retry],
} = await db.query(`select * from create_order('${category}',2,'${request}')`)
assert.equal(retry.id, order.id)
assert.equal((await db.query('select * from order_status_history')).rows.length, 1)
await denied(`select update_order_status('${order.id}','confirmed','illegal')`)
await as('authenticated', other)
assert.equal((await db.query('select * from orders')).rows.length, 0)
assert.equal((await db.query('select * from order_status_history')).rows.length, 0)
await as('authenticated', admin)
assert.equal((await db.query('select * from profiles')).rows.length, 3)
await denied(`select update_order_status('${order.id}','completed','skip')`)
await db.exec(`select update_order_status('${order.id}','confirmed','Dikonfirmasi admin')`)
assert.equal((await db.query('select * from order_status_history')).rows.length, 2)
await denied(`delete from concerts where id='10000000-0000-4000-8000-000000000001'`)
await denied(`update ticket_categories set quota=1 where id='${category}'`)
await db.exec(
  `update ticket_categories set price=900000,quota=2 where id='${category}'; update concerts set is_active=false where id='10000000-0000-4000-8000-000000000002';`,
)
assert.equal(
  Number((await db.query('select ticket_price from orders')).rows[0].ticket_price),
  750000,
)
await as('authenticated', customer)
await denied(`select create_order('${category}',1,gen_random_uuid())`)
await denied(`select create_order('20000000-0000-4000-8000-000000000003',1,gen_random_uuid())`)
await as('anon')
assert.equal((await db.query('select * from concerts')).rows.length, 2)
assert.equal((await db.query('select * from ticket_categories')).rows.length, 3)
await as('authenticated', admin)
await db.exec(`select update_order_status('${order.id}','cancelled','Kuota dikembalikan')`)
await as('authenticated', customer)
await db.exec(`select create_order('${category}',2,gen_random_uuid())`)
await as('authenticated', admin)
await db.exec(`update concerts set is_active=false where id='10000000-0000-4000-8000-000000000001'`)
await as('authenticated', customer)
assert.equal(
  (await db.query(`select * from concerts where id='10000000-0000-4000-8000-000000000001'`)).rows
    .length,
  1,
)
assert.equal(
  (await db.query(`select * from ticket_categories where id='${category}'`)).rows.length,
  1,
)
await denied(`select create_order('${category}',1,gen_random_uuid())`)
await as('authenticated', other)
assert.equal(
  (await db.query(`select * from concerts where id='10000000-0000-4000-8000-000000000001'`)).rows
    .length,
  0,
)
await as('anon')
assert.equal(
  (await db.query(`select * from ticket_categories where id='${category}'`)).rows.length,
  0,
)
await db.close()
console.log(
  'PASS: migration, seed, RLS, role escalation, ownership, price snapshot, idempotency, quota, transitions, history, cancellation, FK protection',
)
