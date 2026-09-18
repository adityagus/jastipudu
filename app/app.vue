<script setup lang="ts">
import logo from '~/assets/jastipidu.jpg'
const { profile, refresh, logout } = useAuth()
const route = useRoute()
const authLinkFailed = computed(
  () => route.query.error === 'access_denied' || route.query.error_code === 'otp_expired',
)
// Auth is non-blocking on public pages so the landing page can paint immediately.
// Protected pages still validate through route middleware before rendering.
onMounted(() => refresh())
</script>
<template>
  <div class="min-h-screen">
    <div v-if="authLinkFailed" role="alert" class="notice mx-auto my-4 max-w-6xl">
      Link konfirmasi email tidak valid atau sudah kedaluwarsa.
      <NuxtLink to="/konfirmasi-email" class="ml-2 font-semibold underline"
        >Minta link baru</NuxtLink
      >
    </div>
    <a href="#main" class="sr-only focus:not-sr-only">Langsung ke konten</a>
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-5">
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-extrabold tracking-tight"
          ><img :src="logo" alt="jastipidu" class="h-10 w-10 rounded-xl object-cover" /><span>jastip<span class="text-violet-600">idu</span></span></NuxtLink
        >
        <nav
          aria-label="Navigasi utama"
          class="flex flex-wrap items-center gap-5 text-sm font-medium"
        >
          <NuxtLink to="/concerts">Jelajah konser</NuxtLink
          ><NuxtLink to="/cara-kerja">Cara kerja</NuxtLink
          ><NuxtLink to="/testimoni">Testimoni</NuxtLink><NuxtLink to="/cek-pesanan">Cek pesanan</NuxtLink>
          <template v-if="profile"
            ><NuxtLink :to="profile.role === 'admin' ? '/admin' : '/dashboard'">Dashboard</NuxtLink
            ><button class="text-slate-500" @click="logout">Keluar</button></template
          >
          <NuxtLink v-else to="/login" class="btn">Masuk / Daftar</NuxtLink>
        </nav>
      </div>
    </header>
    <main id="main"><NuxtPage /></main>
    <footer class="mt-16 border-t border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-6xl flex-wrap justify-between gap-5 px-5 py-8 text-sm text-slate-500"
      >
        <p>Jastipudu. • Musiknya kamu, urusan tiketnya kami.</p>
        <p>Jasa titip independen · Bukan promotor resmi</p>
      </div>
    </footer>
  </div>
</template>
