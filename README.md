# N PDF Studio (1984) - Enterprise Edition

Aplikasi web all-in-one untuk manipulasi dan konversi file PDF dengan antarmuka bergaya retro DOS 8-bit yang nostalgic. Dibangun dengan HTML, CSS, dan JavaScript vanilla tanpa dependency backend.

## ✨ Fitur Utama

### Konversi File
- 📸 **Foto ke PDF** - Ubah gambar (JPG, PNG) menjadi dokumen PDF
- 📄 **PDF ke Foto** - Ekstrak halaman PDF sebagai gambar
- 📝 **Teks ke PDF** - Konversi teks plain menjadi dokumen PDF
- 🌐 **HTML ke PDF** - Render dan simpan konten HTML sebagai PDF
- 🗣️ **Terjemahkan PDF** - Terjemahkan konten PDF ke berbagai bahasa

### Manipulasi PDF
- 🔗 **Gabung PDF** - Menggabungkan multiple PDF files menjadi satu dokumen
- ✂️ **Pisah PDF** - Memisahkan halaman dari PDF menjadi file terpisah
- 📌 **Ekstrak Gambar** - Mengambil semua gambar dari PDF
- 🗑️ **Hapus Halaman** - Menghapus halaman tertentu dari PDF
- 🔄 **Urutkan Halaman** - Mengatur ulang urutan halaman PDF

### Optimasi & Keamanan
- 📉 **Kompres PDF** - Mengurangi ukuran file dengan berbagai level kompresi
- 🔐 **Kunci PDF** - Melindungi PDF dengan password encryption
- 🔓 **Buka Password** - Menghapus proteksi password dari PDF
- 🔏 **Watermark** - Menambahkan teks watermark ke dokumen PDF
- 📐 **Crop Margins** - Memotong margin halaman PDF

### Pengaturan Lanjutan
- 📋 **Nomor Halaman** - Menambahkan nomor halaman dengan berbagai posisi
- 📏 **Putar PDF** - Merotasi dokumen dengan sudut 90°, 180°, 270°
- 📄 **Pilih Ukuran Kertas** - Support A4, Letter, Legal
- 🎨 **Orientasi** - Potret (Portrait) atau Lanskap (Landscape)

## 🎮 Antarmuka Retro DOS

Aplikasi menggunakan desain visual yang terinspirasi dari era DOS 1980-an dengan:
- Menu bar klasik dengan style DOS navigation
- Palet warna cyan/teal retro dengan aksen kuning dan merah coral
- Font monospace **VT323** untuk authentic retro feel
- Sound effects 8-bit retro untuk setiap interaksi
- Bottom status bar bergaya classic DOS prompt

## 🚀 Teknologi

- **HTML5** - Struktur dan markup dokumen
- **CSS3** - Styling retro DOS dan responsive design
- **Vanilla JavaScript** - Logika aplikasi tanpa framework
- **Library PDF:**
  - [jsPDF](https://github.com/parallax/jsPDF) - Pembuatan PDF
  - [PDF-Lib](https://pdf-lib.js.org/) - Manipulasi PDF lanjutan
  - [PDF.js](https://mozilla.github.io/pdf.js/) - Rendering PDF

## 📦 Cara Menggunakan

### 1. Buka Aplikasi
Buka file `index.html` di browser modern (Chrome, Firefox, Safari, Edge)

### 2. Pilih Modul
Klik tombol modul di bagian atas atau gunakan menu **Tools** untuk memilih operasi yang diinginkan

### 3. Upload/Input File
- **Drag & drop** file ke kotak upload, atau
- **Klik kotak upload** untuk memilih file, atau
- **Ketik teks** jika menggunakan modul Teks/HTML

### 4. Konfigurasi Opsi
Atur parameter seperti:
- Ukuran kertas (A4, Letter, Legal)
- Orientasi (Portrait/Landscape)
- Level kompresi
- Password untuk keamanan
- Dan lainnya sesuai modul

### 5. Eksekusi Proses
Klik tombol **[ EKSEKUSI PROSES ]** untuk memulai operasi

### 6. Download Hasil
File hasil otomatis diunduh dengan format:
```
N_PDF_[MODUL]_[NOMOR].pdf
```

## 🎯 Keyboard Shortcuts

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl+O` | Buka Berkas |
| `Ctrl+R` | Reset Berkas |
| `Enter` | Eksekusi Proses |
| `F` | Menu File |
| `E` | Menu Edit |
| `T` | Menu Tools |
| `O` | Menu Options |
| `H` | Menu Help |

## 📋 Format File yang Didukung

**Input:**
- Gambar: `.jpg`, `.png`
- PDF: `.pdf`
- Teks: `.txt`
- HTML: `.html`, `.htm`

**Output:**
- PDF: `.pdf`
- Gambar: `.png`, `.jpg`
- Teks: `.txt`

## 🔊 Fitur Audio

Aplikasi dilengkapi dengan sound effects 8-bit retro yang dimainkan saat:
- Mengklik tombol
- Membuka menu
- Mengeksekusi proses
- Mengubah settings

*Suara dapat dimatikan melalui browser's audio settings*

## 🎨 Palet Warna

| Variable | Warna | Fungsi |
|----------|-------|--------|
| `--dos-bg` | #5ce0d8 | Background utama (Cyan) |
| `--dos-text` | #050a0e | Teks gelap |
| `--dos-yellow` | #ffd166 | Accent kuning retro |
| `--dos-green` | #06d6a0 | Teks konsol hijau |
| `--dos-red` | #ff70a6 | Hotkey text merah coral |
| `--dos-black` | #050a0e | Menu & bar gelap |

## 💻 Kompatibilitas Browser

- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (tidak didukung)

Memerlukan browser modern dengan dukungan:
- ES6+ JavaScript
- Web Audio API
- File API
- Fetch API

## 📝 Struktur Kode

```
index.html          # File tunggal yang berisi semua HTML, CSS, dan JavaScript
```

File ini mencakup:
1. **DOCTYPE & Meta Tags** (baris 1-16)
2. **Style CSS** (baris 18-491)
3. **HTML Markup** (baris 493-731)
4. **JavaScript Logic** (baris 733-akhir)

## 🎓 Versi

- **Versi**: 1.0
- **Edition**: Enterprise Edition
- **Theme**: DOS 1984 Retro Aesthetic
- **Last Updated**: September 2026

## 📄 Lisensi

Gratis untuk digunakan, dimodifikasi, dan didistribusikan.

## 👨‍💻 Penulis

**Naufalms17** - https://github.com/Naufalms17

## 🐛 Catatan

- Semua proses berjalan secara **client-side** (di browser, bukan server)
- Data file tidak diunggah ke server
- Kecepatan tergantung pada spesifikasi hardware komputer
- PDF besar mungkin memerlukan waktu pemrosesan lebih lama

## 🚦 Tips & Trik

1. **Untuk kualitas terbaik**: Gunakan "Kompresi Rendah (Kualitas Tinggi)"
2. **Untuk file kecil**: Gunakan "Kompresi Tinggi (70%)"
3. **Batch processing**: Upload multiple file sekaligus
4. **Preview terlebih dahulu**: Gunakan fitur Preview sebelum eksekusi final
5. **Custom watermark**: Masukkan teks watermark di opsi sebelum eksekusi

---

*Terima kasih telah menggunakan N PDF Studio!* 🎉
