/**
 * Convert File to Data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Data URL
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Load image from URL
 * @param {string} url - Image URL or data URL
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = url;
  });
}

/**
 * Generate sequential filename
 * @param {string} prefix - Filename prefix
 * @param {string} ext - File extension
 * @param {number} counter - Counter for sequence
 * @returns {Object} { filename, nextCounter }
 */
export function generateSequentialFilename(prefix, ext, counter = 1) {
  const numStr = String(counter).padStart(3, '0');
  return {
    filename: `N_PDF_${prefix}_${numStr}.${ext}`,
    nextCounter: counter + 1,
  };
}

/**
 * Format error message for user display
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function formatErrorMessage(error) {
  if (error instanceof TypeError) {
    return 'Terjadi kesalahan tipe data. Silakan periksa input Anda.';
  }
  if (error instanceof RangeError) {
    return 'Nilai di luar jangkauan. Silakan periksa parameter.';
  }
  if (error.message) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay = 300) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}
