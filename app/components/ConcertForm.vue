<script setup lang="ts">
import type { Concert } from '#shared/types'
const props = defineProps<{ concert?: Concert }>()
const c = props.concert
const form = reactive({
  title: c?.title || '',
  slug: c?.slug || '',
  artist: c?.artist || '',
  description: c?.description || '',
  venue: c?.venue || '',
  city: c?.city || '',
  starts_at: c
    ? new Date(new Date(c.starts_at).getTime() + 7 * 3600000).toISOString().slice(0, 16)
    : '',
  is_active: c?.is_active ?? false,
  poster_url: c?.poster_url || null,
  layout_url: c?.layout_url || null,
})
const message = ref('')
const busy = ref(false)
const lookup = ref('')
const lookupBusy = ref(false)
const uploading = ref<'poster' | 'layout' | null>(null)
const suggestions = ref<
  Array<{
    title: string
    artist: string
    description: string
    venue: string
    city: string
    starts_at: string
  }>
>([])
async function findPublicData() {
  lookupBusy.value = true
  try {
    suggestions.value = await $fetch('/api/admin/concerts/lookup', { query: { q: lookup.value } })
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    lookupBusy.value = false
  }
}
function autofill(item: (typeof suggestions.value)[number]) {
  form.title = item.title
  form.artist = item.artist
  form.description = item.description || form.description
  form.venue = item.venue || form.venue
  form.city = item.city || form.city
  if (item.starts_at) form.starts_at = new Date(item.starts_at).toISOString().slice(0, 16)
  suggestions.value = []
}
async function save() {
  busy.value = true
  message.value = ''
  try {
    const payload = { ...form, starts_at: new Date(form.starts_at + ':00+07:00').toISOString() }
    const result = await $fetch<Concert>(c ? '/api/concerts/' + c.id : '/api/concerts', {
      method: c ? 'PUT' : 'POST',
      body: payload,
    })
    await navigateTo('/admin/concerts/' + result.id + '/tickets')
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function uploadMedia(kind: 'poster' | 'layout', event: Event) {
  if (!c) return
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) return (message.value = 'Ukuran gambar maksimal 5 MB.')
  uploading.value = kind
  try {
    const body = new FormData()
    body.append('kind', kind)
    body.append('file', file)
    const result = await $fetch<{ url: string }>(`/api/admin/concerts/${c.id}/media`, { method: 'POST', body })
    form[kind === 'poster' ? 'poster_url' : 'layout_url'] = result.url
    message.value = 'Media berhasil diunggah.'
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    uploading.value = null
  }
}
</script>
<template>
  <form class="card grid max-w-3xl gap-5 md:grid-cols-2" @submit.prevent="save">
    <div class="md:col-span-2 rounded-xl border border-violet-100 bg-violet-50 p-4">
      <p class="font-semibold">Autofill data publik</p>
      <p class="muted mt-1">
        Cari artis atau event dari sumber publik. Periksa dan lengkapi hasil sebelum dipublikasikan.
      </p>
      <div class="mt-3 flex gap-2">
        <input
          v-model="lookup"
          placeholder="Nama artis atau event"
          maxlength="120"
          @keyup.enter.prevent="findPublicData"
        /><button
          type="button"
          class="btn-secondary"
          :disabled="lookupBusy || lookup.length < 2"
          @click="findPublicData"
        >
          {{ lookupBusy ? 'Mencari…' : 'Cari' }}
        </button>
      </div>
      <div v-if="suggestions.length" class="mt-3 grid gap-2">
        <button
          v-for="item in suggestions"
          :key="item.artist + item.title"
          type="button"
          class="rounded-lg bg-white p-3 text-left hover:bg-violet-100"
          @click="autofill(item)"
        >
          <strong>{{ item.title }}</strong
          ><span class="muted block"
            >{{ item.artist }}<template v-if="item.city"> · {{ item.city }}</template></span
          >
        </button>
      </div>
    </div>
    <label>Nama konser<input v-model="form.title" minlength="3" maxlength="160" required /></label
    ><label
      >Slug<input
        v-model="form.slug"
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        maxlength="160"
        placeholder="nama-konser"
        required /></label
    ><label>Artis<input v-model="form.artist" minlength="2" maxlength="160" required /></label
    ><label>Jadwal (WIB)<input v-model="form.starts_at" type="datetime-local" required /></label
    ><label>Venue<input v-model="form.venue" minlength="2" maxlength="200" required /></label
    ><label>Kota<input v-model="form.city" minlength="2" maxlength="100" required /></label
    ><label class="md:col-span-2"
      >Deskripsi<textarea
        v-model="form.description"
        minlength="10"
        maxlength="5000"
        required
      /></label
    ><label class="flex items-center gap-3"
      ><input v-model="form.is_active" type="checkbox" class="w-5" />Publikasikan konser</label
    >
    <div v-if="c" class="md:col-span-2 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
      <div>
        <p class="font-semibold">Pamflet konser</p>
        <img v-if="form.poster_url" :src="form.poster_url" alt="Pamflet konser" class="mt-2 aspect-video w-full rounded-lg object-cover" />
        <input class="mt-3" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadMedia('poster', $event)" />
        <p class="muted mt-1">JPG, PNG, WebP maksimal 5 MB.</p>
      </div>
      <div>
        <p class="font-semibold">Layout venue</p>
        <img v-if="form.layout_url" :src="form.layout_url" alt="Layout venue" class="mt-2 aspect-video w-full rounded-lg object-contain bg-slate-50" />
        <input class="mt-3" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadMedia('layout', $event)" />
        <p class="muted mt-1">{{ uploading ? 'Mengunggah…' : 'Opsional, maksimal 5 MB.' }}</p>
      </div>
    </div>
    <p v-if="message" role="alert" class="error md:col-span-2">{{ message }}</p>
    <div class="md:col-span-2">
      <button class="btn" :disabled="busy">
        {{ busy ? 'Menyimpan…' : 'Simpan & kelola tiket' }}
      </button>
    </div>
  </form>
</template>
