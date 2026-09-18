# TitipTiket

MVP jastip tiket konser dengan Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Nitro, Supabase Postgres dan Supabase Auth. Target deployment Vercel. UI berbahasa Indonesia, mobile-first, tanpa layanan WhatsApp berbayar.

## Status pengerjaan

Supabase cloud sudah ditautkan dengan proyek pada `.env`. Lima migration dan seed (3 konser fiktif, 4 kategori) sudah diterapkan. Security Advisor bersih untuk schema dan fungsi aplikasi; dashboard Supabase masih memberi rekomendasi mengaktifkan leaked-password protection. Konfirmasi email aktif. Akun aplikasi/admin pertama sudah disiapkan. Vercel belum dideploy.

Pemeriksaan 17 September 2026: lint dan typecheck bersih; pengujian SQL/RLS dan smoke test lulus; build Node serta `npm run build -- --preset vercel` berhasil. Pemindaian heuristik repository tidak menemukan pola kredensial. Build masih menampilkan warning dependency upstream Vue/Zod yang tidak menggagalkan build. Pengujian login/order end-to-end pada Supabase nyata belum dijalankan.

## Menjalankan proyek

Node saat setup: **22.23.1**, NPM **10.9.8**. Gunakan Node 22.12+ atau LTS yang kompatibel. PowerShell komputer ini memblokir `npm.ps1`, sehingga contoh menggunakan `npm.cmd` / `npx.cmd`. Pada shell lain gunakan `npm` / `npx`.

```powershell
npm.cmd ci
Copy-Item .env.example .env
# Isi .env secara lokal, lalu:
npm.cmd run dev
```

Buka `http://localhost:3000`. Tanpa konfigurasi Supabase, halaman publik tetap tampil dengan pesan konfigurasi pada bagian data. Data demo berasal dari seed database, bukan pesanan atau testimonial palsu di frontend.

| Environment                 | Isi                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `NUXT_SUPABASE_URL`         | Project URL Supabase atau URL Supabase lokal                                                              |
| `NUXT_SUPABASE_ANON_KEY`    | Publishable key atau legacy anon key, **bukan service role/secret key**                                   |
| `NUXT_WHATSAPP_NUMBER`      | Nomor bisnis format internasional, hanya angka, tanpa `+`/spasi                                           |
| `NUXT_TICKETMASTER_API_KEY` | Opsional. Key Ticketmaster hanya server-side untuk autofill event; tanpa ini fallback MusicBrainz dipakai |

Semua config tersebut berada pada runtime server. Service-role key tidak dibutuhkan aplikasi. Jangan kirim kredensial ke chat, masukkan langsung ke `.env` atau environment Vercel. `.env` dan build output diabaikan Git.

## Supabase lokal

Jalankan Docker Desktop terlebih dahulu. Lalu:

```powershell
npx.cmd supabase start
npx.cmd supabase status
```

CLI menjalankan migration dan seed saat stack dibuat pertama kali. Ambil URL dan publishable/anon key dari status untuk `.env`. Email konfirmasi lokal tersedia di inbox development Supabase pada alamat yang ditampilkan CLI. Konfirmasi email diaktifkan, password minimal 12 karakter.

Untuk menerapkan migration baru pada database lokal yang sudah ada:

```powershell
npx.cmd supabase migration up
npx.cmd supabase db lint --local --level error
```

Untuk **menghapus dan membangun ulang database lokal development saja**, `npx.cmd supabase db reset --local` menjalankan kembali migration dan seed. Jangan gunakan reset untuk database berisi data yang perlu dipertahankan.

## Menghubungkan Supabase cloud — perlu tindakan pemilik

1. Login dashboard Supabase dan buat/pilih proyek.
2. Isi URL dan publishable/anon key pada `.env` lokal.
3. Login CLI dan tautkan project reference Anda:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase db push --dry-run
npx.cmd supabase db push
```

CLI meminta kredensial database bila diperlukan; jangan menaruhnya dalam command yang disimpan di source. Untuk proyek development baru yang memang memerlukan konser fiktif, gunakan `db push --include-seed` ketika pertama menerapkan migration, menggantikan `db push`. Seed tidak untuk produksi dan bukan penawaran tiket nyata.

4. Pada Authentication, aktifkan email/password, konfirmasi email, dan panjang password minimal 12. Isi Site URL dengan domain aplikasi dan redirect allowlist yang sesuai. Untuk development gunakan `http://localhost:3000`. Setelah konfirmasi email, pengguna login memakai password di `/login`.
5. Daftarkan akun admin lewat aplikasi dan konfirmasi email. Pemilik database menetapkan admin pertama melalui SQL Editor, menggunakan UUID akun yang sudah diverifikasi:

```sql
update public.profiles
set role = 'admin'
where id = 'REPLACE_WITH_VERIFIED_USER_UUID'::uuid;
```

Penetapan admin adalah keputusan pemilik. Signup selalu membuat customer, termasuk bila metadata signup mencoba mengirim `role=admin`. UI/API customer tidak memiliki izin mengubah role.

## Fitur dan flow

- Publik: home, konser mendatang, pencarian, detail, kategori, harga tiket dan biaya jasa terpisah, cara kerja, testimoni terpublikasi, login/register.
- Customer: pemilihan kategori dan jumlah tetap tersedia setelah login/register, membuat order, ringkasan biaya, dashboard, daftar/detail order, riwayat status, profil, WhatsApp dengan nomor order.
- Admin: dashboard, CRUD konser, CRUD kategori tiket, daftar/detail order, transisi status dengan catatan, daftar customer, CRUD testimoni.
- Admin War Room: antrean pending/processing, quick action, order terbaru, statistik agregat database untuk total order, status, customer, konser, dan revenue selesai.
- Import publik: form konser dapat mencari artis/event melalui endpoint server. Ticketmaster dipakai jika key opsional tersedia; fallback MusicBrainz tidak membutuhkan key dan hasilnya selalu harus ditinjau admin.
- Status: `pending → confirmed → processing → secured → completed`. Pembatalan tersedia sebelum tiket secured. Transisi lain ditolak database.
- Tidak ada pembayaran otomatis. Konfirmasi pembayaran, kegagalan pembelian, dan ketentuan refund dikomunikasikan admin. Nilai order selesai di dashboard bukan bukti penerimaan pembayaran.
- Konser/kategori yang sudah dipakai order tidak bisa dihapus. Nonaktifkan konser bila perlu; arsip customer tetap terbaca.
- Supabase Storage belum digunakan karena MVP tidak mengunggah poster atau bukti pembayaran.

## API

| Method      | Path                                      | Akses                                                  |
| ----------- | ----------------------------------------- | ------------------------------------------------------ |
| GET         | `/api/concerts`                           | Publik: aktif dan mendatang; `?admin=true` untuk admin |
| GET         | `/api/concerts/:id`                       | Publik aktif / admin semua                             |
| POST        | `/api/concerts`                           | Admin                                                  |
| PUT, DELETE | `/api/concerts/:id`                       | Admin                                                  |
| POST        | `/api/categories`                         | Admin                                                  |
| PUT, DELETE | `/api/categories/:id`                     | Admin                                                  |
| POST        | `/api/orders`                             | Customer login; category_id, quantity, request_id UUID |
| GET         | `/api/orders`                             | Milik sendiri / admin semua                            |
| GET         | `/api/orders/:id`                         | Milik sendiri / admin                                  |
| PATCH       | `/api/orders/:id`                         | Admin; status dan note                                 |
| GET         | `/api/auth/me`                            | Profil sesi atau null                                  |
| POST        | `/api/auth/login`, `/register`, `/logout` | Auth                                                   |
| PUT         | `/api/profile`                            | Profil sendiri                                         |
| GET         | `/api/customers`                          | Admin                                                  |
| GET         | `/api/testimonials`                       | Publik terpublikasi; `?admin=true` untuk admin         |
| POST        | `/api/testimonials`                       | Admin                                                  |
| PUT, DELETE | `/api/testimonials/:id`                   | Admin                                                  |
| GET         | `/api/whatsapp?order=UUID`                | Nomor order diverifikasi kepemilikannya                |

Mutation memakai JSON dan Origin yang sama dengan aplikasi. Validasi Zod berada di `server/utils/validation.ts`; orchestration order di `server/services/orders.ts`; aturan atomik transaksi di function SQL.

## Keamanan database

Enam tabel memakai UUID, foreign key, timestamp, constraint dan indeks. RLS aktif pada semuanya. Public hanya membaca konser aktif/kategori terkait serta testimoni terpublikasi. Customer hanya membaca profil dan pesanan sendiri; admin dapat membaca customer dan order. Riwayat tidak bisa diedit langsung. Update profil dibatasi secara column-level ke nama/telepon.

Order dibuat via RPC terotorisasi memakai identitas sesi pengguna; database membaca harga sendiri, mengunci kategori, memeriksa kuota, dan mencatat history dalam satu transaksi. Request UUID menangani retry tanpa membuat order ganda. Harga order adalah snapshot. Perubahan status melalui RPC khusus admin, dengan validasi transisi dan trigger audit. RPC tetap menegakkan aturan jika dipanggil langsung dengan JWT pengguna; API Nitro menambahkan validasi dan pemeriksaan sesi. Tidak ada service-role bypass.

Session disimpan melalui cookie HttpOnly, SameSite=Lax, Secure saat produksi. Halaman SSR meneruskan refresh cookie pada response luar. API memverifikasi pengguna melalui `getUser()`. Response API tidak dicache. Tidak ada secret pada `runtimeConfig.public`.

## Pemeriksaan

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:db
npm.cmd run build
npm.cmd run test:smoke
npm.cmd run test:supabase
npm.cmd run check:secrets
```

`test:db` menjalankan semua migration dan seed pada PostgreSQL PGlite, lalu menguji RLS, isolasi pengguna, eskalasi role, quota, retry, snapshot harga, transisi status, riwayat, dan proteksi foreign key. Tes ini meniru default privilege Supabase untuk mendeteksi izin fungsi yang terlalu luas. `test:smoke` menjalankan build Node pada port 3199 tanpa kredensial dan memeriksa SSR, redirect auth, CSRF, serta validasi input. `test:supabase` membaca `.env` dan menjalankan pemeriksaan read-only terhadap Supabase nyata melalui Nitro pada port 3198; tidak membuat akun atau order. Pemindaian secret bersifat heuristik dan tidak mencetak nilai rahasia.

Pengujian integrasi yang perlu dijalankan setelah Supabase tersedia:

1. Daftar dua customer, konfirmasi email, dan login.
2. Buat order customer A. Customer B harus tidak bisa membaca ID tersebut.
3. Pastikan total sesuai kategori × jumlah, termasuk biaya jasa.
4. Login admin, ubah status, pastikan history muncul pada customer.
5. Coba kuota habis, konser nonaktif, order ganda dengan request UUID sama, serta delete konser berorder.
6. Pastikan link WhatsApp memakai nomor environment dan nomor order yang benar.
7. Uji refresh sesi, logout, dan navigasi mobile pada domain deployment.

## Deployment Vercel — perlu login pemilik

Import repository lewat Vercel, pilih preset Nuxt, install `npm ci`, build `npm run build`, dan Node 22.x. Tambahkan tiga environment variable di atas untuk environment deployment yang sesuai. Nitro memilih preset Vercel otomatis pada platform; tidak perlu `nuxt generate` karena aplikasi memerlukan backend. Tinjau migration dan terapkan ke Supabase sebelum deployment. Setelah domain tersedia, sesuaikan Supabase Site URL dan redirect allowlist. Belum ada deployment cloud yang dilakukan dari workspace ini.

## Struktur

```text
app/
  assets/css/main.css
  components/             # Form, card, badge, navigasi, order, WhatsApp
  composables/useAuth.ts
  middleware/             # auth dan admin
  pages/
    index.vue, cara-kerja.vue, testimoni.vue, login.vue, register.vue
    concerts/             # Daftar dan detail
    dashboard.vue, profile.vue, orders/
    admin/                # Dashboard, konser, kategori, order, customer, testimoni
  utils/errors.ts
server/
  api/                    # REST endpoints Nitro
  middleware/             # CSRF, no-cache, refresh sesi SSR
  services/orders.ts
  utils/                  # Supabase, authorization, validation
shared/
  types/index.ts
  utils/format.ts
supabase/
  config.toml
  migrations/             # Schema/RLS/RPC dan quota guard
  seed.sql                # 3 konser fiktif, 4 kategori
scripts/                  # SQL tests, smoke tests, secret scan
.env.example
nuxt.config.ts
eslint.config.mjs
tsconfig.json
vercel.json
package.json
package-lock.json
```

Daftar MVP membatasi hasil ke 200 konser, 500 order/customer, dan 100 testimoni pada halaman operasional. War Room memakai agregasi database untuk statistik order dan revenue, sementara daftar antrean menampilkan 1.000 order terbaru. Pagination penuh untuk volume sangat besar belum diimplementasikan. Data demo memakai tanggal 2027 dan akan hilang dari daftar mendatang setelah tanggal tersebut.

Referensi: [Nuxt installation](https://nuxt.com/docs/4.x/getting-started/installation), [Tailwind Vite](https://tailwindcss.com/docs/installation/using-vite), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side), [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations), [Nuxt on Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt).
