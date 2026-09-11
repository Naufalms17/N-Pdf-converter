# 📖 Deploy N PDF Studio ke GitHub Pages

Panduan lengkap untuk deploy aplikasi N PDF Studio ke GitHub Pages dengan HTTPS otomatis.

## ✨ Keunggulan GitHub Pages

- ✅ **Gratis selamanya**
- ✅ **HTTPS otomatis** (dari Let's Encrypt)
- ✅ **Custom domain support**
- ✅ **CDN global** untuk kecepatan tinggi
- ✅ **Automatic security updates**
- ✅ **Zero configuration** untuk HTTPS

---

## 🚀 Cara Deploy

### Step 1: Setup Repository untuk GitHub Pages

**A. Jika Repository Sudah Ada:**

1. Buka settings repository
   - URL: `https://github.com/Naufalms17/N-Pdf-converter/settings/pages`

2. Di bagian **"Build and deployment"**:
   - **Source**: Pilih `Deploy from a branch`
   - **Branch**: Pilih `main` dan folder `/ (root)`
   - Click **Save**

**B. Jika Membuat Repository Baru:**

```bash
# Create new repository
mkdir N-Pdf-converter
cd N-Pdf-converter
git init

# Add files
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/Naufalms17/N-Pdf-converter.git

# Create main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 2: Verify Repository Structure

Repository harus memiliki struktur ini:

```
N-Pdf-converter/
├── index.html          ← File utama aplikasi
├── README.md           ← Dokumentasi
├── SECURITY.md         ← Guide keamanan
└── .gitignore          ← (Optional) File yang tidak di-track
```

**✅ Hanya `index.html` yang diperlukan!** (Karena aplikasi ini single-file)

### Step 3: Enable GitHub Pages

1. Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `root`
4. Click **Save**

**GitHub akan mulai deploy secara otomatis!** ⏳

---

## 🌐 Akses Aplikasi

### Default URL
```
https://naufalms17.github.io/N-Pdf-converter/
```

**Atau bisa juga:**
```
https://naufalms17.github.io/N-Pdf-converter/index.html
```

### Status Deploy
- Cek di: `Repository → Actions`
- Tunggu sampai status menjadi ✅ **passed**
- Biasanya selesai dalam **1-2 menit**

---

## 🔐 Security dengan GitHub Pages

GitHub Pages **sudah menyediakan:**

| Fitur | Status | Penjelasan |
|-------|--------|-----------|
| **HTTPS** | ✅ Auto | Sertifikat gratis dari Let's Encrypt |
| **HSTS** | ✅ Auto | Force HTTPS untuk semua koneksi |
| **CDN** | ✅ Auto | Kecepatan delivery global |
| **DDoS Protection** | ✅ Auto | Cloudflare di belakang GitHub Pages |

---

## 📝 GitHub Pages Configuration (Optional)

Buat file `_config.yml` di root untuk konfigurasi tambahan:

```yaml
# _config.yml
title: N PDF Studio - Enterprise Edition
description: All-in-One Web-based PDF Utility Toolkit
theme: jekyll-theme-minimal
markdown: kramdown

# Security
include: ['.well-known']
exclude: ['*.env', '*.env.local', 'node_modules', '.git']

# SEO
github:
  owner_url: https://github.com/Naufalms17
```

---

## 🎯 Deploy Workflow Otomatis

GitHub Pages **secara otomatis** akan:

1. ✅ Detect perubahan di `main` branch
2. ✅ Build aplikasi (jika ada build process)
3. ✅ Deploy ke `https://naufalms17.github.io/N-Pdf-converter/`
4. ✅ Enable HTTPS otomatis
5. ✅ Setup Cloudflare CDN

**Waktu deploy**: 30 detik - 2 menit

### Check Deploy Status

```bash
# Lihat di GitHub
https://github.com/Naufalms17/N-Pdf-converter/actions

# Atau dari terminal
gh repo view Naufalms17/N-Pdf-converter --web
```

---

## 🔄 Update Aplikasi

Setelah deploy, jika ada update:

```bash
# 1. Edit file lokal (index.html, dll)
nano index.html

# 2. Commit perubahan
git add .
git commit -m "Update: tambah fitur baru"

# 3. Push ke GitHub
git push origin main
```

**GitHub Pages otomatis akan:**
- ✅ Detect perubahan
- ✅ Re-deploy aplikasi
- ✅ Update di live URL dalam 1-2 menit

---

## 📱 Custom Domain (Optional)

Jika ingin domain sendiri seperti `pdf.yourdomain.com`:

### A. Setup DNS

1. Buka DNS provider (Namecheap, GoDaddy, dll)
2. Tambahkan A record:
   ```
   Type: A
   Host: pdf (untuk pdf.yourdomain.com)
   Value: 185.199.108.153
           185.199.109.153
           185.199.110.153
           185.199.111.153
   TTL: 3600
   ```

   **Atau** CNAME record:
   ```
   Type: CNAME
   Host: pdf
   Value: naufalms17.github.io
   TTL: 3600
   ```

### B. Setup GitHub Pages

1. Repository Settings → Pages
2. Di bagian **Custom domain**:
   - Masukkan: `pdf.yourdomain.com`
   - Click **Save**

3. GitHub akan otomatis:
   - ✅ Buat CNAME file
   - ✅ Setup SSL certificate
   - ✅ Enable HTTPS

**Tunggu 5-10 menit untuk DNS propagation**

---

## 🔍 Verify Security

Setelah deploy, verify keamanannya:

### 1. Check HTTPS
```bash
curl -I https://naufalms17.github.io/N-Pdf-converter/
```

Expected response:
```
HTTP/2 200
Strict-Transport-Security: max-age=31536000
```

### 2. Test dengan Security Headers
```bash
# Gunakan online tool
https://securityheaders.com/?q=https://naufalms17.github.io/N-Pdf-converter/
```

### 3. SSL Certificate Check
```bash
# Check certificate
https://www.ssllabs.com/ssltest/?d=naufalms17.github.io
```

---

## 📊 Monitor Deploy

### View Actions Logs
```
GitHub → Repository → Actions → All workflows
```

Setiap push akan trigger workflow automatic:
- 📝 Build step
- 🚀 Deploy step
- ✅ Status (passed/failed)

### Troubleshooting

**Problem: Deploy failed**
```
1. Check Actions tab untuk error message
2. Verify index.html syntax valid
3. Pastikan file tidak lebih besar dari 1GB
```

**Problem: 404 Not Found**
```
1. Verify file path di URL
2. Tunggu 2-5 menit untuk propagation
3. Hard refresh (Ctrl+Shift+R)
```

**Problem: HTTPS not working**
```
1. Tunggu 5-15 menit untuk certificate generation
2. Jangan custom domain terlalu cepat
3. Check Enforce HTTPS sudah enabled
```

---

## 🔐 Best Practices untuk Production

### 1. Add .gitignore
```bash
# .gitignore
.env
.env.local
.DS_Store
*.log
node_modules/
dist/
.next/
```

### 2. Add LICENSE
```bash
# Tambahkan LICENSE file
# Pilih: MIT, Apache 2.0, GPL 3.0, dll
# Atau copy template dari:
# https://github.com/Naufalms17/N-Pdf-converter/blob/main/LICENSE
```

### 3. Add README
```bash
# README.md sudah ada, pastikan:
# ✅ Deskripsi jelas
# ✅ Cara setup
# ✅ Dokumentasi
# ✅ License info
```

### 4. Protect Main Branch
```
Settings → Branches → Add branch protection rule
- Branch name pattern: main
- ✅ Require a pull request before merging
- ✅ Require status checks to pass
```

---

## 📈 Performance Optimization

GitHub Pages automatic optimize untuk:
- ✅ Gzip compression
- ✅ Browser caching
- ✅ CDN caching
- ✅ Minification

**Tapi bisa di-improve dengan:**

### 1. Add Service Worker (offline support)
```javascript
// sw.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/N-Pdf-converter/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW registration failed'));
}
```

### 2. Optimize Images
```bash
# Compress images sebelum upload
npx imagemin img/ --out-dir=img/

# Atau gunakan online tool:
# https://tinypng.com/
```

---

## 🎉 Selesai!

Aplikasi Anda sekarang **live** di GitHub Pages dengan:

✅ **HTTPS otomatis** dari Let's Encrypt  
✅ **CDN global** untuk kecepatan tinggi  
✅ **Auto security updates**  
✅ **Gratis selamanya**  
✅ **Version control** dengan Git  

---

## 📚 Useful Commands

```bash
# Clone repository
git clone https://github.com/Naufalms17/N-Pdf-converter.git

# Update aplikasi
cd N-Pdf-converter
git pull origin main

# View live URL
echo "https://naufalms17.github.io/N-Pdf-converter/"

# Check deploy status
gh repo view Naufalms17/N-Pdf-converter --web
```

---

## 🔗 Helpful Links

- **GitHub Pages Docs**: https://pages.github.com/
- **GitHub Pages Custom Domain**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **GitHub Actions**: https://github.com/features/actions
- **Let's Encrypt**: https://letsencrypt.org/
- **Cloudflare Security**: https://www.cloudflare.com/

---

## 📞 Support

Jika ada masalah:

1. **Check GitHub Actions**
   - URL: `https://github.com/Naufalms17/N-Pdf-converter/actions`

2. **Common Issues**
   - 404 error? Tunggu 2-5 menit
   - HTTPS tidak kerja? Tunggu 10-15 menit
   - Deploy failed? Check file syntax

3. **Need Help?**
   - Create GitHub Issue
   - Check GitHub Pages Docs
   - Contact GitHub Support

---

**Deployment Status**: ✅ Ready to Deploy  
**Security Level**: 🔐 Enterprise Grade  
**Last Updated**: September 2026
