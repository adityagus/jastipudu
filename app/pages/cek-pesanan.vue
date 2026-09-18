<script setup lang="ts">
import type { GuestOrderLookup } from '#shared/types'
import { dateTime, money, statusLabels } from '#shared/utils/format'
const code = ref('')
const result = ref<GuestOrderLookup | null>(null)
const pending = ref(false)
const message = ref('')
async function search() {
  pending.value = true
  message.value = ''
  result.value = null
  try {
    result.value = await $fetch<GuestOrderLookup>('/api/orders/lookup', {
      query: { code: code.value },
    })
  } catch (error) {
    message.value = errorMessage(error)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <div class="page max-w-4xl">
    <div class="mx-auto max-w-xl text-center">
      <p class="eyebrow">Tracking pesanan</p>
      <h1 class="mt-3">Cek status titipanmu</h1>
      <p class="muted mt-4">
        Tidak perlu login. Simpan kode pemesanan dari konfirmasi order untuk melihat progres
        terbaru.
      </p>
      <form class="card mt-8 text-left" @submit.prevent="search">
        <label
          >Kode pemesanan<input
            v-model="code"
            placeholder="Contoh: TT-AB12..."
            autocomplete="off"
            required /></label
        ><button class="btn mt-4 w-full" :disabled="pending || !code.trim()">
          {{ pending ? 'Mencari…' : 'Cari pesanan' }}
        </button>
        <p v-if="message" class="error mt-4" role="alert">{{ message }}</p>
      </form>
    </div>
    <article v-if="result" class="card mx-auto mt-8 max-w-2xl">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow">{{ result.order_number }}</p>
          <h2 class="mt-2">{{ result.concert_title }}</h2>
          <p class="muted mt-1">{{ result.artist }} · {{ result.city }}</p>
        </div>
        <StatusBadge :status="result.status" />
      </div>
      <div class="mt-6 grid-12 gap-y-4 border-y border-stone-200 py-5 sm:[&>*]:col-span-6">
        <p>
          <span class="muted block">Jadwal</span><strong>{{ dateTime(result.starts_at) }}</strong>
        </p>
        <p>
          <span class="muted block">Kategori</span
          ><strong>{{ result.category_name }} × {{ result.quantity }}</strong>
        </p>
        <p>
          <span class="muted block">Venue</span><strong>{{ result.venue }}</strong>
        </p>
        <p>
          <span class="muted block">Total</span><strong>{{ money(result.total) }}</strong>
        </p>
      </div>
      <h3 class="mt-6">Riwayat status</h3>
      <ol class="mt-4 space-y-4">
        <li
          v-for="item in result.status_history"
          :key="item.created_at + item.status"
          class="flex gap-3"
        >
          <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
          <div>
            <p class="font-semibold">{{ statusLabels[item.status] }}</p>
            <p v-if="item.note" class="muted">{{ item.note }}</p>
            <p class="muted">{{ dateTime(item.created_at) }}</p>
          </div>
        </li>
      </ol>
      <p class="notice mt-6">
        Kode ini bersifat rahasia. Jangan bagikan ke orang lain agar status pesananmu tetap privat.
      </p>
    </article>
  </div>
</template>
