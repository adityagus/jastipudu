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
const mediaMessage = ref('')
const mediaFailed = ref(false)
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
  if (busy.value || uploading.value) return
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
  if (!c || busy.value || uploading.value) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  mediaMessage.value = ''
  mediaFailed.value = false
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    mediaFailed.value = true
    mediaMessage.value = 'Pilih gambar JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.'
    input.value = ''
    return
  }
  uploading.value = kind
  try {
    const body = new FormData()
    body.append('kind', kind)
    body.append('file', file)
    const result = await $fetch<{ url: string }>(`/api/admin/concerts/${c.id}/media`, {
      method: 'POST',
      body,
    })
    form[kind === 'poster' ? 'poster_url' : 'layout_url'] = result.url
    mediaMessage.value =
      kind === 'poster'
        ? 'Pamflet tersimpan dan akan tampil di banner konser.'
        : 'Gambar layout venue tersimpan.'
  } catch (e) {
    mediaFailed.value = true
    mediaMessage.value = errorMessage(e)
  } finally {
    uploading.value = null
    input.value = ''
  }
}
</script>
<template>
  <form class="card grid-12 max-w-3xl gap-y-5" @submit.prevent="save">
    <div class="md:col-span-12 rounded-xl border border-brand-100 bg-brand-50 p-4">
      <p class="font-semibold">Autofill data publik</p>
      <p class="muted mt-1">
        Cari artis atau event dari sumber publik. Periksa dan lengkapi hasil sebelum dipublikasikan.
      </p>
      <div class="mt-3 flex gap-2">
        <input
          v-model="lookup"
          class="min-w-0 flex-1"
          placeholder="Nama artis atau event"
          maxlength="120"
          @keyup.enter.prevent="findPublicData"
        /><button
          type="button"
          class="btn-secondary shrink-0 whitespace-nowrap"
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
          class="rounded-lg bg-white p-3 text-left hover:bg-brand-100"
          @click="autofill(item)"
        >
          <strong>{{ item.title }}</strong
          ><span class="muted block"
            >{{ item.artist }}<template v-if="item.city"> · {{ item.city }}</template></span
          >
        </button>
      </div>
    </div>
    <label class="md:col-span-6"
      >Nama konser<input v-model="form.title" minlength="3" maxlength="160" required /></label
    ><label class="md:col-span-6"
      >Slug<input
        v-model="form.slug"
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        maxlength="160"
        placeholder="nama-konser"
        required /></label
    ><label class="md:col-span-6"
      >Artis<input v-model="form.artist" minlength="2" maxlength="160" required /></label
    ><label class="md:col-span-6"
      >Jadwal (WIB)<input v-model="form.starts_at" type="datetime-local" required /></label
    ><label class="md:col-span-6"
      >Venue<input v-model="form.venue" minlength="2" maxlength="200" required /></label
    ><label class="md:col-span-6"
      >Kota<input v-model="form.city" minlength="2" maxlength="100" required /></label
    ><label class="md:col-span-12"
      >Deskripsi<textarea
        v-model="form.description"
        minlength="10"
        maxlength="5000"
        required
      /></label
    ><label class="flex items-center gap-3 md:col-span-6"
      ><input v-model="form.is_active" type="checkbox" class="w-5" />Publikasikan konser</label
    >
    <div
      v-if="c"
      class="md:col-span-12 grid-12 gap-y-4 rounded-xl border border-stone-200 p-4 sm:[&>*]:col-span-6"
    >
      <div>
        <p class="font-semibold">Pamflet konser</p>
        <img
          v-if="form.poster_url"
          :src="form.poster_url"
          alt="Pamflet konser"
          class="mt-2 aspect-video w-full rounded-lg object-cover"
        />
        <input
          class="mt-3"
          type="file"
          aria-label="Unggah pamflet konser"
          :disabled="busy || !!uploading"
          accept="image/jpeg,image/png,image/webp"
          @change="uploadMedia('poster', $event)"
        />
        <p class="muted mt-1">
          {{
            uploading === 'poster'
              ? 'Mengunggah pamflet...'
              : 'JPG, PNG, WebP maksimal 5 MB. Gambar digunakan sebagai banner konser.'
          }}
        </p>
      </div>
      <div>
        <p class="font-semibold">Layout venue</p>
        <img
          v-if="form.layout_url"
          :src="form.layout_url"
          alt="Layout venue"
          class="mt-2 aspect-video w-full rounded-lg object-contain bg-stone-50"
        />
        <input
          class="mt-3"
          type="file"
          aria-label="Unggah layout venue"
          :disabled="busy || !!uploading"
          accept="image/jpeg,image/png,image/webp"
          @change="uploadMedia('layout', $event)"
        />
        <p class="muted mt-1">
          {{ uploading === 'layout' ? 'Mengunggah…' : 'Opsional, maksimal 5 MB.' }}
        </p>
      </div>
    </div>
    <p
      v-if="mediaMessage"
      :role="mediaFailed ? 'alert' : 'status'"
      :class="mediaFailed ? 'error' : 'notice'"
    >
      {{ mediaMessage }}
    </p>
    <p v-if="message" role="alert" class="error md:col-span-12">{{ message }}</p>
    <div class="md:col-span-12">
      <button class="btn" :disabled="busy || !!uploading">
        {{ busy ? 'Menyimpan…' : 'Simpan & kelola tiket' }}
      </button>
    </div>
  </form>
</template>
