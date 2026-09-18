<script setup lang="ts">
const props = defineProps<{ order?: string }>()
const { data } = await useFetch('/api/whatsapp', { query: { order: props.order } })
</script>
<template>
  <a
    v-if="data?.url"
    :href="data.url"
    target="_blank"
    rel="noopener noreferrer"
    class="btn-secondary"
    >Hubungi Jastip via WhatsApp</a
  >
  <p v-else class="muted">Kontak WhatsApp belum tersedia.</p>
</template>
