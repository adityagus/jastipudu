<script setup lang="ts">
import type { Concert, Category } from '#shared/types'
import { money } from '#shared/utils/format'
definePageMeta({ middleware: 'admin' })
const route = useRoute()
const { data, pending, error, refresh } = await useFetch<Concert>(
  '/api/concerts/' + route.params.id,
)
const form = reactive({ name: '', price: 0, service_fee: 0, quota: 0 })
const editing = ref('')
const busy = ref(false)
const message = ref('')
function reset() {
  editing.value = ''
  Object.assign(form, { name: '', price: 0, service_fee: 0, quota: 0 })
}
function edit(c: Category) {
  editing.value = c.id
  Object.assign(form, { name: c.name, price: c.price, service_fee: c.service_fee, quota: c.quota })
}
async function save() {
  busy.value = true
  message.value = ''
  try {
    await $fetch(editing.value ? '/api/categories/' + editing.value : '/api/categories', {
      method: editing.value ? 'PUT' : 'POST',
      body: { ...form, concert_id: route.params.id },
    })
    reset()
    await refresh()
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function remove(c: Category) {
  if (!confirm('Hapus kategori ' + c.name + '?')) return
  try {
    await $fetch('/api/categories/' + c.id, { method: 'DELETE', body: {} })
    await refresh()
  } catch (e) {
    message.value = errorMessage(e)
  }
}
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1>Kategori tiket</h1>
    <p class="muted mt-3 mb-8">{{ data?.title }}</p>
    <ApiState :pending="pending" :error="error" @retry="refresh"
      ><div class="grid-12 gap-y-6 lg:[&>*]:col-span-6">
        <div class="space-y-4">
          <article v-for="c in data?.ticket_categories" :key="c.id" class="card">
            <h3>{{ c.name }}</h3>
            <p class="muted mt-3">
              Tiket {{ money(c.price) }} + jasa {{ money(c.service_fee) }} · Kuota total
              {{ c.quota }}
            </p>
            <div class="mt-4 flex gap-4">
              <button class="text-brand-600" @click="edit(c)">Edit</button
              ><button class="text-red-600" @click="remove(c)">Hapus</button>
            </div>
          </article>
        </div>
        <form class="card h-fit space-y-5" @submit.prevent="save">
          <h2>{{ editing ? 'Edit kategori' : 'Tambah kategori' }}</h2>
          <label>Nama kategori<input v-model="form.name" maxlength="100" required /></label
          ><label
            >Harga tiket (Rp)<input
              v-model.number="form.price"
              type="number"
              min="0"
              max="100000000"
              required /></label
          ><label
            >Biaya jasa per tiket (Rp)<input
              v-model.number="form.service_fee"
              type="number"
              min="0"
              max="10000000"
              required /></label
          ><label
            >Kuota total<input
              v-model.number="form.quota"
              type="number"
              min="0"
              max="100000"
              required
          /></label>
          <p class="muted">
            Kuota adalah batas total tiket pesanan aktif, bukan stok tersisa. Harga pesanan lama
            tetap tersimpan.
          </p>
          <p v-if="message" role="alert" class="error">{{ message }}</p>
          <div class="flex gap-3">
            <button class="btn" :disabled="busy">Simpan kategori</button
            ><button v-if="editing" type="button" class="btn-secondary" @click="reset">
              Batal edit
            </button>
          </div>
        </form>
      </div></ApiState
    >
  </div>
</template>
