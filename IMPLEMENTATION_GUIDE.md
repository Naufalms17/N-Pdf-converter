# 📋 IMPLEMENTATION GUIDE - Refactored Code

## Perubahan Utama

Repository telah di-refactor dari **1 monolithic file (1,247 lines)** menjadi **modular architecture** dengan:

✅ **6 Core Modules** untuk PDF operations  
✅ **Input validation & error handling** yang ketat  
✅ **Unit tests** dengan Jest  
✅ **Architecture documentation**  
✅ **Complete JSDoc comments**  

## ⚠️ Breaking Changes

### Old Structure
```javascript
// Semua code dalam 1 file: app.js (1247 lines)
```

### New Structure
```
src/
├── app.js                    # Entry point (class-based)
├── audio/audioEngine.js      # Sound effects
├── pdf/
│   ├── pdfOperations.js      # 13 core functions
│   ├── textOperations.js     # HTML & translation
│   └── pageOperations.js     # Page organization
├── ui/
│   ├── modalManager.js       # Dialog management
│   └── progressManager.js    # Progress display
└── utils/
    ├── constants.js          # Config constants
    ├── validators.js         # Input validation
    ├── helpers.js            # Utility functions
    └── tests/validators.test.js  # Unit tests
```

## 🚀 Menggunakan Branch Baru

### Opsi 1: Merge ke Main
```bash
# Checkout main branch
git checkout main

# Pull latest
git pull origin main

# Merge refactor branch
git merge origin/refactor/code-organization

# Push ke remote
git push origin main
```

### Opsi 2: Test Dulu di Staging
```bash
# Checkout refactor branch
git checkout refactor/code-organization

# Test aplikasi di local
python3 -m http.server 8000
# Akses http://localhost:8000

# Jika OK, merge ke main
git checkout main
git merge refactor/code-organization
git push origin main
```

## ✨ Fitur Baru

### 1. **Better Error Messages**
```javascript
// Before:
throw new Error("Error");

// After:
throw new Error("File terlalu besar (max 50MB). File Anda: 75.2MB");
```

### 2. **Input Validation**
```javascript
// Page range validation
parsePageRange("1-5,8,10-12", 15)  // ✅ Valid
parsePageRange("20", 15)            // ❌ Error: out of range
parsePageRange("abc", 15)           // ❌ Error: invalid format
```

### 3. **Modular PDF Operations**
```javascript
// Can import individually
import { convertImgToPdf } from './src/pdf/pdfOperations.js';
import { htmlToPdf } from './src/pdf/textOperations.js';

const pdfBytes = await convertImgToPdf(files, options, onProgress);
```

### 4. **Progress Callbacks**
```javascript
const onProgress = (current, total, status) => {
  console.log(`${current}/${total}: ${status}`);
};

await convertImgToPdf(files, options, onProgress);
```

### 5. **Consistent Error Handling**
```javascript
try {
  await pdfOperation();
} catch (error) {
  const userMessage = formatErrorMessage(error);
  modalManager.showAlert('Operation Failed', userMessage);
}
```

## 📝 Migration Checklist

- [ ] Pull/checkout `refactor/code-organization` branch
- [ ] Test aplikasi: `python3 -m http.server 8000`
- [ ] Verify all 20 tools work correctly
- [ ] Check console for errors (F12)
- [ ] Test with large files (30-50MB)
- [ ] Test error cases (invalid password, out of range pages)
- [ ] Merge to main when satisfied
- [ ] Delete refactor branch (optional)

## 🧪 Running Tests

```bash
# Install Jest (if not already installed)
npm install --save-dev jest

# Run tests
npm test src/tests/validators.test.js

# Run with coverage
npm test -- --coverage
```

**Test Coverage:**
- ✅ Page range parsing (valid formats, edge cases, errors)
- ✅ File size validation
- ✅ Password validation
- ✅ Text validation
- ✅ Browser compatibility checks

## 🔧 Common Issues & Solutions

### Issue: "Module not found" error
**Cause:** File paths don't match  
**Solution:** Ensure correct file structure in `src/` directory

### Issue: PDF operations not working
**Cause:** Libraries not loaded before modules  
**Solution:** Verify CDN links in `index.html` are accessible

### Issue: Audio not playing
**Cause:** AudioContext not initialized  
**Solution:** Click any button to initialize, or check browser audio permissions

### Issue: Progress bar not showing
**Cause:** `onProgress` callback not passed  
**Solution:** Pass progress callback to PDF functions

## 📚 API Reference

### PDF Operations Module
```javascript
// Image to PDF
await convertImgToPdf(files, { paperSize, orientation }, onProgress)

// PDF to Images (ZIP)
await convertPdfToImgZip(pdfFile, onProgress)

// Compress PDF
await compressPdf(pdfFile, quality, onProgress)

// Protect with password
await protectPdf(pdfFile, password, onProgress)

// Unlock PDF
await unlockPdf(pdfFile, password)

// Merge multiple PDFs
await mergePdfs(pdfFiles, onProgress)

// Split PDF (extract pages)
await splitPdf(pdfFile, pageRange)  // "1-3,5,7-9"

// Delete pages
await deletePagesPdf(pdfFile, pageRange)

// Rotate pages
await rotatePdf(pdfFile, angle)  // 90, 180, or 270

// Add watermark
await watermarkPdf(pdfFile, text)

// Add page numbers
await addPageNumbers(pdfFile, position)

// Clean metadata
await cleanMetadata(pdfFile)

// Flatten (convert to image)
await flattenPdf(pdfFile, onProgress)

// Extract images (ZIP)
await extractImagesToZip(pdfFile, onProgress)

// Extract text
await convertPdfToTxt(pdfFile)

// Text to PDF
await convertTxtToPdf(text, paperSize)

// Crop margins
await cropMarginsPdf(pdfFile, margin)
```

### Validation Module
```javascript
// Validate file size (max 50MB)
validateFileSize(file)  // throws Error if too large

// Parse page ranges
parsePageRange("1-5,8", maxPages)  // returns [0,1,2,3,4,7]

// Validate password
validatePassword(password)  // throws if empty

// Check browser support
checkBrowserSupport()  // returns support status
getUnsupportedFeatures()  // returns array of missing APIs
```

## 🎯 Next Steps

1. **Immediate:**
   - Merge refactor branch to main
   - Update documentation with new API
   - Deploy to production

2. **Short-term (1-2 weeks):**
   - Expand test coverage (PDF operations)
   - Add Web Workers for heavy operations
   - Implement offline mode fully

3. **Medium-term (1-2 months):**
   - Add more language support
   - Implement file history/favorites
   - Add dark mode theme
   - Create VS Code extension

4. **Long-term:**
   - Cloud upload integration
   - Batch processing UI
   - Docker deployment
   - REST API server version

## 📞 Support

If you encounter issues:
1. Check `ARCHITECTURE.md` for design details
2. Review `src/tests/validators.test.js` for usage examples
3. Check browser console (F12) for error messages
4. Open GitHub issue with detailed error logs

---

**Happy refactoring!** 🚀
