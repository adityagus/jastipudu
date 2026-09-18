<script setup lang="ts">
import type { AdminOverview } from '#shared/types'
import { money } from '#shared/utils/format'
definePageMeta({ middleware: 'admin' })
const { data, pending, error, refresh } = await useFetch<AdminOverview>('/api/admin/overview')
const stats = computed(() => data.value?.stats)
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <div class="page-heading">
      <div>
        <p class="eyebrow mb-3">Admin War Room</p>
        <h1>Operasional hari ini</h1>
        <p class="muted mt-3">
          Pantau antrean yang membutuhkan tindakan dan kesehatan proses order.
        </p>
      </div>
      <button class="btn-secondary" @click="refresh()">Refresh data</button>
    </div>
    <ApiState :pending="pending" :error="error" @retry="refresh">
      <section class="grid-12 gap-y-4 sm:[&>*]:col-span-6 lg:[&>*]:col-span-3">
        <div
          v-for="item in [
            {
              label: 'Perlu konfirmasi',
              value: stats?.pending || 0,
              link: '/admin/orders?status=pending',
              tone: 'border-amber-200 bg-amber-50',
            },
            {
              label: 'Sedang diproses',
              value: stats?.processing || 0,
              link: '/admin/orders?status=processing',
              tone: 'border-brand-200 bg-brand-50',
            },
            {
              label: 'Tiket diamankan',
              value: stats?.secured || 0,
              link: '/admin/orders?status=secured',
              tone: 'border-emerald-200 bg-emerald-50',
            },
            {
              label: 'Pesanan selesai',
              value: stats?.completed || 0,
              link: '/admin/orders?status=completed',
              tone: 'border-stone-200 bg-white',
            },
          ]"
          :key="item.label"
          class="card"
          :class="item.tone"
        >
          <p class="muted">{{ item.label }}</p>
          <p class="mt-3 text-3xl font-bold">{{ item.value }}</p>
          <NuxtLink class="mt-4 inline-block text-sm font-semibold text-brand-700" :to="item.link"
            >Buka antrean →</NuxtLink
          >
        </div>
      </section>
      <section class="mt-8 grid-12 gap-y-6">
        <div class="card lg:col-span-8">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <p class="eyebrow mb-2">Action queue</p>
              <h2>Butuh tindakan</h2>
            </div>
            <NuxtLink to="/admin/orders" class="text-sm font-semibold text-brand-600"
              >Semua order →</NuxtLink
            >
          </div>
          <OrdersList :orders="data?.urgent_orders || []" admin />
          <p v-if="!data?.urgent_orders.length" class="muted">
            Tidak ada antrean mendesak. Semua order terpantau.
          </p>
        </div>
        <div class="card lg:col-span-4">
          <p class="eyebrow mb-2">Quick actions</p>
          <h2 class="mb-5">Kerjakan cepat</h2>
          <div class="grid gap-3">
            <NuxtLink class="btn" to="/admin/concerts/create">+ Buat konser</NuxtLink
            ><NuxtLink class="btn-secondary" to="/admin/orders?status=pending"
              >Tinjau order baru</NuxtLink
            ><NuxtLink class="btn-secondary" to="/admin/customers">Lihat customer</NuxtLink
            ><NuxtLink class="btn-secondary" to="/admin/testimonials">Kelola testimoni</NuxtLink>
          </div>
          <div class="mt-6 border-t border-stone-200 pt-5">
            <p class="muted">
              Konser aktif <strong class="text-stone-900">{{ stats?.concerts || 0 }}</strong>
            </p>
            <p class="muted mt-2">
              Customer <strong class="text-stone-900">{{ stats?.customers || 0 }}</strong>
            </p>
            <p class="muted mt-2">
              Nilai selesai <strong class="text-stone-900">{{ money(stats?.revenue || 0) }}</strong>
            </p>
          </div>
        </div>
      </section>
      <section class="mt-8">
        <div class="page-heading mb-5">
          <h2>Order terbaru</h2>
          <span class="muted">{{ stats?.orders || 0 }} order terdata</span>
        </div>
        <OrdersList :orders="data?.recent_orders || []" admin />
      </section>
    </ApiState>
    <p class="muted mt-6">
      Statistik diambil dari database dan mencakup hingga 1.000 order terbaru untuk daftar
      operasional.
    </p>
  </div>
</template>
