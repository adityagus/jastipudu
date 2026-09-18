<script setup lang="ts">
import type { Concert } from '#shared/types'
const { data, pending, error, refresh } = await useFetch<Concert[]>('/api/concerts')
const search = ref('')
const filtered = computed(
  () =>
    data.value?.filter((c) =>
      (c.title + ' ' + c.artist + ' ' + c.city).toLowerCase().includes(search.value.toLowerCase()),
    ) ?? [],
)
</script>
<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow mb-3">Agenda musikmu</p>
        <h1>Jelajah konser</h1>
      </div>
    </div>
    <label class="mb-8 max-w-md"
      >Cari konser, artis, atau kota<input
        v-model="search"
        placeholder="Mau nonton siapa?"
        type="search" /></label
    ><ApiState :pending="pending" :error="error" :empty="!filtered.length" @retry="refresh"
      ><div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ConcertCard v-for="(c, i) in filtered" :key="c.id" :concert="c" :index="i" /></div
    ></ApiState>
  </div>
</template>
