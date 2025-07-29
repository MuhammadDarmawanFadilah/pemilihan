# 📋 PANDUAN RINGKAS TREN-SILAPOR

## 🎯 Apa itu Tren-Silapor?
Website untuk buat laporan dan voting online.

---

## 👥 3 ROLE PENGGUNA

🟦 **PENGUNJUNG** → Cuma bisa lihat halaman utama
🟨 **PEGAWAI** → Bisa buat laporan, kelola file pribadi  
🟥 **ADMIN** → Bisa atur semua (pegawai, pemilihan, data master)

---

## 🔐 LOGIN
1. Buka: `https://trensilapor.my.id/login`
2. Isi username & password
3. Klik "Masuk"

---

## 🟨 MENU PEGAWAI

### 📊 Laporan Pengawas
**Fungsi:** Lihat laporan yang dibuat pengawas/atasan
**Bisa:** 
- ✅ **Read:** Lihat semua laporan dari atasan, download lampiran, filter by tanggal/keyword

### 📄 Laporan Saya  
**Fungsi:** Buat & kelola laporan pribadi
**Bisa:**
- ✅ **Create:** Buat laporan baru (judul, tanggal, lokasi, deskripsi, upload file)
- ✅ **Read:** Lihat semua laporan yang pernah dibuat
- ✅ **Edit:** Ubah laporan yang masih Draft/Rejected
- ✅ **Delete:** Hapus laporan Draft
- ✅ **Status:** Monitor Pending/Approved/Rejected

### 📁 File Manager
**Fungsi:** Simpan & kelola dokumen pribadi
**Bisa:**
- ✅ **Create:** Upload file baru (KTP, Ijazah, CV, dll)
- ✅ **Read:** Lihat semua file yang diupload
- ✅ **Edit:** Rename file, pindah folder, ubah privacy
- ✅ **Delete:** Hapus file yang nggak perlu
- ✅ **Organize:** Buat folder, kategori file

### ✏️ Edit Pegawai
**Fungsi:** Update data profil pribadi
**Bisa:**
- ✅ **Edit:** Ubah data pribadi (nama, email, HP, alamat, foto)
- ✅ **Edit:** Ubah data kerja (jabatan, divisi, lokasi)
- ✅ **Update:** Pendidikan, keahlian, kontak darurat

### 🔑 Ganti Password
**Fungsi:** Ubah kata sandi untuk keamanan
**Bisa:**
- ✅ **Edit:** Ubah password lama ke baru

---

## 🟥 MENU ADMIN

### 👥 Kelola Pegawai
**Fungsi:** Registrasi pegawai & kelola akun login semua user. Pada menu pegawai ini dapat mengatur pegawai mengikuti pemilihan apa saja.
**Operasi yang Tersedia:**

**A. Read:** Lihat semua pegawai, filter, search
- Melihat daftar seluruh pegawai dalam sistem
- Filter berdasarkan status, jabatan, lokasi, atau role
- Pencarian pegawai berdasarkan nama, NIP, atau email
- Pagination untuk navigasi data dalam jumlah besar

**B. Edit:** Ubah data pegawai, jabatan, lokasi, status, role
- Mengubah informasi pribadi pegawai (nama, email, kontak)
- Memperbarui data pekerjaan (jabatan, divisi, lokasi penempatan)
- Mengatur role dan hak akses pengguna
- Mengelola status kepegawaian (aktif/non-aktif)

**C. Delete:** Hapus/archive pegawai yang resign
- Menghapus data pegawai yang sudah tidak aktif
- Melakukan archive data untuk keperluan audit
- Transfer laporan dan file ke pegawai pengganti

**D. Non Aktifkan:** Pegawai tidak dapat mengakses aplikasi
- Menonaktifkan akun tanpa menghapus data
- Memblokir akses login ke sistem
- Suspend sementara untuk kasus tertentu

**E. Create:** Daftar pegawai baru
- **Step 1:** Mengisi biografi data (nama, email, kontak, alamat, foto)
- **Step 2:** Memilih pemilihan yang diikuti (assign ke event voting tertentu)
- **Step 3:** Review dan konfirmasi data sebelum menyimpan

### 📍 Lokasi Pegawai
**Fungsi:** Monitoring lokasi pegawai (READ ONLY)
**Bisa:**
- ✅ **Read:** Lihat peta & daftar lokasi pegawai yang punya alamat lengkap
- ✅ **Monitor:** Track sebaran pegawai per provinsi/kota/kecamatan
- ✅ **View:** Detail koordinat GPS dan informasi lokasi
- ❌ **Create/Edit/Delete:** Nggak bisa ubah lokasi (diatur di Edit Pegawai)

### 🛡️ Roles
**Fungsi:** Atur hak akses & permission pegawai
**Bisa:**
- ✅ **Create:** Buat role baru (nama, deskripsi, hierarki, gaji)
- ✅ **Read:** Lihat semua role dan permission
- ✅ **Edit:** Ubah hak akses role, assign role ke pegawai
- ✅ **Delete:** Hapus role yang nggak dipake
- ✅ **Permission:** Set menu access, data access level (read/write/delete)

### 📄 File Pegawai
**Fungsi:** Monitor & validasi file semua pegawai
**Bisa:**
- ✅ **Read:** Monitor semua file yang diupload pegawai
- ✅ **Edit:** Approve/reject dokumen, request file tambahan
- ✅ **Delete:** Hapus file duplikat/rusak
- ✅ **Backup:** Archive file lama, cleanup storage

### 🗳️ Pemilihan
**Fungsi:** Buat & kelola voting/pemilihan online
**Bisa:**
- ✅ **Create:** Buat pemilihan baru (nama, jenis, jadwal, aturan)
- ✅ **Read:** Monitor hasil voting real-time
- ✅ **Edit:** Ubah kandidat, lokasi TPS, pengaturan voting
- ✅ **Delete:** Hapus pemilihan yang dibatalkan
- ✅ **Manage:** Input kandidat, verifikasi, publikasi hasil

### 📊 Laporan (Admin)
**Fungsi:** Review & approve semua laporan sistem
**Bisa:**
- ✅ **Read:** Lihat semua laporan dari semua pegawai
- ✅ **Edit:** Approve/reject laporan, kasih komentar
- ✅ **Action:** Export Excel/PDF, assign reviewer
- ✅ **Monitor:** Dashboard analytics, trending topics

### 📋 Jenis Laporan
**Fungsi:** Setup kategori & template form laporan
**Bisa:**
- ✅ **Create:** Tambah kategori laporan baru (Harian, Keuangan, Insiden)
- ✅ **Read:** Lihat semua kategori dan sub-kategori
- ✅ **Edit:** Ubah template form, validation rules, workflow
- ✅ **Delete:** Hapus kategori yang nggak dipake
- ✅ **Template:** Set field wajib, format, auto-calculation

### 🗺️ Lokasi Pemilihan
**Fungsi:** Setup TPS & monitoring pemilihan
**Bisa:**
- ✅ **Create:** Daftar TPS baru (nama, alamat, GPS, kapasitas, fasilitas)
- ✅ **Read:** Monitor status semua TPS real-time
- ✅ **Edit:** Ubah data TPS, assign tim KPPS, setup equipment
- ✅ **Delete:** Hapus TPS yang dibatalkan
- ✅ **Manage:** Koordinasi D-Day, emergency response

### 📁 Kategori File
**Fungsi:** Setup jenis dokumen yang boleh diupload
**Bisa:**
- ✅ **Create:** Tambah kategori file baru (Identitas, Pendidikan, Kerja)
- ✅ **Read:** Lihat semua kategori dan konfigurasi
- ✅ **Edit:** Ubah format allowed, ukuran max, retention policy
- ✅ **Delete:** Hapus kategori kosong
- ✅ **Validation:** Set auto-check format, virus scan, duplicate detect

### 💼 Jabatan
**Fungsi:** Setup struktur organisasi & hierarki
**Bisa:**
- ✅ **Create:** Tambah jabatan baru (nama, level, deskripsi, gaji range)
- ✅ **Read:** Lihat struktur organisasi lengkap
- ✅ **Edit:** Ubah job description, reporting line, benefits
- ✅ **Delete:** Hapus jabatan yang nggak ada orangnya
- ✅ **Hierarchy:** Set level 1-5, career path

### 🗺️ Wilayah
**Fungsi:** Database wilayah Indonesia (Provinsi-Kelurahan)
**Bisa:**
- ✅ **Read:** Lihat data provinsi, kota, kecamatan, kelurahan
- ✅ **Edit:** Update data pemimpin, koordinat, kode pos
- ✅ **Sync:** Sinkronisasi dengan data kemendagri
- ✅ **Search:** Cari wilayah by nama/kode

---

## 🔄 ALUR KERJA CEPAT

### Admin Setup Awal:
1. **Master Data** → Setup kategori, jabatan, wilayah
2. **Jenis Laporan** → Bikin template form  
3. **Input Pegawai** → Daftar semua user
4. **Setup Pemilihan** → Bikin event voting

### Pegawai Harian:
1. **Cek Laporan Pengawas** → Baca update atasan
2. **Buat Laporan** → Submit kegiatan hari ini
3. **Upload File** → Simpan dokumen penting

### Admin Jalanin Pemilihan:
1. **Setup** → Kandidat, TPS, tim
2. **D-Day** → Monitor real-time  
3. **Hasil** → Hitung dan publikasi

---

## ❗ BANTUAN CEPAT

**Login Gagal** → Reset password via admin
**File Nggak Bisa Upload** → Cek ukuran <10MB, format PDF/JPG
**Website Lambat** → Tutup tab lain, clear cache
**Butuh Help** → WA admin atau email support

---

*📅 Update: 19 Juli 2025 | 🎯 Versi: Super Ringkas*
