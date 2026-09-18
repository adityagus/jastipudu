<script setup lang="ts">
import type { Order } from '#shared/types'
definePageMeta({ middleware: 'auth' })
const { data, pending, error, refresh } = await useFetch<Order[]>('/api/orders')
</script>
<template>
  <div class="page">
    <AccountNav />
    <h1 class="mb-8">Pesanan saya</h1>
    <ApiState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh"
      ><OrdersList :orders="data || []"
    /></ApiState>
  </div>
</template>
