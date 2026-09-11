# 🔐 N PDF Studio - Security Guide

Panduan keamanan lengkap untuk mengamankan aplikasi N PDF Studio ketika di-deploy ke production.

## 📋 Daftar Isi
1. [Overview Keamanan](#overview-keamanan)
2. [Keamanan Saat Development](#keamanan-saat-development)
3. [Keamanan Saat Deployment](#keamanan-saat-deployment)
4. [Server-Side Security](#server-side-security)
5. [Client-Side Security](#client-side-security)
6. [Best Practices](#best-practices)
7. [Checklist Deployment](#checklist-deployment)

---

## 🛡️ Overview Keamanan

### Status Saat Ini
N PDF Studio adalah aplikasi **client-side only** dengan keunggulan:

| Aspek | Status | Keterangan |
|-------|--------|-----------|
| **Data Processing** | ✅ Local | Semua proses di browser, tidak ke server |
| **File Storage** | ✅ Safe | File tidak disimpan di server |
| **Password Encryption** | ✅ Built-in | jsPDF & PDF-Lib encryption sudah tersedia |
| **HTTPS** | ❌ Tergantung | Harus di-enforce pada hosting |
| **Input Validation** | ⚠️ Partial | Perlu diperkuat |
| **Rate Limiting** | ❌ None | Tidak ada brute-force protection |
| **CSP Headers** | ❌ None | Perlu ditambahkan |

---

## 🔧 Keamanan Saat Development

### 1. **Validasi Input yang Lebih Ketat**

Tambahkan validasi password strength:

```javascript
// Tambahkan di file index.html sebelum fungsi protectPdf()
function validatePasswordStrength(password) {
  if (!password || password.length === 0) {
    throw new Error("❌ Password tidak boleh kosong!");
  }
  
  if (password.length < 8) {
    throw new Error("❌ Password minimal 8 karakter!");
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase) {
    throw new Error("❌ Password harus ada huruf BESAR!");
  }
  if (!hasLowerCase) {
    throw new Error("❌ Password harus ada huruf kecil!");
  }
  if (!hasNumbers) {
    throw new Error("❌ Password harus ada angka!");
  }
  
  return true;
}

// Gunakan di protectPdf()
async function protectPdf() {
  const file = loadedFiles[0];
  const password = document.getElementById('input-password').value.trim();
  
  try {
    validatePasswordStrength(password);
    // ... proses selanjutnya
  } catch (e) {
    statusText.innerText = `STATUS: FAILED - ${e.message}`;
    alert(e.message);
    return;
  }
}
```

### 2. **Sanitasi Input File**

```javascript
function validateFileInput(file) {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];
  
  const maxFileSize = 100 * 1024 * 1024; // 100MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`❌ Tipe file tidak diizinkan: ${file.type}`);
  }
  
  if (file.size > maxFileSize) {
    throw new Error(`❌ Ukuran file terlalu besar. Max: 100MB, Diterima: ${Math.round(file.size / 1024 / 1024)}MB`);
  }
  
  return true;
}

// Gunakan di handleFiles()
function handleFiles(files) {
  for (let file of files) {
    try {
      validateFileInput(file);
      loadedFiles.push(file);
    } catch (e) {
      alert(e.message);
    }
  }
  renderUI();
}
```

### 3. **Clear Sensitive Data dari Memory**

```javascript
// Tambahkan fungsi untuk clear password
function clearSensitiveData() {
  const passwordField = document.getElementById('input-password');
  if (passwordField) {
    passwordField.value = '';
    passwordField.setAttribute('autocomplete', 'off');
  }
  
  // Clear input fields lainnya
  document.getElementById('input-watermark').value = '';
  document.getElementById('input-range').value = '';
  document.getElementById('input-delete-pages').value = '';
  document.getElementById('input-page-order').value = '';
}

// Panggil setelah proses selesai
async function protectPdf() {
  try {
    // ... proses
    statusText.innerText = "STATUS: SELESAI";
    clearSensitiveData(); // Clear setelah selesai
  } catch (e) {
    clearSensitiveData();
    throw e;
  }
}
```

### 4. **Content Security Policy (CSP) Meta Tag**

Tambahkan di `<head>` tag:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdnjs.cloudflare.com https://unpkg.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               connect-src 'self' https://cdnjs.cloudflare.com https://unpkg.com;
               img-src 'self' data:;
               frame-ancestors 'none';
               form-action 'self';">
```

---

## 🚀 Keamanan Saat Deployment

### 1. **Deploy dengan HTTPS**

#### Option A: GitHub Pages (Gratis)
```bash
# GitHub Pages otomatis HTTPS-enabled
# Cukup push ke branch gh-pages
git push origin main:gh-pages
```

#### Option B: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy aplikasi
vercel

# Vercel otomatis setup HTTPS
```

#### Option C: Netlify
```bash
# Drag & drop folder ke Netlify
# Atau gunakan CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=.

# Netlify otomatis HTTPS
```

#### Option D: Custom Server (VPS/Dedicated)

Menggunakan **Let's Encrypt** untuk free SSL:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomainname.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/default

# Tambahkan:
server {
    listen 443 ssl http2;
    server_name yourdomainname.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomainname.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomainname.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomainname.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. **Security Headers**

Tambahkan ke Nginx config atau `.htaccess` (Apache):

#### Nginx Configuration:
```nginx
# /etc/nginx/sites-available/default

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Prevent clickjacking
add_header X-Frame-Options "DENY" always;

# Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# HTTPS only
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

#### Apache (.htaccess):
```apache
# .htaccess

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header set Referrer-Policy "strict-origin-when-cross-origin"

# Disable directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|json|md|yml|yaml|conf)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## 🔒 Server-Side Security

### Opsi 1: Simple Node.js Server

```javascript
// server.js
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet()); // Set security headers automatically
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomainname.com'],
  methods: ['GET', 'HEAD']
}));

// Rate limiting untuk prevent brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
  message: 'Terlalu banyak request, silakan coba lagi nanti'
});

app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html untuk semua route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi kesalahan server');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Install dependencies:
```bash
npm install express helmet express-rate-limit cors
npm install dotenv
```

### Opsi 2: Python Flask Server

```python
# app.py
from flask import Flask, render_template
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Security headers dengan Talisman
Talisman(app, 
    force_https=True,
    strict_transport_security=True,
    strict_transport_security_max_age=31536000,
    content_security_policy={
        'default-src': "'self'",
        'script-src': ["'self'", 'https://cdnjs.cloudflare.com', 'https://unpkg.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:'],
    }
)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)

@app.route('/')
@limiter.limit("100 per 15 minutes")
def index():
    return render_template('index.html')

@app.errorhandler(429)
def ratelimit_handler(e):
    return 'Terlalu banyak request, silakan coba lagi nanti', 429

@app.errorhandler(500)
def internal_error(error):
    return 'Terjadi kesalahan server', 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 3000)),
        debug=False,  # Never True in production
        ssl_context='adhoc'  # Require HTTPS
    )
```

Install dependencies:
```bash
pip install flask flask-talisman flask-limiter python-dotenv
```

---

## 🛡️ Client-Side Security

### 1. **Subresource Integrity (SRI)**

Lindungi dari CDN compromise dengan SRI:

```html
<!-- Ganti script tags dengan SRI integrity -->
<script 
  src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  integrity="sha384-YOUR_HASH_HERE"
  crossorigin="anonymous">
</script>
```

Generate SRI hash:
```bash
# Online: https://www.srihash.org/
# Atau CLI:
npm install -g sri-hash
sri-hash https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
```

### 2. **Disable Right-Click untuk PDF Preview**

```javascript
// Tambahkan di bagian script
document.getElementById('pdf-preview-canvas').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  alert("Right-click disabled untuk melindungi dokumen");
});
```

### 3. **Cegah Copy-Paste Watermark**

```javascript
// Watermark yang lebih visible
async function watermarkPdf() {
  const watermarkText = document.getElementById('input-watermark').value.trim() || 'CONFIDENTIAL';
  // Repeat watermark di seluruh halaman
  const angleInDegrees = 45;
  const watermarkOpacity = 0.3;
  // ... implementation
}
```

### 4. **Environment Variables**

Buat `.env` file:
```env
# .env (jangan commit ke git)
REACT_APP_API_URL=https://api.yourdomainname.com
REACT_APP_MAX_FILE_SIZE=104857600
REACT_APP_ALLOWED_ORIGINS=https://yourdomainname.com
```

Tambahkan ke `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
node_modules/
dist/
build/
```

---

## ✅ Best Practices

### 1. **Password Strength Indicator**

Tampilkan strength meter saat user memasukkan password:

```javascript
function checkPasswordStrength(password) {
  let strength = 0;
  const feedback = [];
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;
  
  const strengthLevels = {
    0: { text: 'Sangat Lemah', color: 'red' },
    1: { text: 'Lemah', color: 'orange' },
    2: { text: 'Sedang', color: 'yellow' },
    3: { text: 'Kuat', color: 'lightgreen' },
    4: { text: 'Sangat Kuat', color: 'green' },
    5: { text: 'Ekstrem', color: 'darkgreen' },
    6: { text: 'Ekstrem', color: 'darkgreen' }
  };
  
  return strengthLevels[strength];
}
```

### 2. **Audit Logging**

Log semua aktivitas penting:

```javascript
function logActivity(action, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Store di localStorage (client-side)
  const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
  logs.push(logEntry);
  localStorage.setItem('audit_logs', JSON.stringify(logs.slice(-100))); // Keep last 100
  
  // Send ke server (optional)
  if (window.SEND_LOGS_TO_SERVER) {
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(err => console.error('Failed to log:', err));
  }
}

// Gunakan:
logActivity('PDF_PROTECTED', { fileName: 'document.pdf' });
logActivity('PDF_UNLOCKED', { fileName: 'document.pdf', success: true });
```

### 3. **Keyboard Input Masking**

Jangan tampilkan password karakter demi karakter:

```javascript
// Input type password sudah built-in, pastikan tidak override dengan type=text
// Selalu gunakan:
<input type="password" id="input-password" ... />

// Jangan gunakan:
// <input type="text" id="input-password" ... />
```

### 4. **Session Timeout**

Auto-logout setelah inaktif:

```javascript
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    logActivity('AUTO_LOGOUT_TIMEOUT');
    clearSensitiveData();
    alert('Session berakhir karena inaktif. Halaman akan di-refresh.');
    location.reload();
  }, INACTIVITY_TIMEOUT);
}

// Track user activity
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetInactivityTimer, true);
});

// Start timer on load
resetInactivityTimer();
```

---

## 📋 Checklist Deployment

### Pre-Deployment Security Checklist

- [ ] **HTTPS**
  - [ ] SSL certificate installed
  - [ ] HSTS header enabled
  - [ ] Auto-redirect HTTP → HTTPS

- [ ] **Security Headers**
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Content-Security-Policy set
  - [ ] Referrer-Policy configured
  - [ ] Permissions-Policy configured

- [ ] **Input Validation**
  - [ ] File type validation
  - [ ] File size validation
  - [ ] Password strength validation
  - [ ] Input sanitization

- [ ] **Rate Limiting**
  - [ ] API rate limiting configured
  - [ ] Brute-force protection enabled
  - [ ] DDoS mitigation in place

- [ ] **Data Protection**
  - [ ] No sensitive data in logs
  - [ ] Session timeout configured
  - [ ] Sensitive data cleared after use
  - [ ] CORS properly configured

- [ ] **Authentication & Authorization**
  - [ ] No hardcoded credentials
  - [ ] Environment variables used
  - [ ] API keys rotated

- [ ] **Monitoring & Logging**
  - [ ] Error logging configured
  - [ ] Access logging enabled
  - [ ] Security events monitored
  - [ ] Alert system setup

- [ ] **Dependencies**
  - [ ] All packages up-to-date
  - [ ] No known vulnerabilities
  - [ ] SRI integrity hashes added
  - [ ] npm audit passed

- [ ] **Backup & Recovery**
  - [ ] Backups automated
  - [ ] Disaster recovery plan
  - [ ] Incident response plan

### Post-Deployment Verification

```bash
# Test HTTPS/SSL
curl -I https://yourdomainname.com

# Test security headers
curl -I https://yourdomainname.com | grep -i "Strict-Transport-Security\|X-Content-Type-Options\|X-Frame-Options"

# Scan dengan SSL Labs
# https://www.ssllabs.com/ssltest/

# OWASP Dependency Check
npm audit

# Analyze headers
# https://securityheaders.com/
```

---

## 🔄 Maintenance & Updates

### Regular Security Tasks

```bash
# Weekly
npm audit
npm outdated

# Monthly
npm update
git security patch check

# Quarterly
Dependency vulnerability scan
SSL certificate check
Server patch updates

# Annually
Security audit
Penetration testing
Disaster recovery drill
```

### Emergency Response

Jika ada security breach:

1. **Immediate Actions**
   ```bash
   # Rotate API keys
   # Revoke compromised certificates
   # Block suspicious IPs
   # Enable enhanced logging
   ```

2. **Investigation**
   - Review access logs
   - Check for unauthorized changes
   - Analyze malware signatures

3. **Remediation**
   - Patch vulnerability
   - Deploy fix
   - Monitor for re-exploitation

4. **Communication**
   - Notify affected users
   - Issue security advisory
   - Update documentation

---

## 📚 Resources

- **OWASP Security Guidelines**: https://owasp.org/
- **Mozilla Security**: https://infosec.mozilla.org/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **SSL Labs Best Practices**: https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices
- **CSP Generator**: https://csp-evaluator.withgoogle.com/

---

## 📞 Questions & Support

Untuk pertanyaan security atau reporting vulnerability:
- Email: security@yourdomain.com
- Create GitHub Issue (private if security-related)
- Follow responsible disclosure policy

---

**Last Updated**: September 2026  
**Security Version**: 1.0  
**Status**: ✅ Production Ready
