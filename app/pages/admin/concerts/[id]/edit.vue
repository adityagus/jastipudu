<script setup lang="ts">
import type { Concert } from '#shared/types'
definePageMeta({ middleware: 'admin' })
const route = useRoute()
const { data, pending, error, refresh } = await useFetch<Concert>(
  '/api/concerts/' + route.params.id,
)
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1 class="mb-8">Edit konser</h1>
    <ApiState :pending="pending" :error="error" @retry="refresh"
      ><ConcertForm v-if="data" :concert="data"
    /></ApiState>
  </div>
</template>
