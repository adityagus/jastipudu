<script setup lang="ts">
const props = defineProps<{ register?: boolean }>()
const route = useRoute()
const { refresh } = useAuth()
const form = reactive({ email: '', password: '', full_name: '' })
const busy = ref(false)
const message = ref('')
const success = ref(false)
const redirect = computed(() => {
  const path = String(route.query.redirect || '/dashboard')
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
    ? path
    : '/dashboard'
})
async function submit() {
  busy.value = true
  message.value = ''
  try {
    if (props.register) {
      await $fetch('/api/auth/register', { method: 'POST', body: form })
      success.value = true
      message.value = 'Pendaftaran diterima. Periksa email untuk konfirmasi, lalu masuk.'
    } else {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: form.email, password: form.password },
      })
      const p = await refresh()
      await navigateTo(
        p?.role === 'admin' && redirect.value === '/dashboard' ? '/admin' : redirect.value,
      )
    }
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="page max-w-lg">
    <p class="eyebrow mb-4">Your next show starts here</p>
    <h1>{{ register ? 'Buat akunmu.' : 'Selamat datang.' }}</h1>
    <form class="card mt-8 space-y-5" @submit.prevent="submit">
      <label v-if="register"
        >Nama lengkap<input
          v-model="form.full_name"
          autocomplete="name"
          minlength="2"
          maxlength="120"
          required /></label
      ><label
        >Email<input
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          maxlength="254" /></label
      ><label
        >Password<input
          v-model="form.password"
          type="password"
          :autocomplete="register ? 'new-password' : 'current-password'"
          :minlength="register ? 12 : 1"
          maxlength="128"
          required
      /></label>
      <p v-if="register" class="muted">Gunakan setidaknya 12 karakter.</p>
      <p v-if="message" role="status" :class="success ? 'notice' : 'error'">{{ message }}</p>
      <button :disabled="busy" class="btn w-full">
        {{ busy ? 'Memproses…' : register ? 'Daftar' : 'Masuk' }}</button
      ><NuxtLink
        class="block text-sm text-violet-600"
        :to="(register ? '/login' : '/register') + '?redirect=' + encodeURIComponent(redirect)"
        >{{ register ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar' }}</NuxtLink
      >
    </form>
    <NuxtLink to="/konfirmasi-email" class="mt-5 block text-sm text-violet-600"
      >Email konfirmasi belum diterima atau link kedaluwarsa?</NuxtLink
    >
  </div>
</template>
