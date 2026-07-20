# Dokumentasi Step-by-Step Pembuatan Sistem Prompt Generator Pro

Dokumentasi ini menjelaskan langkah-langkah teknis dalam membangun sistem **Prompt Generator Pro**, sebuah platform berbasis web yang membantu pengguna menghasilkan prompt AI berkualitas tinggi untuk pembuatan landing page bisnis.

---

## 1. Persiapan & Stack Teknologi

Sebelum memulai, pastikan Anda memiliki lingkungan pengembangan yang siap.

- **Frontend:** HTML5, Vanilla CSS (Modern), Vanilla JavaScript (ES6+).
- **Backend/Database:** [Supabase](https://supabase.com/) (Auth, PostgreSQL Database).
- **Icons & Fonts:** Font Awesome 6, Google Fonts (Outfit/Poppins).
- **Deployment:** Vercel atau Netlify.

---

## 2. Struktur Proyek

Susunan folder yang rapi memudahkan pengembangan dan kolaborasi:

```text
root/
├── index.html              # Landing Page Utama
├── login.html              # Halaman Login & Registrasi
├── dashboard.html          # Panel User (Dashboard)
├── generator.html          # Tool Utama Prompt Generator
├── saved-prompts.html      # Daftar Prompt yang Disimpan
├── css/
│   └── style.css           # Styling Global & Komponen
├── js/
│   ├── auth.js             # Logika Autentikasi Supabase
│   ├── generator.js        # Logika Inti Pembuat Prompt
│   ├── storage.js          # Operasi CRUD Database (Save/Delete)
│   ├── supabase-config.js  # Konfigurasi API Supabase
│   └── utils.js            # Fungsi Pembantu UI (Loading, Alert)
└── supabase-schema.sql     # Skema Database & Polisi Keamanan (RLS)
```

---

## 3. Langkah 1: Setup Backend (Supabase)

1. **Buat Project Baru:** Masuk ke Dashboard Supabase dan buat project baru.
2. **Setup Database:** Jalankan script di `supabase-schema.sql` pada SQL Editor Supabase untuk membuat tabel `prompts` dan `profiles`.
3. **Konfigurasi RLS (Row Level Security):** Pastikan user hanya bisa melihat dan mengedit data milik mereka sendiri.
4. **Dapatkan API Key:** Salin `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke dalam `js/supabase-config.js`.

---

## 4. Langkah 2: Desain Antarmuka (UI/UX)

Sistem ini menggunakan desain modern dengan estetika premium:

- **Landing Page:** Fokus pada *Conversion* dengan CTA (Call to Action) yang jelas.
- **Generator UI:** Menggunakan sistem *Multi-step Form* atau *Dynamic Fields* berdasarkan kategori bisnis yang dipilih.
- **Responsive Design:** Pastikan tampilan optimal di mobile menggunakan CSS Flexbox dan Grid.

---

## 5. Langkah 3: Membangun Mesin Generator (Logic)

Ini adalah bagian terpenting dari sistem. Logika berada di `js/generator.js`.

1. **Business Templates:** Buat objek besar berisi kategori bisnis (Restoran, Klinik, IT, dll).
2. **Dynamic Fields:** Saat user memilih kategori "Restoran", tampilkan input khusus seperti "Jenis Masakan" dan "Menu Signature".
3. **Prompt Builder:** Gabungkan input user menjadi narasi prompt yang terstruktur.
   - Contoh Formula: `[Persona AI] + [Detail Bisnis] + [Keperluan Teknis] + [Format Output]`.
4. **Formatting:** Gunakan karakter box-drawing (═══) agar output prompt terlihat profesional saat di-copy ke ChatGPT/Claude.

---

## 6. Langkah 4: Integrasi Autentikasi

1. **Login & Register:** Gunakan `supabase.auth.signUp()` dan `signInWithPassword()`.
2. **Session Management:** Cek status login di setiap halaman premium (Dashboard, Generator). Jika belum login, arahkan kembali ke `login.html`.
3. **User Profile:** Simpan data tambahan user (seperti paket langganan) di tabel `profiles`.

---

## 7. Langkah 5: Fitur Simpan & Kelola Prompt

1. **Save Function:** Kirim hasil generate prompt ke tabel `prompts` di Supabase.
2. **Fetch Data:** Di halaman `saved-prompts.html`, ambil data berdasarkan `user_id`.
3. **Actions:** Tambahkan fitur **Copy to Clipboard**, **Download as TXT**, dan **Delete**.

---

## 8. Langkah 6: Deployment

1. **Push ke GitHub:** Upload seluruh kode ke repository GitHub.
2. **Hubungkan ke Vercel:** Import repository ke Vercel.
3. **Environment Variables:** Masukkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di settings Vercel demi keamanan.
4. **Live!** Project Anda kini dapat diakses secara publik.

---

## 9. Skills Applied

Melalui pengembangan sistem **Prompt Generator Pro** ini, berbagai keahlian teknis dan profesional telah diterapkan dan dikembangkan, meliputi:

1. **Full-Stack Web Development:** Menguasai pembuatan aplikasi web modern menggunakan HTML5, Vanilla CSS (Flexbox/Grid), dan Vanilla JavaScript (ES6+) tanpa bergantung pada framework berat.
2. **Database Integration & Management:** Mahir dalam mengimplementasikan Supabase (PostgreSQL) sebagai Backend-as-a-Service, termasuk merancang skema database, relasi tabel, dan menulis operasi CRUD.
3. **Logic-Driven UI/UX Design:** Mampu membangun antarmuka pengguna yang dinamis dan adaptif berdasarkan logika kondisional (seperti *Multi-step Form* dan *Dynamic Fields*), serta memastikan desain yang responsif dan estetika premium yang berfokus pada konversi.
4. **Authentication & Security:** Memahami praktik terbaik dalam manajemen autentikasi pengguna (Registrasi, Login, Session Management) dan penerapan kebijakan keamanan tingkat basis data seperti *Row Level Security* (RLS).
5. **Deployment & DevOps Workflows:** Menguasai alur kerja kontrol versi menggunakan Git/GitHub, serta integrasi *deployment* dengan platform hosting cloud (Vercel/Netlify) dan manajemen *Environment Variables* yang aman.

---

## Tips Pengembangan
- **Keamanan:** Jangan pernah mengekspos `SERVICE_ROLE_KEY` di sisi client (browser). Gunakan hanya `ANON_KEY`.
- **User Experience:** Tambahkan animasi transisi halus saat berpindah antar kategori di generator.
- **Iterasi:** Selalu perbarui template prompt berdasarkan perkembangan model AI terbaru (GPT-4o, Claude 3.5 Sonnet).

---
*Dokumentasi ini dibuat untuk membantu tim pengembang memahami alur kerja sistem Prompt Generator Pro.*
