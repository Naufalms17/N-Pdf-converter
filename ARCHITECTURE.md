# 📚 Architecture Documentation - N PDF Studio

## Project Structure

```
src/
├── app.js                    # Main application controller
├── audio/
│   └── audioEngine.js       # DOS-style sound effects
├── pdf/
│   ├── pdfOperations.js     # Core PDF operations (20+ functions)
│   ├── textOperations.js    # HTML & translation operations
│   └── pageOperations.js    # Page organization operations
├── ui/
│   ├── modalManager.js      # Dialog/modal management
│   └── progressManager.js   # Progress bar display
├── utils/
│   ├── constants.js         # Configuration constants
│   ├── validators.js        # Input validation & error handling
│   └── helpers.js           # Utility functions
└── tests/
    └── validators.test.js   # Unit tests (Jest)
```

## Key Features

### 1. **Modular Design**
- **Separation of Concerns:** Each module has a single responsibility
- **Reusability:** PDF operations can be imported independently
- **Maintainability:** Easy to locate and modify specific features

### 2. **Error Handling**
- **Input Validation:** File size, format, and parameter checks
- **Descriptive Errors:** User-friendly error messages in Indonesian
- **Try-Catch Blocks:** Async operations wrapped with error handling

### 3. **Performance**
- **Client-Side Processing:** No server required, faster execution
- **Batch Operations:** Progress tracking for large PDFs
- **Web Workers:** Ready for offloading heavy operations

### 4. **Accessibility**
- **Keyboard Shortcuts:** Full keyboard navigation support
- **Semantic HTML:** Proper ARIA labels (in development)
- **DOS-style UI:** Retro aesthetic with good contrast

## Module Descriptions

### `audio/audioEngine.js`
**Singleton instance for DOS-style audio feedback**

```javascript
- playRetroClickSound()       // Button click effect
- playTypewriterSound()       // Text input effect
- playErrorBeepSound()        // Error notification
- startFloppyDiskSound()      // Processing loop
- stopFloppyDiskSound()       // Stop processing sound
- playStatusBeep(isSuccess)   // Success/error completion
```

### `pdf/pdfOperations.js`
**Core PDF manipulation functions**

```javascript
// Image & Text Conversion
- convertImgToPdf(images, options, onProgress)
- convertPdfToImgZip(pdfFile, onProgress)
- convertTxtToPdf(text, paperSize)
- convertPdfToTxt(pdfFile)

// PDF Manipulation
- compressPdf(pdfFile, quality, onProgress)
- protectPdf(pdfFile, password, onProgress)
- unlockPdf(pdfFile, password)
- mergePdfs(pdfFiles, onProgress)
- splitPdf(pdfFile, pageRange)
- deletePagesPdf(pdfFile, pageRange)
- rotatePdf(pdfFile, angle)
- flattenPdf(pdfFile, onProgress)
- watermarkPdf(pdfFile, text)
- addPageNumbers(pdfFile, position)
- cleanMetadata(pdfFile)
- extractImagesToZip(pdfFile, onProgress)
- cropMarginsPdf(pdfFile, margin)
```

All functions:
- Accept file validation
- Return Promise<ArrayBuffer | Blob | string>
- Throw descriptive errors on failure
- Support optional progress callbacks

### `pdf/textOperations.js`
**HTML rendering & translation functions**

```javascript
- htmlToPdf(htmlContent, filename)
- translatePdfBatch(pdfFile, targetLang, onProgress)
```

### `pdf/pageOperations.js`
**Page organization functions**

```javascript
- organizePages(pdfFile, pageOrder)
```

### `ui/modalManager.js`
**Dialog and modal management**

```javascript
- showAlert(title, message)                    // Error dialog
- showDownloadConfirm(data, filename, type)   // Download confirmation
- open()  / close()                           // Modal control
```

### `ui/progressManager.js`
**Progress display management**

```javascript
- update(current, total, statusText)  // Update progress bar
- hide()                              // Hide progress
- reset()                             // Reset to zero
```

### `utils/validators.js`
**Input validation and error checking**

```javascript
// File Validation
- validateFileSize(file)                          // Check max 50MB
- validateFileType(file, allowedTypes)            // Check MIME type

// Data Validation
- parsePageRange(rangeStr, maxPages)              // Parse "1-3,5,7"
- validatePassword(password)                      // Check not empty
- validateText(text, fieldName)                   // Check not empty

// Browser Support
- checkBrowserSupport()                           // Check required APIs
- getUnsupportedFeatures()                        // List missing features
```

### `utils/helpers.js`
**Utility functions**

```javascript
// File Operations
- fileToDataURL(file)                 // Convert File to base64
- loadImage(url)                      // Load image from URL
- generateSequentialFilename(prefix, ext, counter)

// Error Handling
- formatErrorMessage(error)           // User-friendly messages

// Text Formatting
- formatFileSize(bytes)               // "1.2 MB" format

// Function Utilities
- debounce(func, delay)               // Debounced function
- throttle(func, delay)               // Throttled function
```

### `utils/constants.js`
**Configuration constants**

```javascript
COLORS              // DOS palette colors
PAPER_SIZES         // A4, Letter, Legal
ORIENTATIONS        // Portrait, Landscape
COMPRESS_LEVELS     // Quality presets
ROTATE_ANGLES       // 90, 180, 270 degrees
PAGE_POSITIONS      // Number placement options
TARGET_LANGUAGES    // Supported translation languages
FILE_LIMITS         // MAX_FILE_SIZE, MAX_BATCH_SIZE
UI                  // UI constants (z-index, batch size)
```

## Error Handling Strategy

### Input Validation Layer
1. **File Size Check** → Max 50MB
2. **File Type Check** → MIME type validation
3. **Text Validation** → Non-empty check
4. **Page Range Validation** → Format & bounds check
5. **Password Validation** → Required field check

### Error Reporting
```javascript
try {
  // Operation
} catch (error) {
  const userMessage = formatErrorMessage(error);
  modalManager.showAlert('Operation Failed', userMessage);
  progressManager.hide();
}
```

## Testing

Run tests with Jest:
```bash
npm test src/tests/validators.test.js
```

Test coverage:
- Page range parsing (valid/invalid formats, bounds)
- File size validation
- Password validation
- Text validation
- Edge cases (empty input, whitespace, special characters)

## Performance Considerations

### Optimizations Applied
1. **Client-Side Processing** → No server latency
2. **Progress Tracking** → Visual feedback for long operations
3. **Async/Await** → Non-blocking operations
4. **File Size Limits** → Prevents out-of-memory errors
5. **Batch Processing** → Yield to main thread periodically

### Future Improvements
1. **Web Workers** → Offload heavy PDF processing
2. **Indexed DB** → Cache large files locally
3. **Lazy Loading** → Load modules on-demand
4. **Service Worker** → Full offline capability

## Browser Compatibility

**Required APIs:**
- File API (FileReader, Blob)
- Canvas API (for image rendering)
- Fetch API (for translation)
- Web Audio API (for sound effects)
- Service Worker (optional, for offline)

**Supported Browsers:**
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Usage Example

```javascript
// Using PDF operations module
import { convertImgToPdf } from './src/pdf/pdfOperations.js';

const files = [file1, file2, file3];
const options = {
  paperSize: 'a4',
  orientation: 'p'
};

const onProgress = (current, total, status) => {
  console.log(`${current}/${total}: ${status}`);
};

try {
  const pdfBytes = await convertImgToPdf(files, options, onProgress);
  // Download pdfBytes
} catch (error) {
  console.error('Conversion failed:', error.message);
}
```

## Future Roadmap

- [ ] Add more unit tests (PDF operations)
- [ ] Implement Web Workers for heavy operations
- [ ] Add ARIA labels for accessibility
- [ ] Support for more languages
- [ ] Dark mode theme
- [ ] Batch processing UI
- [ ] File history/recent files
- [ ] Cloud upload integration
