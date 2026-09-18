<script setup lang="ts">
import type { Testimonial } from '#shared/types'
definePageMeta({ middleware: 'admin' })
const { data, pending, error, refresh } = await useFetch<Testimonial[]>('/api/testimonials', {
  query: { admin: 'true' },
})
const form = reactive({ customer_name: '', content: '', rating: 5, is_published: false })
const busy = ref(false)
const message = ref('')
const editing = ref('')
function edit(t: Testimonial) {
  editing.value = t.id
  Object.assign(form, {
    customer_name: t.customer_name,
    content: t.content,
    rating: t.rating,
    is_published: t.is_published,
  })
}
function reset() {
  editing.value = ''
  Object.assign(form, { customer_name: '', content: '', rating: 5, is_published: false })
}
async function save() {
  busy.value = true
  try {
    await $fetch(editing.value ? '/api/testimonials/' + editing.value : '/api/testimonials', {
      method: editing.value ? 'PUT' : 'POST',
      body: form,
    })
    reset()
    await refresh()
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function remove(id: string) {
  if (!confirm('Hapus testimoni ini?')) return
  try {
    await $fetch('/api/testimonials/' + id, { method: 'DELETE', body: {} })
    await refresh()
  } catch (e) {
    message.value = errorMessage(e)
  }
}
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1 class="mb-8">Kelola testimoni</h1>
    <div class="grid-12 gap-y-6 md:[&>*]:col-span-6">
      <ApiState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh"
        ><div class="space-y-4">
          <article v-for="t in data" :key="t.id" class="card">
            <h3>{{ t.customer_name }} · {{ t.rating }}/5</h3>
            <p class="my-3">{{ t.content }}</p>
            <p class="muted">{{ t.is_published ? 'Terbit' : 'Draft' }}</p>
            <button class="mt-4 mr-4 text-brand-600" @click="edit(t)">Edit</button>
            <button class="mt-4 text-red-600" @click="remove(t.id)">Hapus</button>
          </article>
        </div></ApiState
      >
      <form class="card space-y-4" @submit.prevent="save">
        <h2>{{ editing ? 'Edit testimoni' : 'Tambah testimoni' }}</h2>
        <label
          >Nama customer<input
            v-model="form.customer_name"
            minlength="2"
            maxlength="120"
            required /></label
        ><label
          >Isi testimoni<textarea
            v-model="form.content"
            minlength="5"
            maxlength="2000"
            required
          /></label
        ><label
          >Rating<input
            v-model.number="form.rating"
            type="number"
            min="1"
            max="5"
            required /></label
        ><label class="flex gap-3"
          ><input v-model="form.is_published" class="w-5" type="checkbox" />Publikasikan dengan izin
          customer</label
        >
        <p v-if="message" class="error">{{ message }}</p>
        <button class="btn" :disabled="busy">Simpan</button>
        <button v-if="editing" type="button" class="btn-secondary ml-3" @click="reset">
          Batal edit
        </button>
      </form>
    </div>
  </div>
</template>
