<script setup lang="ts">
import type { Status } from '#shared/types'
import { statusLabels } from '#shared/utils/format'
const props = defineProps<{ status: Status }>()
const steps: Status[] = ['pending', 'confirmed', 'processing', 'secured', 'completed']
const current = computed(() => (props.status === 'cancelled' ? -1 : steps.indexOf(props.status)))
</script>
<template>
  <div class="card">
    <div class="mb-5 flex items-center justify-between">
      <h2>Progress pesanan</h2>
      <StatusBadge :status="status" />
    </div>
    <div v-if="status === 'cancelled'" class="error">
      Pesanan dibatalkan. Hubungi admin jika memerlukan penjelasan atau bantuan refund.
    </div>
    <ol v-else class="grid gap-3 sm:grid-cols-5">
      <li v-for="(step, index) in steps" :key="step" class="relative">
        <div class="flex items-center gap-3 sm:block">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
            :class="index <= current ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'"
            >{{ index < current ? '✓' : index + 1 }}</span
          ><span
            class="text-sm font-semibold"
            :class="index <= current ? 'text-violet-700' : 'text-slate-400'"
            >{{ statusLabels[step] }}</span
          >
        </div>
        <div
          v-if="index < steps.length - 1"
          class="hidden h-1 sm:mt-3 sm:block"
          :class="index < current ? 'bg-violet-600' : 'bg-slate-100'"
        />
      </li>
    </ol>
    <p class="muted mt-5">
      Admin memperbarui status ketika proses pembelian bergerak ke tahap berikutnya. Pesanan tetap
      perlu dikonfirmasi melalui WhatsApp.
    </p>
  </div>
</template>
