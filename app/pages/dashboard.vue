<script setup lang="ts">
import type { Order } from '#shared/types'
definePageMeta({ middleware: 'auth' })
const { profile } = useAuth()
const { data, pending, error, refresh } = await useFetch<Order[]>('/api/orders')
</script>
<template>
  <div class="page">
    <AccountNav />
    <p class="eyebrow mb-3">Ruang konsermu</p>
    <h1>Halo, {{ profile?.full_name || 'teman musik' }}.</h1>
    <p class="mt-4 text-slate-500">Semua perjalanan menuju panggung, di satu tempat.</p>
    <ApiState :pending="pending" :error="error" @retry="refresh"
      ><div class="my-8 grid gap-4 sm:grid-cols-3">
        <div
          v-for="s in [
            { label: 'Total pesanan', value: data?.length },
            {
              label: 'Sedang berjalan',
              value: data?.filter((o) => !['completed', 'cancelled'].includes(o.status)).length,
            },
            { label: 'Selesai', value: data?.filter((o) => o.status === 'completed').length },
          ]"
          :key="s.label"
          class="card"
        >
          <p class="muted">{{ s.label }}</p>
          <p class="mt-3 text-3xl font-bold">{{ s.value }}</p>
        </div>
      </div>
      <h2 class="mb-5">Pesanan terbaru</h2>
      <OrdersList :orders="data?.slice(0, 5) || []" />
      <p v-if="!data?.length" class="card muted">
        Belum ada pesanan. Temukan konser pertamamu!
      </p></ApiState
    ><NuxtLink class="btn mt-6" to="/concerts">Jelajahi konser ↗</NuxtLink>
  </div>
</template>
