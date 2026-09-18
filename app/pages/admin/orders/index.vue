<script setup lang="ts">
import type { Order } from '#shared/types'
import { statusLabels } from '#shared/utils/format'
definePageMeta({ middleware: 'admin' })
const { data, pending, error, refresh } = await useFetch<Order[]>('/api/orders')
const filter = ref('')
const route = useRoute()
const filtered = computed(
  () => data.value?.filter((o) => !filter.value || o.status === filter.value) || [],
)
watch(
  () => route.query.status,
  (value) => {
    filter.value = typeof value === 'string' ? value : ''
  },
  { immediate: true },
)
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1 class="mb-8">Kelola pesanan</h1>
    <label class="mb-6 max-w-sm"
      >Filter status<select v-model="filter">
        <option value="">Semua status</option>
        <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
      </select></label
    ><ApiState :pending="pending" :error="error" :empty="!filtered.length" @retry="refresh"
      ><OrdersList :orders="filtered" admin
    /></ApiState>
  </div>
</template>
