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
const history = computed(() =>
  [...(data.value?.order_status_history || [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  ),
)
async function update() {
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
      ><div v-if="data" class="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div class="space-y-6">
          <OrderProgress :status="data.status" />
          <section class="card space-y-4">
            <p class="muted break-all">{{ data.order_number }}</p>
            <StatusBadge :status="data.status" />
            <h2>{{ data.concerts.title }}</h2>
            <p>{{ data.ticket_categories.name }} · {{ data.quantity }} tiket</p>
            <p class="muted">{{ dateTime(data.concerts.starts_at) }} · {{ data.concerts.venue }}</p>
            <dl class="space-y-3 border-t border-slate-200 pt-5">
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
            <label
              >Status berikutnya<select v-model="status" required>
                <option value="" disabled>Pilih status</option>
                <option v-for="s in transitions[data.status]" :key="s" :value="s">
                  {{ statusLabels[s] }}
                </option>
              </select></label
            ><label>Catatan untuk customer<textarea v-model="note" maxlength="1000" /></label>
            <p v-if="message" role="alert" class="error">{{ message }}</p>
            <button class="btn" :disabled="busy">
              {{ busy ? 'Menyimpan…' : 'Simpan status' }}
            </button>
          </form>
        </div>
        <section class="card h-fit">
          <div class="mb-6 flex items-center justify-between">
            <h2>Riwayat status</h2>
            <button class="text-sm text-violet-600" @click="refresh()">Refresh</button>
          </div>
          <ol class="space-y-6 border-l-2 border-violet-100 pl-5">
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
