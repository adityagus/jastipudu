<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
</script>
<template>
  <div class="page">
    <AccountNav admin />
    <h1 class="mb-8">Buat konser</h1>
    <ConcertForm />
  </div>
</template>
