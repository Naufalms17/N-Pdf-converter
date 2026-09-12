import { FILE_LIMITS } from './constants.js';

/**
 * Validate file size
 * @param {File} file - File to validate
 * @throws {Error} if file exceeds size limit
 */
export function validateFileSize(file) {
  if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxMB = (FILE_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
    throw new Error(
      `File terlalu besar (max ${maxMB}MB). File Anda: ${sizeMB}MB`
    );
  }
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @throws {Error} if file type not allowed
 */
export function validateFileType(file, allowedTypes) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Tipe file tidak didukung. File: ${file.type}. Diizinkan: ${allowedTypes.join(', ')}`
    );
  }
}

/**
 * Parse and validate page range string
 * @param {string} rangeStr - Page range (e.g., '1-3,5,7-9')
 * @param {number} maxPages - Total pages available
 * @returns {number[]} Array of 0-indexed page numbers
 * @throws {Error} if range is invalid
 */
export function parsePageRange(rangeStr, maxPages) {
  if (!rangeStr || typeof rangeStr !== 'string') {
    throw new Error('Rentang halaman harus berupa string');
  }

  // Validate format
  if (!rangeStr.match(/^[\d,\-\s]+$/)) {
    throw new Error('Format rentang tidak valid. Gunakan: 1-3 atau 2,4,6');
  }

  const indices = [];
  const parts = rangeStr.split(',');

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = Number(startStr);
      const end = Number(endStr);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Range tidak valid: ${part}`);
      }
      if (start > end) {
        throw new Error(`Range tidak valid: ${start} > ${end}`);
      }
      if (start < 1 || end > maxPages) {
        throw new Error(
          `Halaman di luar jangkauan. Tersedia: 1-${maxPages}`
        );
      }

      for (let i = start; i <= end; i++) {
        indices.push(i - 1);
      }
    } else {
      const num = Number(part);
      if (isNaN(num)) {
        throw new Error(`Nomor halaman tidak valid: ${part}`);
      }
      if (num < 1 || num > maxPages) {
        throw new Error(
          `Halaman ${num} di luar jangkauan. Tersedia: 1-${maxPages}`
        );
      }
      indices.push(num - 1);
    }
  }

  if (indices.length === 0) {
    throw new Error('Tidak ada halaman yang valid dalam rentang ini');
  }

  return indices;
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @throws {Error} if password is empty
 */
export function validatePassword(password) {
  if (!password || password.trim().length === 0) {
    throw new Error('Masukkan kata sandi terlebih dahulu!');
  }
}

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @param {string} fieldName - Field name for error message
 * @throws {Error} if text is empty
 */
export function validateText(text, fieldName = 'Teks') {
  if (!text || text.trim().length === 0) {
    throw new Error(`${fieldName} tidak boleh kosong!`);
  }
}

/**
 * Check browser support for required APIs
 * @returns {Object} Support status for each API
 */
export function checkBrowserSupport() {
  return {
    fileApi: typeof File !== 'undefined',
    blob: typeof Blob !== 'undefined',
    audioContext: !!window.AudioContext || !!window.webkitAudioContext,
    serviceWorker: 'serviceWorker' in navigator,
    canvas: typeof HTMLCanvasElement !== 'undefined',
    fetch: typeof fetch !== 'undefined',
  };
}

/**
 * Get unsupported features
 * @returns {string[]} Array of unsupported feature names
 */
export function getUnsupportedFeatures() {
  const support = checkBrowserSupport();
  const required = ['fileApi', 'blob', 'canvas', 'fetch'];
  return required.filter(feature => !support[feature]);
}
