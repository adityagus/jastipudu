<script setup lang="ts">
import type { Status } from '#shared/types'
import { statusLabels } from '#shared/utils/format'
const props = defineProps<{ status: Status; admin?: boolean }>()
const steps: Status[] = ['pending', 'confirmed', 'processing', 'secured', 'completed']
const current = computed(() => (props.status === 'cancelled' ? -1 : steps.indexOf(props.status)))
</script>
<template>
  <div class="card">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2>Progres pesanan</h2>
      <StatusBadge :status="status" />
    </div>
    <div v-if="status === 'cancelled'" class="error">
      {{
        admin
          ? 'Pesanan dibatalkan. Lihat riwayat status untuk catatan pembatalan.'
          : 'Pesanan dibatalkan. Hubungi admin jika memerlukan penjelasan atau bantuan refund.'
      }}
    </div>
    <ol v-else aria-label="Tahapan pesanan" class="grid gap-3 md:grid-cols-5">
      <li
        v-for="(step, index) in steps"
        :key="step"
        :aria-current="index === current ? 'step' : undefined"
        class="min-w-0 rounded-xl border p-3"
        :class="index === current ? 'border-brand-300 bg-brand-50' : 'border-stone-200'"
      >
        <div class="flex items-center gap-3 md:flex-col md:items-start">
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            :class="index <= current ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-400'"
            aria-hidden="true"
            >{{ index < current ? '✓' : index + 1 }}</span
          
          ><span
            class="text-sm font-semibold leading-5 [overflow-wrap:normal]"
            :class="index <= current ? 'text-brand-700' : 'text-stone-400'"
            >{{ statusLabels[step] }}</span
          >
          <span class="sr-only">{{
            index < current
              ? 'Sudah dilewati'
              : index === current
                ? 'Tahap saat ini'
                : 'Belum dimulai'
          }}</span>
        </div>
        <div
          v-if="index < steps.length - 1"
          class="mt-3 hidden h-1 rounded-full md:block"
          :class="index < current ? 'bg-brand-600' : 'bg-stone-100'"
        />
      </li>
    </ol>
    <p class="muted mt-5">
      {{
        admin
          ? 'Perbarui status sesuai progres sebenarnya. Setiap perubahan tersimpan di riwayat pesanan.'
          : 'Admin memperbarui status ketika proses pembelian bergerak ke tahap berikutnya. Pesanan tetap perlu dikonfirmasi melalui WhatsApp.'
      }}
    </p>
  </div>
</template>
