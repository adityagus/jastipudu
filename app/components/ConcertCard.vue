<script setup lang="ts">
import type { Concert } from '#shared/types'
import { money, dateTime } from '#shared/utils/format'
defineProps<{ concert: Concert; index?: number }>()
</script>
<template>
  <NuxtLink
    :to="'/concerts/' + concert.id"
    class="group overflow-hidden rounded-2xl border border-stone-200 bg-white"
  >
    <div
      class="relative flex h-52 flex-col justify-end overflow-hidden p-6 text-brand-950"
      :class="
        (index ?? 0) % 3 === 0
          ? 'bg-blush-300'
          : (index ?? 0) % 3 === 1
            ? 'bg-blush-200'
            : 'bg-brand-100'
      "
    >
      <img
        v-if="concert.poster_url"
        :src="concert.poster_url"
        :alt="concert.title"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        v-if="concert.poster_url"
        class="absolute inset-0 bg-linear-to-t from-brand-50 via-brand-50/90 to-transparent"
      />
      <div class="absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-white/30" />
      <span class="relative mb-auto w-fit rounded-full bg-white/90 px-3 py-1 text-xs"
        >LIVE EXPERIENCE</span
      >
      <span class="relative text-3xl font-black tracking-tight">{{ concert.artist }}</span>
      <span class="relative mt-2 text-xs uppercase tracking-widest"
        >{{ concert.city }} · Live in concert</span
      >
    </div>
    <div class="space-y-3 p-5">
      <p class="eyebrow">{{ concert.city }}</p>
      <h3 class="group-hover:text-brand-600">{{ concert.title }}</h3>
      <p class="muted">{{ dateTime(concert.starts_at) }}</p>
      <p class="muted">{{ concert.venue }}</p>
      <div class="flex items-center justify-between border-t border-stone-100 pt-4">
        <p class="text-sm">
          <span class="muted">Tiket mulai </span><br /><strong>{{
            concert.ticket_categories.length
              ? money(Math.min(...concert.ticket_categories.map((c) => c.price)))
              : 'Segera hadir'
          }}</strong>
        </p>
        <span class="text-brand-600">Lihat detail</span>
      </div>
    </div>
  </NuxtLink>
</template>
