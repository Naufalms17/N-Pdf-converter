// Color palette
export const COLORS = {
  dosBg: '#5ce0d8',
  dosText: '#050a0e',
  dosGray: '#0d1b2a',
  dosDarkGray: '#1b263b',
  dosYellow: '#ffd166',
  dosBlack: '#050a0e',
  dosGreen: '#06d6a0',
  dosRed: '#ff70a6',
  dosWhite: '#ffffff',
};

// Paper sizes
export const PAPER_SIZES = {
  a4: { label: 'A4 (210 x 297 mm)', value: 'a4' },
  letter: { label: 'Letter (8.5 x 11 in)', value: 'letter' },
  legal: { label: 'Legal (8.5 x 14 in)', value: 'legal' },
};

// Orientations
export const ORIENTATIONS = {
  portrait: { label: 'Potret (Tegak)', value: 'p' },
  landscape: { label: 'Lanskap (Mendatar)', value: 'l' },
};

// Compression levels
export const COMPRESS_LEVELS = {
  low: { label: 'Rendah (Kualitas Tinggi)', value: '0.7' },
  medium: { label: 'Sedang (50%)', value: '0.5' },
  high: { label: 'Tinggi (70%)', value: '0.3' },
};

// Rotation angles
export const ROTATE_ANGLES = {
  90: { label: '90° (Searah Jarum Jam)', value: '90' },
  180: { label: '180° (Terbalik)', value: '180' },
  270: { label: '270° (Berlawanan)', value: '270' },
};

// Page positions for numbering
export const PAGE_POSITIONS = {
  'bottom-right': { label: 'Bawah Kanan', value: 'bottom-right' },
  'bottom-center': { label: 'Bawah Tengah', value: 'bottom-center' },
  'bottom-left': { label: 'Bawah Kiri', value: 'bottom-left' },
  'top-right': { label: 'Atas Kanan', value: 'top-right' },
  'top-center': { label: 'Atas Tengah', value: 'top-center' },
};

// Target languages for translation
export const TARGET_LANGUAGES = {
  en: { label: 'English', value: 'en' },
  id: { label: 'Bahasa Indonesia', value: 'id' },
  'zh-CN': { label: 'Mandarin (Simplified)', value: 'zh-CN' },
  ja: { label: 'Jepang (Japanese)', value: 'ja' },
  ar: { label: 'Arab (Arabic)', value: 'ar' },
  es: { label: 'Español', value: 'es' },
};

// File size limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_BATCH_SIZE: 100, // Max files in one operation
};

// UI constants
export const UI = {
  PROGRESS_BATCH_SIZE: 5,
  MODAL_Z_INDEX: 10000,
  MENU_Z_INDEX: 6000,
};

export default {
  COLORS,
  PAPER_SIZES,
  ORIENTATIONS,
  COMPRESS_LEVELS,
  ROTATE_ANGLES,
  PAGE_POSITIONS,
  TARGET_LANGUAGES,
  FILE_LIMITS,
  UI,
};
