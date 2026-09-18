<template>
  <div class="page max-w-3xl">
    <p class="eyebrow mb-4">Sederhana, dari awal</p>
    <h1>Cara titip tiket</h1>
    <div class="mt-10 space-y-5">
      <article
        v-for="(item, i) in [
          {
            title: 'Pilih konser & kategori',
            text: 'Jelajahi konser, cek jadwal, harga tiket, dan biaya jasa per tiket.',
          },
          {
            title: 'Login dan buat pesanan',
            text: 'Daftar atau masuk, pilih jumlah tiket, lalu periksa ringkasan pesanan.',
          },
          {
            title: 'Konfirmasi bersama admin',
            text: 'Hubungi WhatsApp dari halaman pesanan. Pembayaran dan ketentuan refund dikonfirmasi bersama admin sebelum proses pembelian.',
          },
          {
            title: 'Pantau hingga selesai',
            text: 'Lihat perubahan status dan riwayat proses di dashboard. Pesanan tidak menjamin tiket berhasil didapatkan.',
          },
        ]"
        :key="item.title"
        class="card"
      >
        <p class="eyebrow mb-3">Langkah 0{{ i + 1 }}</p>
        <h2>{{ item.title }}</h2>
        <p class="mt-3 text-stone-600">{{ item.text }}</p>
      </article>
    </div>
    <NuxtLink class="btn mt-8" to="/concerts">Mulai jelajah konser →</NuxtLink>
  </div>
</template>
