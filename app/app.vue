<script setup lang="ts">
import logo from '~/assets/jastipidu.jpg'
const { profile, refresh, logout } = useAuth()
const route = useRoute()
const menuOpen = ref(false)
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
const authLinkFailed = computed(
  () => route.query.error === 'access_denied' || route.query.error_code === 'otp_expired',
)
// Auth is non-blocking on public pages so the landing page can paint immediately.
// Protected pages still validate through route middleware before rendering.
onMounted(() => refresh().catch(() => {}))
</script>
<template>
  <div class="min-h-screen">
    <div v-if="authLinkFailed" role="alert" class="notice site-container my-4">
      Link konfirmasi email tidak valid atau sudah kedaluwarsa.
      <NuxtLink to="/konfirmasi-email" class="ml-2 font-semibold underline"
        >Minta link baru</NuxtLink
      >
    </div>
    <a href="#main" class="sr-only focus:not-sr-only">Langsung ke konten</a>
    <header class="border-b border-stone-200 bg-white">
      <div class="site-container grid-12 items-center gap-y-5 py-5">
        <NuxtLink
          to="/"
          class="col-span-10 flex items-center gap-2 text-xl font-extrabold tracking-tight lg:col-span-3"
          ><img :src="logo" alt="jastipudu" class="h-10 w-10 rounded-xl object-cover" /><span
            >jastip<span class="text-brand-600">udu</span></span
          ></NuxtLink
        >
        <button
          type="button"
          class="col-span-2 inline-flex h-11 w-11 items-center justify-center justify-self-end rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 lg:hidden"
          aria-controls="main-navigation"
          :aria-label="menuOpen ? 'Tutup menu' : 'Buka menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <svg
            aria-hidden="true"
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path v-if="menuOpen" d="m6 6 12 12M6 18 18 6" />
            <path v-else d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <nav
          id="main-navigation"
          aria-label="Navigasi utama"
          :class="menuOpen ? 'flex' : 'hidden'"
          class="w-full flex-col items-stretch gap-2 text-sm font-medium lg:col-span-9 lg:flex lg:w-auto lg:flex-row lg:items-center lg:justify-end lg:gap-5 [&>a]:py-3 [&>button]:py-3"
          @keydown.esc="menuOpen = false"
        >
          <NuxtLink to="/concerts">Jelajah konser</NuxtLink
          ><NuxtLink to="/cara-kerja">Cara kerja</NuxtLink
          ><NuxtLink to="/testimoni">Testimoni</NuxtLink
          ><NuxtLink to="/cek-pesanan">Cek pesanan</NuxtLink>
          <template v-if="profile"
            ><NuxtLink :to="profile.role === 'admin' ? '/admin' : '/dashboard'">Dashboard</NuxtLink
            ><button class="text-stone-500" @click="logout">Keluar</button></template
          >
          <NuxtLink v-else to="/login" class="btn">Masuk / Daftar</NuxtLink>
        </nav>
      </div>
    </header>
    <main id="main"><AppBreadcrumbs /><NuxtPage /></main>
    <footer class="mt-16 border-t border-stone-200 bg-white">
      <div
        class="site-container grid-12 gap-y-5 py-8 text-sm text-stone-500 sm:[&>p]:col-span-6 sm:[&>p:last-child]:text-right"
      >
        <p>Jastipudu. • Musiknya kamu, urusan tiketnya kami.</p>
        <p>Jasa titip independen · Bukan promotor resmi</p>
      </div>
    </footer>
  </div>
</template>
