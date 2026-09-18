<script setup lang="ts">
const route = useRoute()
const items = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/'
  const crumbs: Array<{ label: string; to?: string }> = [{ label: 'Beranda', to: '/' }]
  const labels: Record<string, string> = {
    '/concerts': 'Konser',
    '/cara-kerja': 'Cara kerja',
    '/testimoni': 'Testimoni',
    '/cek-pesanan': 'Cek pesanan',
    '/login': 'Masuk',
    '/register': 'Daftar',
    '/konfirmasi-email': 'Konfirmasi email',
    '/dashboard': 'Dashboard',
    '/orders': 'Pesanan saya',
    '/profile': 'Profil',
    '/admin': 'Admin',
    '/admin/concerts': 'Kelola konser',
    '/admin/orders': 'Kelola pesanan',
    '/admin/customers': 'Customer',
    '/admin/testimonials': 'Kelola testimoni',
  }
  if (path === '/') return []
  if (path.startsWith('/admin/')) crumbs.push({ label: 'Admin', to: '/admin' })
  else if (path === '/profile' || path.startsWith('/orders'))
    crumbs.push({ label: 'Dashboard', to: '/dashboard' })

  if (path.startsWith('/admin/concerts/')) {
    crumbs.push({ label: 'Kelola konser', to: '/admin/concerts' })
    crumbs.push({
      label: path.endsWith('/create')
        ? 'Buat konser'
        : path.endsWith('/tickets')
          ? 'Kategori tiket'
          : 'Edit konser',
    })
  } else if (path.startsWith('/admin/orders/')) {
    crumbs.push({ label: 'Kelola pesanan', to: '/admin/orders' }, { label: 'Detail pesanan' })
  } else if (path.startsWith('/concerts/')) {
    crumbs.push({ label: 'Konser', to: '/concerts' }, { label: 'Detail konser' })
  } else if (path.startsWith('/orders/')) {
    crumbs.push({ label: 'Pesanan saya', to: '/orders' }, { label: 'Detail pesanan' })
  } else if (labels[path]) crumbs.push({ label: labels[path] })
  else return []
  return crumbs
})
</script>

<template>
  <nav v-if="items.length" aria-label="Breadcrumb" class="site-container pt-5">
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      <li v-for="(item, index) in items" :key="item.label" class="flex min-w-0 items-center gap-2">
        <svg
          v-if="index"
          aria-hidden="true"
          class="h-4 w-4 shrink-0 text-stone-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="py-1 text-stone-600 hover:text-brand-700 hover:underline"
          >{{ item.label }}</NuxtLink
        >
        <span v-else aria-current="page" class="py-1 font-medium text-brand-900">{{
          item.label
        }}</span>
      </li>
    </ol>
  </nav>
</template>
