<script setup lang="ts">
import type { Testimonial } from '#shared/types'
const { data, pending, error, refresh } = await useFetch<Testimonial[]>('/api/testimonials')
</script>
<template>
  <div class="page">
    <p class="eyebrow mb-4">Cerita setelah konser</p>
    <h1>Testimoni customer</h1>
    <div class="mt-10">
      <ApiState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh"
        ><div class="grid-12 gap-y-6 md:[&>*]:col-span-4">
          <blockquote v-for="t in data" :key="t.id" class="card">
            <p class="text-amber-500" :aria-label="t.rating + ' dari 5 bintang'">
              {{ '★'.repeat(t.rating) }}
            </p>
            <p class="my-5">{{ t.content }}</p>
            <footer class="font-semibold">{{ t.customer_name }}</footer>
          </blockquote>
        </div></ApiState
      >
    </div>
  </div>
</template>
