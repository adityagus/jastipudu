<script setup lang="ts">
import type { Concert, Testimonial } from '#shared/types'
import { money } from '#shared/utils/format'
const { data: concerts, pending, error, refresh } = await useFetch<Concert[]>('/api/concerts')
const { data: testimonials } = await useFetch<Testimonial[]>('/api/testimonials', {
  query: { limit: 3 },
})
const featured = computed(() => concerts.value?.slice(0, 6) || [])
const lowestPrice = computed(() => {
  const prices = featured.value.flatMap((concert) =>
    concert.ticket_categories.map((category) => category.price),
  )
  return prices.length ? money(Math.min(...prices)) : 'Segera hadir'
})
</script>
<template>
  <div>
    <section
      class="relative isolate overflow-hidden bg-linear-to-br from-blush-200 to-brand-50 text-brand-950"
    >
      <div class="absolute -left-32 top-20 -z-10 h-80 w-80 rounded-full bg-blush-300/60 blur-3xl" />
      <div
        class="absolute -right-20 -top-28 -z-10 h-[28rem] w-[28rem] rounded-full border-[70px] border-white/40"
      />
      <div class="page grid-12 min-h-[34rem] items-center gap-y-12 py-16 md:py-24">
        <div class="md:col-span-7">
          <p class="mb-6 text-xs font-bold uppercase tracking-[.28em] text-brand-700">
            Jastip tiket konser yang lebih tenang
          </p>
          <h1
            class="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] sm:text-5xl md:text-7xl"
          >
            Datang untuk musiknya.<br /><span class="text-brand-600">Biar kami urus tiketnya.</span>
          </h1>
          <p class="mt-7 max-w-xl text-lg leading-8 text-brand-800">
            Pilih konser yang kamu tunggu, titipkan proses pembeliannya, lalu pantau setiap langkah
            sampai tiketmu aman.
          </p>
          <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <NuxtLink class="btn" to="/concerts">Cari konser</NuxtLink
            ><NuxtLink
              class="btn-secondary border-brand-200 bg-white/80 text-brand-900 hover:bg-white"
              to="/cara-kerja"
              >Lihat cara kerja</NuxtLink
            >
          </div>
          <div class="mt-10 flex flex-wrap gap-6 text-sm text-brand-700">
            <span>✓ Biaya transparan</span><span>✓ Status real-time</span
            ><span>✓ Bantuan manusia</span>
          </div>
        </div>
        <div class="relative mx-auto w-[calc(100%-2rem)] min-w-0 max-w-md rotate-2 md:col-span-5">
          <div class="absolute -inset-4 rounded-[2rem] border border-blush-300/30" />
          <div
            class="relative overflow-hidden rounded-[2rem] bg-blush-200 p-7 text-brand-950 shadow-2xl shadow-brand-900/10"
          >
            <div class="flex items-center justify-between">
              <span
                class="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-700"
                >Next up</span
              ><span class="text-xl">✦ ✦</span>
            </div>
            <div class="my-16">
              <p class="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
                Make it a night
              </p>
              <p class="mt-3 text-6xl font-black leading-[.9] tracking-[-.06em]">
                LIVE<br /><span class="text-brand-600">LOUD.</span><br />LATER.
              </p>
            </div>
            <div class="flex justify-between border-t border-stone-300 pt-4 text-sm">
              <span>Jastipudu.</span><span>your seat awaits</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-stone-200 bg-white">
      <div class="page grid-12 gap-y-5 py-8 sm:[&>*]:col-span-4">
        <div>
          <p class="text-3xl font-black text-brand-600">{{ concerts?.length || '—' }}</p>
          <p class="muted">konser aktif untuk dijelajahi</p>
        </div>
        <div>
          <p class="text-3xl font-black text-brand-600">{{ lowestPrice }}</p>
          <p class="muted">harga tiket mulai dari</p>
        </div>
        <div>
          <p class="text-3xl font-black text-brand-600">1 dashboard</p>
          <p class="muted">untuk order dan statusmu</p>
        </div>
      </div>
    </section>

    <main class="page">
      <section class="py-12 md:py-20">
        <div class="page-heading">
          <div>
            <p class="eyebrow mb-3">Pilih malam terbaikmu</p>
            <h2 class="text-3xl md:text-4xl">Konser yang akan datang</h2>
            <p class="muted mt-3 max-w-xl">
              Dari panggung besar sampai venue intim. Semua detail, kategori, dan biaya tersedia
              sebelum kamu membuat order.
            </p>
          </div>
          <NuxtLink to="/concerts" class="btn-secondary">Lihat semua konser →</NuxtLink>
        </div>
        <ApiState :pending="pending" :error="error" :empty="!featured.length" @retry="refresh"
          ><div class="grid-12 gap-y-6 sm:[&>*]:col-span-6 lg:[&>*]:col-span-4">
            <ConcertCard
              v-for="(concert, index) in featured"
              :key="concert.id"
              :concert="concert"
              :index="index"
            /></div
        ></ApiState>
      </section>

      <section class="grid-12 gap-y-6 py-12 md:py-20">
        <div class="md:col-span-5">
          <p class="eyebrow mb-3">Satu proses yang jelas</p>
          <h2 class="text-3xl md:text-4xl">
            Tiket ribet?<br /><span class="text-brand-600">Biar kami yang pegang.</span>
          </h2>
          <p class="muted mt-5 max-w-md">
            Kami membantu proses titip pembelian secara transparan. Kamu tetap tahu apa yang terjadi
            dan kapan harus mengambil keputusan.
          </p>
        </div>
        <div class="grid-12 gap-y-4 md:col-span-7 sm:[&>*]:col-span-4">
          <article
            v-for="(step, index) in [
              { title: 'Temukan', text: 'Pilih konser, tanggal, dan kategori tiket.' },
              { title: 'Titipkan', text: 'Buat order dengan rincian harga yang jelas.' },
              { title: 'Pantau', text: 'Ikuti status sampai tiket diamankan.' },
            ]"
            :key="step.title"
            class="card relative overflow-hidden"
          >
            <span class="text-5xl font-black text-brand-100">0{{ index + 1 }}</span>
            <h3 class="relative mt-8">{{ step.title }}</h3>
            <p class="muted mt-3">{{ step.text }}</p>
          </article>
        </div>
      </section>

      <section class="rounded-[2rem] bg-blush-300 p-8 text-stone-950 md:p-12">
        <div class="grid-12 gap-y-6 md:items-end">
          <div class="md:col-span-8">
            <p class="eyebrow text-stone-700">Kenapa Jastipudu?</p>
            <h2 class="mt-3 max-w-2xl text-3xl md:text-5xl">
              Lebih siap berangkat, lebih sedikit drama.
            </h2>
          </div>
          <NuxtLink
            class="btn bg-stone-950 hover:bg-stone-800 md:col-span-4 md:justify-self-end"
            to="/cara-kerja"
            >Pelajari prosesnya</NuxtLink
          >
        </div>
        <div class="mt-10 grid-12 gap-y-6 border-t border-stone-900/15 pt-7 sm:[&>*]:col-span-4">
          <div>
            <p class="font-bold">Harga terbuka</p>
            <p class="mt-2 text-sm text-stone-700">Harga tiket dan biaya jasa tampil terpisah.</p>
          </div>
          <div>
            <p class="font-bold">Order terlacak</p>
            <p class="mt-2 text-sm text-stone-700">Perubahan status tersimpan dalam riwayat.</p>
          </div>
          <div>
            <p class="font-bold">Ada yang bisa dihubungi</p>
            <p class="mt-2 text-sm text-stone-700">Hubungi jastip langsung lewat WhatsApp.</p>
          </div>
        </div>
      </section>

      <section class="py-12 md:py-20">
        <div class="page-heading">
          <div>
            <p class="eyebrow mb-3">Suara dari venue</p>
            <h2 class="text-3xl md:text-4xl">Mereka sudah sampai.</h2>
          </div>
          <NuxtLink to="/testimoni" class="text-sm font-semibold text-brand-600"
            >Baca semua →</NuxtLink
          >
        </div>
        <div v-if="testimonials?.length" class="grid-12 gap-y-5 md:[&>*]:col-span-4">
          <blockquote v-for="testimonial in testimonials" :key="testimonial.id" class="card">
            <p class="text-amber-500">{{ '★'.repeat(testimonial.rating) }}</p>
            <p class="mt-5 leading-7">“{{ testimonial.content }}”</p>
            <footer class="mt-6 text-sm font-bold">{{ testimonial.customer_name }}</footer>
          </blockquote>
        </div>
        <div v-else class="card flex flex-wrap items-center justify-between gap-5">
          <p class="muted">Cerita customer akan muncul di sini setelah dipublikasikan.</p>
          <NuxtLink class="btn-secondary" to="/testimoni">Lihat testimoni</NuxtLink>
        </div>
      </section>

      <section
        class="relative overflow-hidden rounded-[2rem] bg-blush-200 p-8 text-brand-950 md:p-14"
      >
        <div
          class="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-brand-400/20"
        />
        <p class="eyebrow relative text-brand-700">Ready when you are</p>
        <h2 class="relative mt-4 max-w-2xl text-3xl md:text-5xl">
          Konser berikutnya sudah menunggu.
        </h2>
        <p class="relative mt-5 max-w-xl text-brand-800">
          Jelajahi daftar konser, pilih kategori tiket, dan mulai dari satu order yang jelas.
        </p>
        <NuxtLink class="btn relative mt-8" to="/concerts">Mulai jelajah konser</NuxtLink>
      </section>
    </main>
  </div>
</template>
