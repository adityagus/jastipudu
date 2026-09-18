<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { profile, refresh } = useAuth()
const form = reactive({
  full_name: profile.value?.full_name || '',
  phone: profile.value?.phone || '',
})
const message = ref('')
const busy = ref(false)
async function save() {
  busy.value = true
  try {
    await $fetch('/api/profile', { method: 'PUT', body: form })
    await refresh()
    message.value = 'Profil tersimpan.'
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="page">
    <AccountNav />
    <h1>Profil saya</h1>
    <form class="card mt-8 max-w-xl space-y-5" @submit.prevent="save">
      <label
        >Nama lengkap<input
          v-model="form.full_name"
          minlength="2"
          maxlength="120"
          autocomplete="name"
          required /></label
      ><label
        >Nomor telepon<input
          v-model="form.phone"
          type="tel"
          pattern="[+]?[0-9]{8,15}"
          placeholder="62…"
          autocomplete="tel"
          required
      /></label>
      <p v-if="message" role="status" class="notice">{{ message }}</p>
      <button class="btn" :disabled="busy">Simpan profil</button>
    </form>
  </div>
</template>
