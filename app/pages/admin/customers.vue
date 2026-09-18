<script setup lang="ts">
import type { Profile } from '#shared/types'
definePageMeta({ middleware: 'admin' })
const { data, pending, error, refresh } = await useFetch<Profile[]>('/api/customers')
const contact = ref<Record<string, string | null>>({})
async function contactCustomer(id: string) {
  const result = await $fetch<{ url: string | null }>('/api/customers/' + id + '/whatsapp')
  if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer')
  else contact.value[id] = null
}
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1 class="mb-8">Customer</h1>
    <ApiState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh"
      ><div class="grid gap-4 md:grid-cols-2">
        <article v-for="c in data" :key="c.id" class="card">
          <h3>{{ c.full_name || 'Belum mengisi nama' }}</h3>
          <p class="muted mt-2">{{ c.phone || 'Telepon belum diisi' }}</p>
          <p class="muted mt-2 break-all">{{ c.id }}</p>
          <button v-if="c.phone" class="btn-secondary mt-4" @click="contactCustomer(c.id)">
            Hubungi via WhatsApp
          </button>
          <p v-else class="muted mt-4">Nomor WhatsApp belum diisi.</p>
        </article>
      </div></ApiState
    >
  </div>
</template>
