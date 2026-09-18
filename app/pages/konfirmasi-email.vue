<script setup lang="ts">
const email = ref('')
const busy = ref(false)
const message = ref('')
const success = ref(false)
const availableAt = ref(0)
async function resend() {
  if (Date.now() < availableAt.value) {
    success.value = false
    message.value = 'Tunggu satu menit sebelum meminta email berikutnya.'
    return
  }
  busy.value = true
  message.value = ''
  success.value = false
  try {
    await $fetch('/api/auth/resend', { method: 'POST', body: { email: email.value } })
    availableAt.value = Date.now() + 60_000
    success.value = true
    message.value =
      'Jika akun masih menunggu konfirmasi, email baru akan dikirim. Periksa inbox atau spam dan gunakan email yang paling baru.'
  } catch (error) {
    message.value = errorMessage(error)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="page max-w-lg">
    <h1>Konfirmasi email</h1>
    <p class="muted mt-5">
      Link tidak valid atau kedaluwarsa? Minta email konfirmasi baru untuk akun yang sudah kamu
      daftarkan.
    </p>
    <form class="card mt-8 space-y-5" @submit.prevent="resend">
      <label
        >Email akun<input
          v-model="email"
          type="email"
          autocomplete="email"
          maxlength="254"
          required
      /></label>
      <p v-if="message" role="status" :class="success ? 'notice' : 'error'">{{ message }}</p>
      <button class="btn w-full" :disabled="busy">
        {{ busy ? 'Memproses…' : 'Kirim ulang email konfirmasi' }}
      </button>
      <NuxtLink to="/login" class="block text-sm text-violet-600">Sudah konfirmasi? Masuk</NuxtLink>
    </form>
  </div>
</template>
