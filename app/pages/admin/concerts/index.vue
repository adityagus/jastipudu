<script setup lang="ts">
import type { Concert } from '#shared/types'
import { dateTime } from '#shared/utils/format'
definePageMeta({ middleware: 'admin' })
const { data, pending, error, refresh } = await useFetch<Concert[]>('/api/concerts', {
  query: { admin: 'true' },
})
const message = ref('')
async function remove(c: Concert) {
  if (!confirm('Hapus konser ' + c.title + '? Konser dengan pesanan tidak bisa dihapus.')) return
  try {
    await $fetch('/api/concerts/' + c.id, { method: 'DELETE', body: {} })
    await refresh()
  } catch (e) {
    message.value = errorMessage(e)
  }
}
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <div class="page-heading">
      <h1>Kelola konser</h1>
      <NuxtLink class="btn" to="/admin/concerts/create">+ Buat konser</NuxtLink>
    </div>
    <p v-if="message" class="error mb-5">{{ message }}</p>
    <ApiState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh"
      ><div class="space-y-4">
        <article
          v-for="c in data"
          :key="c.id"
          class="card flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h3>{{ c.title }}</h3>
            <p class="muted mt-1">{{ dateTime(c.starts_at) }}</p>
            <p v-if="new Date(c.starts_at) < new Date()" class="mt-2 text-sm font-medium text-amber-700">
              Jadwal sudah lewat — ubah jadwal agar tampil di konser mendatang.
            </p>
            <p class="muted mt-2">{{ c.city }} · {{ c.is_active ? 'Aktif' : 'Draft' }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <NuxtLink class="btn-secondary" :to="'/admin/concerts/' + c.id + '/edit'"
              >Edit konser</NuxtLink
            ><NuxtLink class="btn-secondary" :to="'/admin/concerts/' + c.id + '/tickets'"
              >Kategori tiket</NuxtLink
            ><button class="text-sm text-red-600" @click="remove(c)">Hapus</button>
          </div>
        </article>
      </div></ApiState
    >
  </div>
</template>
