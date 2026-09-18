<script setup lang="ts">
import type { Status } from '#shared/types'
import { statusLabels } from '#shared/utils/format'
defineProps<{ status: Status }>()
</script>
<template>
  <span
    class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
    :class="
      status === 'cancelled'
        ? 'bg-red-50 text-red-700'
        : status === 'completed'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-brand-50 text-brand-700'
    "
    >{{ statusLabels[status] }}</span
  >
</template>
