<script setup lang="ts">
defineProps<{ pending?: boolean; error?: unknown; empty?: boolean }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <p v-if="pending" role="status" class="notice">Memuat data…</p>
  <div v-else-if="error" role="alert" class="error">
    {{ errorMessage(error) }}
    <button class="ml-2 underline" @click="$emit('retry')">Coba lagi</button>
  </div>
  <p v-else-if="empty" class="card muted">Belum ada data untuk ditampilkan.</p>
  <slot v-else />
</template>
