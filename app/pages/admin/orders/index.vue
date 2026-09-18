<script setup lang="ts">
import type { Order } from '#shared/types'
import { statusLabels } from '#shared/utils/format'
definePageMeta({ middleware: 'admin' })
const { data, pending, error, refresh } = await useFetch<Order[]>('/api/orders')
const filter = ref('')
const search = ref('')
const appliedSearch = ref('')
const route = useRoute()
function resetSearch() {
  search.value = ''
  appliedSearch.value = ''
  filter.value = ''
}
const filtered = computed(
  () =>
    data.value?.filter(
      (o) =>
        (!filter.value || o.status === filter.value) &&
        `${o.order_number} ${o.concerts.title} ${o.ticket_categories.name}`
          .toLowerCase()
          .includes(appliedSearch.value.trim().toLowerCase()),
    ) || [],
)
watch(
  () => route.query.status,
  (value) => {
    filter.value = typeof value === 'string' && value in statusLabels ? value : ''
  },
  { immediate: true },
)
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1 class="mb-8">Kelola pesanan</h1>
    <form
      class="card grid-12 mb-6 items-end gap-y-4"
      role="search"
      aria-label="Cari pesanan"
      @submit.prevent="appliedSearch = search"
    >
      <label class="md:col-span-6"
        >Cari pesanan<input
          v-model="search"
          type="search"
          placeholder="Nomor pesanan, konser, atau kategori"
      /></label>
      <label class="md:col-span-4"
        >Filter status<select v-model="filter">
          <option value="">Semua status</option>
          <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
        </select></label
      >
      <button class="btn min-h-12 w-full whitespace-nowrap md:col-span-2">Cari</button>
    </form>
    <div v-if="appliedSearch || filter" class="mb-5 flex flex-wrap items-center gap-3 text-sm">
      <p role="status">
        {{ filtered.length }} pesanan ditemukan<span v-if="appliedSearch">
          untuk “{{ appliedSearch }}”</span
        >.
      </p>
      <button type="button" class="font-semibold text-brand-700 underline" @click="resetSearch">
        Reset pencarian
      </button>
    </div>
    <ApiState :pending="pending" :error="error" :empty="!filtered.length" @retry="refresh"
      ><OrdersList :orders="filtered" admin
    /></ApiState>
  </div>
</template>
