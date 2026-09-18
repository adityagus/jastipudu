<script setup lang="ts">
const props = defineProps<{ register?: boolean }>()
const route = useRoute()
const { refresh } = useAuth()
const form = reactive({ email: '', password: '', full_name: '' })
const busy = ref(false)
const message = ref('')
const success = ref(false)
const showPassword = ref(false)
const errorBox = ref<HTMLElement | null>(null)
const emailUnconfirmed = ref(false)
const redirect = computed(() => {
  const path = String(route.query.redirect || '/dashboard')
  return path.startsWith('/') &&
    !path.startsWith('//') &&
    !/[\\\s]/.test(path) &&
    ![...path].some((character) => character.charCodeAt(0) < 32) &&
    !/^\/(login|register)([/?#]|$)/.test(path)
    ? path
    : '/dashboard'
})
async function submit() {
  if (busy.value) return
  busy.value = true
  message.value = ''
  success.value = false
  emailUnconfirmed.value = false
  try {
    if (props.register) {
      await $fetch('/api/auth/register', { method: 'POST', body: form })
      success.value = true
      message.value = 'Pendaftaran diterima. Periksa email untuk konfirmasi, lalu masuk.'
    } else {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: form.email.trim(), password: form.password },
      })
      const p = await refresh()
      if (!p) {
        message.value =
          'Sesi login belum tersimpan. Pastikan cookie browser diaktifkan, lalu coba masuk kembali.'
        await nextTick()
        errorBox.value?.focus()
        return
      }
      await navigateTo(
        p?.role === 'admin' && redirect.value === '/dashboard' ? '/admin' : redirect.value,
        { replace: true },
      )
    }
  } catch (e) {
    success.value = false
    const error = e as { data?: { data?: { code?: string } }; response?: unknown }
    emailUnconfirmed.value = error.data?.data?.code === 'email_not_confirmed'
    message.value =
      !error.response && !error.data
        ? 'Tidak dapat terhubung ke server. Periksa koneksi internet kamu, lalu coba lagi.'
        : errorMessage(e)
    await nextTick()
    errorBox.value?.focus()
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="page !max-w-lg">
    <p class="eyebrow mb-4">Your next show starts here</p>
    <h1>{{ register ? 'Buat akunmu.' : 'Selamat datang.' }}</h1>
    <p class="muted mt-3">
      {{
        register
          ? 'Daftar untuk mulai memesan dan memantau tiketmu.'
          : 'Masuk untuk memesan dan memantau tiketmu.'
      }}
    </p>
    <form class="card mt-6 space-y-5" :aria-busy="busy" @submit.prevent="submit">
      <div
        v-if="message"
        ref="errorBox"
        tabindex="-1"
        :role="success ? 'status' : 'alert'"
        :class="success ? 'notice' : 'error'"
      >
        <p class="font-semibold">
          {{
            success ? 'Berhasil' : register ? 'Pendaftaran belum berhasil' : 'Belum berhasil masuk'
          }}
        </p>
        <p class="mt-1">{{ message }}</p>
        <NuxtLink
          v-if="emailUnconfirmed"
          to="/konfirmasi-email"
          class="mt-3 inline-block font-semibold underline"
          >Kirim ulang email konfirmasi</NuxtLink
        >
      </div>
      <label v-if="register"
        >Nama lengkap<input
          v-model="form.full_name"
          autocomplete="name"
          minlength="2"
          maxlength="120"
          required /></label
      ><label
        >Email<input
          v-model.trim="form.email"
          type="email"
          autocapitalize="none"
          :spellcheck="false"
          autocomplete="email"
          required
          maxlength="254" /></label
      ><label
        >Password<span class="relative block"
          ><input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="pr-12"
            :autocomplete="register ? 'new-password' : 'current-password'"
            :minlength="register ? 12 : 1"
            maxlength="128"
            required /><button
            type="button"
            class="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-brand-700 hover:bg-brand-50"
            :aria-label="showPassword ? 'Sembunyikan password' : 'Lihat password'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg
              aria-hidden="true"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <template v-if="showPassword">
                <path
                  d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c7 0 10 7 10 7a17.2 17.2 0 0 1-3.1 4.2M6.2 6.2C3.4 8.1 2 12 2 12s3 7 10 7a10.8 10.8 0 0 0 5.8-1.8"
                />
              </template>
              <template v-else>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </template>
            </svg></button></span
      ></label>
      <p v-if="register" class="muted">Gunakan setidaknya 12 karakter.</p>
      <button :disabled="busy" class="btn w-full">
        {{ busy ? 'Memproses…' : register ? 'Daftar' : 'Masuk' }}</button
      ><NuxtLink
        class="block text-sm text-brand-600"
        :to="(register ? '/login' : '/register') + '?redirect=' + encodeURIComponent(redirect)"
        >{{ register ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar' }}</NuxtLink
      >
    </form>
    <NuxtLink to="/konfirmasi-email" class="mt-5 block text-sm text-brand-600"
      >Email konfirmasi belum diterima atau link kedaluwarsa?</NuxtLink
    >
  </div>
</template>
