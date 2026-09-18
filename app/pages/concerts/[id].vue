<script setup lang="ts">
import type { Concert, Order } from '#shared/types'
import { dateTime, money } from '#shared/utils/format'
const route = useRoute()
const { profile } = useAuth()
const { data, pending, error, refresh } = await useFetch<Concert>(
  '/api/concerts/' + route.params.id,
)
const categoryId = ref(String(route.query.category || data.value?.ticket_categories[0]?.id || ''))
const quantity = ref(Math.min(6, Math.max(1, Number(route.query.quantity) || 1)))
const category = computed(() =>
  data.value?.ticket_categories.find((c) => c.id === categoryId.value),
)
const busy = ref(false)
const message = ref('')
let requestId = ''
watch([categoryId, quantity], () => {
  requestId = ''
})
async function order() {
  if (!profile.value)
    return navigateTo(
      '/login?redirect=' +
        encodeURIComponent(
          route.path + '?category=' + categoryId.value + '&quantity=' + quantity.value,
        ),
    )
  busy.value = true
  message.value = ''
  try {
    requestId ||= crypto.randomUUID()
    const result = await $fetch<Order>('/api/orders', {
      method: 'POST',
      body: { category_id: categoryId.value, quantity: quantity.value, request_id: requestId },
    })
    await navigateTo('/orders/' + result.id + '?created=1')
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="page">
    <NuxtLink to="/concerts" class="muted">← Semua konser</NuxtLink
    ><ApiState :pending="pending" :error="error" @retry="refresh"
      ><div v-if="data" class="mt-8 grid-12 gap-y-6">
        <section class="lg:col-span-7">
          <div
            class="rounded-3xl border border-brand-100 bg-linear-to-br from-blush-200 to-brand-50 p-6 text-brand-950 sm:p-9"
          >
            <p class="mb-5 text-sm text-brand-700">{{ data.artist }} · LIVE</p>
            <h1>{{ data.title }}</h1>
            <p class="mt-8">{{ dateTime(data.starts_at) }}</p>
            <p class="mt-2 text-brand-700">{{ data.venue }}, {{ data.city }}</p>
          </div>
          <img
            v-if="data.poster_url"
            :src="data.poster_url"
            :alt="`Pamflet ${data.title}`"
            class="mt-6 max-h-[32rem] w-full rounded-2xl object-cover shadow-sm"
          />
          <div class="mt-6 grid-12 gap-y-3 sm:[&>*]:col-span-4">
            <div class="card">
              <p class="eyebrow">Jadwal jelas</p>
              <p class="mt-2 text-sm">Waktu dan venue tertera sebelum order.</p>
            </div>
            <div class="card">
              <p class="eyebrow">Biaya transparan</p>
              <p class="mt-2 text-sm">Harga tiket dan jasa dipisah.</p>
            </div>
            <div class="card">
              <p class="eyebrow">Tracking</p>
              <p class="mt-2 text-sm">Setiap perubahan status tersimpan.</p>
            </div>
          </div>
          <h2 class="mt-8">Tentang konser</h2>
          <p class="mt-4 whitespace-pre-line leading-7 text-stone-600">{{ data.description }}</p>
          <div v-if="data.layout_url" class="mt-8">
            <h2>Layout venue</h2>
            <img
              :src="data.layout_url"
              :alt="`Layout venue ${data.title}`"
              loading="lazy"
              class="mt-4 w-full rounded-2xl border border-stone-200 bg-white object-contain"
            />
          </div>
          <p class="notice mt-6">
            Jastip adalah jasa pembelian tiket. Pesanan belum menjamin tiket didapatkan. Konfirmasi
            ketersediaan dan pembayaran dilakukan bersama admin.
          </p>
        </section>
        <form class="card h-fit space-y-5 lg:col-span-5 lg:sticky lg:top-6" @submit.prevent="order">
          <h2>Titip tiketmu</h2>
          <label
            >Kategori tiket<select v-model="categoryId" required>
              <option value="" disabled>Pilih kategori</option>
              <option v-for="c in data.ticket_categories" :key="c.id" :value="c.id">
                {{ c.name }} — {{ money(c.price) }} · kuota {{ c.quota }}
              </option>
            </select></label
          ><label
            >Jumlah tiket<input v-model.number="quantity" type="number" min="1" max="6" required
          /></label>
          <div v-if="category" class="space-y-3 border-y border-stone-200 py-5 text-sm">
            <p class="flex justify-between">
              <span>Harga tiket × {{ quantity }}</span
              ><strong>{{ money(category.price * quantity) }}</strong>
            </p>
            <p class="flex justify-between">
              <span>Biaya jastip × {{ quantity }}</span
              ><strong>{{ money(category.service_fee * quantity) }}</strong>
            </p>
            <p class="flex justify-between text-base">
              <span>Total</span
              ><strong>{{ money((category.price + category.service_fee) * quantity) }}</strong>
            </p>
          </div>
          <p v-if="message" role="alert" class="error">{{ message }}</p>
          <button
            class="btn w-full"
            :disabled="busy || !category || new Date(data.starts_at) <= new Date()"
          >
            {{ busy ? 'Membuat pesanan…' : 'Titip tiket sekarang' }}
          </button>
          <p class="muted">Harga dan biaya jasa tersimpan saat pesanan dibuat.</p>
          <WhatsappButton />
        </form></div
    ></ApiState>
  </div>
</template>
