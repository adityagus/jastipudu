<script setup lang="ts">
import type { Order, Status } from '#shared/types'
import { dateTime, money, statusLabels, transitions } from '#shared/utils/format'
const props = defineProps<{ admin?: boolean }>()
const route = useRoute()
const { data, pending, error, refresh } = await useFetch<Order>('/api/orders/' + route.params.id)
const status = ref<Status | ''>('')
const note = ref('')
const message = ref('')
const busy = ref(false)
const reviewing = ref(false)
const saved = ref(false)
watch([status, note], () => {
  reviewing.value = false
  saved.value = false
})
const history = computed(() =>
  [...(data.value?.order_status_history || [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  ),
)
async function update() {
  if (
    busy.value ||
    !data.value ||
    !status.value ||
    !transitions[data.value.status].includes(status.value)
  )
    return
  if (!reviewing.value) {
    reviewing.value = true
    message.value = ''
    return
  }
  busy.value = true
  message.value = ''
  try {
    await $fetch('/api/orders/' + route.params.id, {
      method: 'PATCH',
      body: { status: status.value, note: note.value },
    })
    status.value = ''
    note.value = ''
    await refresh()
    reviewing.value = false
    saved.value = true
  } catch (e) {
    message.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="page">
    <AccountNav :admin="props.admin" />
    <h1 class="mb-8">Detail pesanan</h1>
    <p v-if="route.query.created" class="notice mb-6">
      Pesanan berhasil dibuat. Simpan nomor pesanan dan hubungi admin untuk konfirmasi.
    </p>
    <ApiState :pending="pending" :error="error" @retry="refresh"
      ><div v-if="data" class="grid-12 gap-y-6">
        <OrderProgress :status="data.status" :admin="admin" />
        <div class="space-y-6 lg:col-span-7">
          <section class="card space-y-4">
            <p class="muted break-all">{{ data.order_number }}</p>
            <StatusBadge :status="data.status" />
            <h2>{{ data.concerts.title }}</h2>
            <p>{{ data.ticket_categories.name }} · {{ data.quantity }} tiket</p>
            <p class="muted">{{ dateTime(data.concerts.starts_at) }} · {{ data.concerts.venue }}</p>
            <dl class="space-y-3 border-t border-stone-200 pt-5">
              <div class="flex justify-between">
                <dt>Tiket × {{ data.quantity }}</dt>
                <dd>{{ money(data.ticket_price * data.quantity) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>Biaya jasa × {{ data.quantity }}</dt>
                <dd>{{ money(data.service_fee * data.quantity) }}</dd>
              </div>
              <div class="flex justify-between font-bold">
                <dt>Total</dt>
                <dd>{{ money(data.total) }}</dd>
              </div>
            </dl>
            <WhatsappButton :order="data.id" />
          </section>
          <form
            v-if="admin && transitions[data.status].length"
            class="card space-y-4"
            @submit.prevent="update"
          >
            <h2>Perbarui status</h2>
            <p class="muted">
              {{
                reviewing
                  ? 'Langkah 2 dari 2: periksa perubahan sebelum menyimpan.'
                  : 'Langkah 1 dari 2: pilih status berikutnya dan isi catatan.'
              }}
            </p>
            <div v-show="!reviewing" class="space-y-4">
              <label
                >Status berikutnya<select v-model="status" required :disabled="busy">
                  <option value="" disabled>Pilih status</option>
                  <option v-for="s in transitions[data.status]" :key="s" :value="s">
                    {{ statusLabels[s] }}
                  </option>
                </select></label
              ><label
                >Catatan untuk customer<textarea v-model="note" maxlength="1000" :disabled="busy" />
              </label>
            </div>
            <div
              v-if="reviewing && status"
              class="rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3"
              aria-live="polite"
            >
              <p>
                Dari <strong>{{ statusLabels[data.status] }}</strong> menjadi
                <strong>{{ statusLabels[status] }}</strong
                >.
              </p>
              <p class="whitespace-pre-wrap text-sm">{{ note || 'Tanpa catatan tambahan.' }}</p>
              <p v-if="status === 'cancelled'" class="text-sm font-medium text-red-700">
                Pesanan akan dibatalkan. Status ini tidak dapat dikembalikan melalui alur pesanan.
              </p>
            </div>
            <p v-if="message" role="alert" class="error">{{ message }}</p>
            <div class="flex flex-wrap gap-3">
              <button
                v-if="reviewing"
                type="button"
                class="btn-secondary"
                :disabled="busy"
                @click="reviewing = false"
              >
                Kembali
              </button>
              <button class="btn" :disabled="busy || !status">
                {{ busy ? 'Menyimpan…' : reviewing ? 'Konfirmasi perubahan' : 'Periksa perubahan' }}
              </button>
            </div>
          </form>
          <p v-if="saved" role="status" class="notice">Status pesanan berhasil diperbarui.</p>
        </div>
        <section class="card h-fit lg:col-span-5">
          <div class="mb-6 flex items-center justify-between">
            <h2>Riwayat status</h2>
            <button class="text-sm text-brand-600" @click="refresh()">Refresh</button>
          </div>
          <ol class="space-y-6 border-l-2 border-brand-100 pl-5">
            <li v-for="h in history" :key="h.id">
              <StatusBadge :status="h.status" />
              <p class="muted mt-2">{{ dateTime(h.created_at) }}</p>
              <p class="mt-2 text-sm">{{ h.note }}</p>
            </li>
          </ol>
        </section>
      </div></ApiState
    >
  </div>
</template>
