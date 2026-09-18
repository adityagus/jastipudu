<script setup lang="ts">
import type { Order } from '#shared/types'
import { dateTime, money } from '#shared/utils/format'
defineProps<{ orders: Order[]; admin?: boolean }>()
</script>
<template>
  <div class="space-y-4">
    <NuxtLink
      v-for="o in orders"
      :key="o.id"
      :to="(admin ? '/admin/orders/' : '/orders/') + o.id"
      class="card flex flex-wrap items-center justify-between gap-5"
      ><div class="min-w-0">
        <p class="muted break-all">{{ o.order_number }}</p>
        <h3 class="mt-2">{{ o.concerts.title }}</h3>
        <p class="muted mt-1">
          {{ o.ticket_categories.name }} · {{ o.quantity }} tiket · {{ dateTime(o.created_at) }}
        </p>
      </div>
      <div class="space-y-3">
        <StatusBadge :status="o.status" />
        <p class="text-right font-semibold">{{ money(o.total) }} →</p>
      </div></NuxtLink
    >
  </div>
</template>
