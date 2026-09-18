<script setup lang="ts">
defineProps<{ admin?: boolean }>()
</script>
<template>
  <nav aria-label="Navigasi akun" class="mb-8 flex flex-wrap gap-2 text-sm">
    <template v-if="admin"
      ><NuxtLink class="btn-secondary" to="/admin">Ringkasan</NuxtLink
      ><NuxtLink class="btn-secondary" to="/admin/concerts">Konser & tiket</NuxtLink
      ><NuxtLink class="btn-secondary" to="/admin/orders">Pesanan</NuxtLink
      ><NuxtLink class="btn-secondary" to="/admin/customers">Customer</NuxtLink
      ><NuxtLink class="btn-secondary" to="/admin/testimonials">Testimoni</NuxtLink></template
    >
    <template v-else
      ><NuxtLink class="btn-secondary" to="/dashboard">Ringkasan</NuxtLink
      ><NuxtLink class="btn-secondary" to="/orders">Pesanan saya</NuxtLink
      ><NuxtLink class="btn-secondary" to="/profile">Profil</NuxtLink></template
    >
  </nav>
</template>
