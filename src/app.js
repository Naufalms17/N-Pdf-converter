import audioEngine from './audio/audioEngine.js';
import modalManager from './ui/modalManager.js';
import progressManager from './ui/progressManager.js';
import { formatErrorMessage, generateSequentialFilename } from './utils/helpers.js';
import { checkBrowserSupport, getUnsupportedFeatures } from './utils/validators.js';

// PDF Operations
import {
  convertImgToPdf,
  convertPdfToImgZip,
  compressPdf,
  protectPdf,
  unlockPdf,
  flattenPdf,
  cleanMetadata,
  mergePdfs,
  splitPdf,
  deletePagesPdf,
  rotatePdf,
  watermarkPdf,
  addPageNumbers,
  extractImagesToZip,
  convertPdfToTxt,
  convertTxtToPdf,
  cropMarginsPdf,
} from './pdf/pdfOperations.js';

import { htmlToPdf, translatePdfBatch } from './pdf/textOperations.js';
import { organizePages } from './pdf/pageOperations.js';

/**
 * Main Application Controller
 * Manages UI, state, and PDF operations
 */
class PDFStudioApp {
  constructor() {
    this.activeTool = 'imgToPdf';
    this.loadedFiles = [];
    this.downloadCounter = 1;
    this.draggedIndex = null;

    // Options state
    this.selectedPaperSize = 'a4';
    this.selectedOrientation = 'p';
    this.selectedCompressLevel = '0.5';
    this.selectedRotateAngle = '90';
    this.selectedPagePos = 'bottom-right';
    this.selectedTargetLang = 'en';

    this.initElements();
    this.setupServiceWorker();
    this.checkBrowserCompatibility();
    this.attachEventListeners();
  }

  /**
   * Initialize DOM elements
   */
  initElements() {
    this.fileInput = document.getElementById('file-input');
    this.dropzone = document.getElementById('dropzone');
    this.toolTitle = document.getElementById('tool-title');
    this.toolDesc = document.getElementById('tool-desc');
    this.fileListContainer = document.getElementById('file-list-container');
    this.fileList = document.getElementById('file-list');
    this.processBtn = document.getElementById('process-btn');
    this.previewBtn = document.getElementById('preview-btn');
    this.textEditor = document.getElementById('text-editor');
    this.statusText = document.getElementById('status-text');
    this.dynamicContainer = document.getElementById('dynamic-container');

    // Options
    this.optPaperSize = document.getElementById('opt-paper-size');
    this.optOrientation = document.getElementById('opt-orientation');
    this.optCompressLevel = document.getElementById('opt-compress-level');
    this.optPassword = document.getElementById('opt-password');
    this.optPageRange = document.getElementById('opt-page-range');
    this.optDeletePages = document.getElementById('opt-delete-pages');
    this.optPageOrder = document.getElementById('opt-page-order');
    this.optRotateAngle = document.getElementById('opt-rotate-angle');
    this.optWatermarkText = document.getElementById('opt-watermark-text');
    this.optTargetLang = document.getElementById('opt-target-lang');
    this.optPagePos = document.getElementById('opt-page-pos');
    this.optCropMargin = document.getElementById('opt-crop-margin');
  }

  /**
   * Setup service worker for offline capability
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swCode = `
          const CACHE_NAME = 'npdf-v1';
          self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['./']))));
          self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
        `;
        const blob = new Blob([swCode], { type: 'text/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).catch(() => {});
      });
    }
  }

  /**
   * Check browser compatibility
   */
  checkBrowserCompatibility() {
    const unsupported = getUnsupportedFeatures();
    if (unsupported.length > 0) {
      const message = `Browser tidak fully supported. Missing: ${unsupported.join(', ')}`;
      console.warn(message);
      modalManager.showAlert('Browser Compatibility', message);
    }
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // File input
    this.dropzone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files?.length > 0) this.handleFiles(e.target.files);
    });

    // Drag and drop
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('dragover');
    });
    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover');
    });
    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('dragover');
      if (e.dataTransfer?.files) this.handleFiles(e.dataTransfer.files);
    });

    // Text editor events
    this.textEditor.addEventListener('keydown', (e) => {
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
        audioEngine.playTypewriterSound();
      }
    });
    this.textEditor.addEventListener('input', () => {
      this.processBtn.disabled = this.textEditor.value.trim() === '';
    });

    // Process button
    this.processBtn.addEventListener('click', () => this.processPdf());
    this.previewBtn.addEventListener('click', () => this.previewPdf());

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Pointerdown for audio feedback
    window.addEventListener('pointerdown', () => audioEngine.playRetroClickSound(), {
      capture: true,
      passive: true,
    });

    // Tool selection
    document.querySelectorAll('.npdf-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.switchMode(btn.getAttribute('data-mode')));
    });

    // Menu items
    document.querySelectorAll('.npdf-subitem[data-tool]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllMenus();
        this.switchMode(item.getAttribute('data-tool'));
      });
    });

    // Custom dropdowns
    this.setupCustomDropdown('dd-paper-size', (val) => (this.selectedPaperSize = val));
    this.setupCustomDropdown('dd-orientation', (val) => (this.selectedOrientation = val));
    this.setupCustomDropdown('dd-compress-level', (val) => (this.selectedCompressLevel = val));
    this.setupCustomDropdown('dd-rotate-angle', (val) => (this.selectedRotateAngle = val));
    this.setupCustomDropdown('dd-page-pos', (val) => (this.selectedPagePos = val));
    this.setupCustomDropdown('dd-target-lang', (val) => (this.selectedTargetLang = val));

    // Menu bar
    document.querySelectorAll('.npdf-menu-wrapper').forEach((wrapper) => {
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        this.closeAllMenus();
        if (!isOpen) wrapper.classList.add('open');
      });
    });
    document.addEventListener('click', () => this.closeAllMenus());
  }

  /**
   * Setup custom dropdown
   */
  setupCustomDropdown(dropdownId, onChangeCallback) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const trigger = dropdown.querySelector('.npdf-select-head');
    const label = dropdown.querySelector('.trigger-label');
    const items = dropdown.querySelectorAll('.npdf-select-opt');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = dropdown.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 200) {
        dropdown.classList.add('drop-up');
      } else {
        dropdown.classList.remove('drop-up');
      }

      document.querySelectorAll('.npdf-select-custom.open').forEach((d) => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });

    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');
        label.innerText = item.innerText;
        dropdown.classList.remove('open');
        onChangeCallback(item.getAttribute('data-value'));
      });
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      if (['txtToPdf', 'htmlToPdf'].includes(this.activeTool)) {
        this.textEditor.focus();
      } else {
        this.fileInput.click();
      }
    } else if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      this.resetFiles();
    } else if (e.key === 'Enter' && !e.shiftKey && document.activeElement.tagName !== 'TEXTAREA') {
      if (!this.processBtn.disabled) {
        e.preventDefault();
        this.processBtn.click();
      }
    } else if (e.key === 'Escape') {
      modalManager.close();
    }
  }

  /**
   * Close all menu dropdowns
   */
  closeAllMenus() {
    document.querySelectorAll('.npdf-menu-wrapper').forEach((w) => w.classList.remove('open'));
    document.querySelectorAll('.npdf-select-custom.open').forEach((d) => d.classList.remove('open'));
  }

  /**
   * Handle file selection
   */
  handleFiles(files) {
    for (let file of files) {
      this.loadedFiles.push(file);
    }
    this.renderUI();
  }

  /**
   * Remove file from list
   */
  removeFile(index) {
    this.loadedFiles.splice(index, 1);
    this.renderUI();
  }

  /**
   * Reset files and state
   */
  resetFiles() {
    this.loadedFiles = [];
    this.fileInput.value = '';
    this.textEditor.value = '';
    this.renderUI();
    this.statusText.innerText = 'STATUS: RESET SELESAI';
  }

  /**
   * Render file list UI
   */
  renderUI() {
    this.fileList.innerHTML = '';

    if (this.loadedFiles.length > 0) {
      this.fileListContainer.style.display = 'block';
      this.loadedFiles.forEach((f, idx) => {
        const row = document.createElement('div');
        row.className = 'npdf-file-row';
        row.draggable = true;
        row.dataset.index = idx;
        row.innerHTML = `
          <div>
            <span class="file-drag-handle">☰</span>
            <span>[${idx + 1}] ${f.name} (${Math.round(f.size / 1024)} KB)</span>
          </div>
          <span class="del-btn" onclick="window.app.removeFile(${idx})">[HAPUS]</span>
        `;

        // Drag and drop
        row.addEventListener('dragstart', (e) => {
          this.draggedIndex = idx;
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          this.draggedIndex = null;
        });

        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });

        row.addEventListener('drop', (e) => {
          e.preventDefault();
          const targetIndex = Number(row.dataset.index);
          if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
            const movedItem = this.loadedFiles.splice(this.draggedIndex, 1)[0];
            this.loadedFiles.splice(targetIndex, 0, movedItem);
            this.renderUI();
          }
        });

        this.fileList.appendChild(row);
      });
    } else {
      this.fileListContainer.style.display = 'none';
    }

    // Update button states
    if (!['txtToPdf', 'htmlToPdf'].includes(this.activeTool)) {
      this.processBtn.disabled = this.loadedFiles.length === 0;
      this.previewBtn.style.display = this.loadedFiles.length > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * Switch tool mode
   */
  switchMode(mode) {
    if (this.activeTool === mode) return;

    this.dynamicContainer.classList.add('switching');

    setTimeout(() => {
      this.activeTool = mode;
      this.loadedFiles = [];
      this.fileInput.value = '';
      this.textEditor.value = '';
      progressManager.reset();

      // Update nav buttons
      document.querySelectorAll('.npdf-nav-btn').forEach((b) => {
        if (b.getAttribute('data-mode') === mode) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Hide all options
      this.optPaperSize.style.display = 'none';
      this.optOrientation.style.display = 'none';
      this.optCompressLevel.style.display = 'none';
      this.optPassword.style.display = 'none';
      this.optPageRange.style.display = 'none';
      this.optDeletePages.style.display = 'none';
      this.optPageOrder.style.display = 'none';
      this.optRotateAngle.style.display = 'none';
      this.optWatermarkText.style.display = 'none';
      this.optTargetLang.style.display = 'none';
      this.optPagePos.style.display = 'none';
      this.optCropMargin.style.display = 'none';
      this.previewBtn.style.display = 'none';

      // Configure based on mode
      const modeConfig = {
        imgToPdf: {
          title: '> MODUL: FOTO KE PDF DOKUMEN',
          desc: 'Ubah daftar berkas gambar (JPG, PNG) menjadi dokumen PDF terstruktur.',
          showDropzone: true,
          accept: 'image/*',
          multiple: true,
          options: [this.optPaperSize, this.optOrientation],
        },
        pdfToImg: {
          title: '> MODUL: PDF KE FOTO (PAKET ZIP)',
          desc: 'Ekstrak setiap halaman PDF menjadi foto PNG & kemas dalam format .ZIP.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [],
        },
        compressPdf: {
          title: '> MODUL: KOMPRES UKURAN PDF',
          desc: 'Kecilkan resolusi & ukuran file PDF secara optimal.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optCompressLevel],
        },
        protectPdf: {
          title: '> MODUL: KUNCI / PASSWORD PDF',
          desc: 'Proteksi dokumen PDF menggunakan kata sandi.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optPassword],
        },
        unlockPdf: {
          title: '> MODUL: BUKA KUNCI PDF',
          desc: 'Hapus atau buka proteksi password pada berkas PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optPassword],
        },
        flattenPdf: {
          title: '> MODUL: FLATTEN PDF (KUNCI ISI DOKUMEN)',
          desc: 'Ubah seluruh isi dokumen/formulir PDF menjadi gambar datar agar tidak bisa disunting.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [],
        },
        cleanMetadata: {
          title: '> MODUL: HAPUS METADATA SENSITIF',
          desc: 'Hapus data tersembunyi seperti Author, Software, dan tanggal riwayat dari file PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [],
        },
        mergePdf: {
          title: '> MODUL: GABUNG PDF',
          desc: 'Satukan beberapa dokumen PDF menjadi satu file.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: true,
          options: [],
        },
        splitPdf: {
          title: '> MODUL: PISAH PDF',
          desc: 'Ambil halaman tertentu dari berkas PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optPageRange],
        },
        deletePages: {
          title: '> MODUL: HAPUS HALAMAN PDF',
          desc: 'Hapus satu atau beberapa halaman yang tidak diinginkan.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optDeletePages],
        },
        rotatePdf: {
          title: '> MODUL: PUTAR ORIENTASI PDF',
          desc: 'Putar rotasi halaman dokumen PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optRotateAngle],
        },
        watermarkPdf: {
          title: '> MODUL: TAMBAH WATERMARK',
          desc: 'Cetak teks watermark diagonal pada dokumen.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optWatermarkText],
        },
        pageNumbersPdf: {
          title: '> MODUL: NOMOR HALAMAN PDF',
          desc: 'Tambahkan penomoran halaman otomatis dengan posisi custom.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optPagePos],
        },
        organizePdf: {
          title: '> MODUL: URUTKAN HALAMAN PDF',
          desc: 'Atur ulang atau balikkan urutan susunan halaman PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optPageOrder],
        },
        cropPdf: {
          title: '> MODUL: CROP MARGINS PDF',
          desc: 'Potong area pinggir (margin) kosong pada halaman PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optCropMargin],
        },
        extractImages: {
          title: '> MODUL: EKSTRAK GAMBAR (PAKET ZIP)',
          desc: 'Ambil dan unduh seluruh aset foto/gambar PDF dalam satu file .ZIP.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [],
        },
        pdfToTxt: {
          title: '> MODUL: PDF KE TEKS (EKSTRAK)',
          desc: 'Ekstrak seluruh teks mentah dari file PDF.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [],
        },
        txtToPdf: {
          title: '> MODUL: TEKS KE PDF',
          desc: 'Ketik catatan teks langsung untuk dikonversi.',
          showDropzone: false,
          options: [this.optPaperSize],
        },
        htmlToPdf: {
          title: '> MODUL: HTML KE PDF',
          desc: 'Render markup kode HTML menjadi halaman PDF.',
          showDropzone: false,
          options: [],
        },
        translatePdf: {
          title: '> MODUL: TERJEMAHKAN PDF (TEROPTIMASI)',
          desc: 'Terjemahkan dokumen PDF secara presisi menggunakan mode batch terjemahan.',
          showDropzone: true,
          accept: 'application/pdf',
          multiple: false,
          options: [this.optTargetLang],
        },
      };

      const config = modeConfig[mode];
      if (config) {
        this.toolTitle.innerText = config.title;
        this.toolDesc.innerText = config.desc;
        this.fileInput.accept = config.accept || '';
        this.fileInput.multiple = config.multiple !== false;
        this.dropzone.style.display = config.showDropzone ? 'block' : 'none';
        this.textEditor.style.display = config.showDropzone ? 'none' : 'block';
        config.options.forEach((opt) => (opt.style.display = 'flex'));
      }

      this.statusText.innerText = 'STATUS: MODUL ' + mode.toUpperCase();
      this.renderUI();
      this.dynamicContainer.classList.remove('switching');
    }, 100);
  }

  /**
   * Preview PDF
   */
  async previewPdf() {
    if (this.loadedFiles.length === 0) return;

    try {
      const file = this.loadedFiles[0];
      let arrayBuffer;

      if (file.type === 'application/pdf') {
        arrayBuffer = await file.arrayBuffer();
      } else {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const base64 = await this.fileToDataURL(file);
        pdf.addImage(base64, 'JPEG', 10, 10, 180, 240);
        arrayBuffer = pdf.output('arraybuffer');
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });

      const modal = document.getElementById('preview-modal');
      document.getElementById('modal-title').innerText = '=== HASIL PRATINJAU DOKUMEN ===';
      document.getElementById('modal-body').innerHTML = '<canvas id="pdf-preview-canvas"></canvas>';
      document.getElementById('modal-footer').innerHTML = `
        <button class="npdf-btn-action" onclick="document.getElementById('preview-modal').classList.remove('active')">
          [ TUTUP ]
        </button>
      `;
      modal.classList.add('active');

      const canvas = document.getElementById('pdf-preview-canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (error) {
      modalManager.showAlert('Preview Error', formatErrorMessage(error));
    }
  }

  /**
   * Process PDF based on active tool
   */
  async processPdf() {
    this.processBtn.disabled = true;
    this.processBtn.innerText = 'PROSES...';
    this.statusText.innerText = 'STATUS: MEMPROSES DOKUMEN...';
    audioEngine.startFloppyDiskSound();

    try {
      const onProgress = (current, total, status) => {
        progressManager.update(current, total, status);
      };

      let result;
      let filename;
      let mimeType;

      // Execute operation based on tool
      if (this.activeTool === 'imgToPdf') {
        result = await convertImgToPdf(
          this.loadedFiles,
          { paperSize: this.selectedPaperSize, orientation: this.selectedOrientation },
          onProgress
        );
        ({ filename } = generateSequentialFilename('Foto', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'pdfToImg') {
        result = await convertPdfToImgZip(this.loadedFiles[0], onProgress);
        ({ filename } = generateSequentialFilename('Halaman_Gambar', 'zip', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/zip';
      } else if (this.activeTool === 'compressPdf') {
        result = await compressPdf(this.loadedFiles[0], this.selectedCompressLevel, onProgress);
        ({ filename } = generateSequentialFilename('Compressed', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'protectPdf') {
        const password = document.getElementById('input-password')?.value || '';
        result = await protectPdf(this.loadedFiles[0], password, onProgress);
        ({ filename } = generateSequentialFilename('Protected', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'unlockPdf') {
        const password = document.getElementById('input-password')?.value || '';
        result = await unlockPdf(this.loadedFiles[0], password);
        ({ filename } = generateSequentialFilename('Unlocked', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'flattenPdf') {
        result = await flattenPdf(this.loadedFiles[0], onProgress);
        ({ filename } = generateSequentialFilename('Flattened', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'cleanMetadata') {
        result = await cleanMetadata(this.loadedFiles[0]);
        ({ filename } = generateSequentialFilename('Cleaned', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'mergePdf') {
        result = await mergePdfs(this.loadedFiles, onProgress);
        ({ filename } = generateSequentialFilename('Merged', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'splitPdf') {
        const range = document.getElementById('input-range')?.value || '';
        result = await splitPdf(this.loadedFiles[0], range);
        ({ filename } = generateSequentialFilename('Split', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'deletePages') {
        const pages = document.getElementById('input-delete-pages')?.value || '';
        result = await deletePagesPdf(this.loadedFiles[0], pages);
        ({ filename } = generateSequentialFilename('Modified', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'rotatePdf') {
        result = await rotatePdf(this.loadedFiles[0], this.selectedRotateAngle);
        ({ filename } = generateSequentialFilename('Rotated', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'watermarkPdf') {
        const text = document.getElementById('input-watermark')?.value || '';
        result = await watermarkPdf(this.loadedFiles[0], text);
        ({ filename } = generateSequentialFilename('Watermark', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'pageNumbersPdf') {
        result = await addPageNumbers(this.loadedFiles[0], this.selectedPagePos);
        ({ filename } = generateSequentialFilename('Numbered', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'organizePdf') {
        const order = document.getElementById('input-page-order')?.value || '';
        result = await organizePages(this.loadedFiles[0], order);
        ({ filename } = generateSequentialFilename('Organized', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'cropPdf') {
        const margin = document.getElementById('input-crop-margin')?.value || '20';
        result = await cropMarginsPdf(this.loadedFiles[0], margin);
        ({ filename } = generateSequentialFilename('Cropped', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'extractImages') {
        result = await extractImagesToZip(this.loadedFiles[0], onProgress);
        ({ filename } = generateSequentialFilename('Ekstrak_Gambar', 'zip', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/zip';
      } else if (this.activeTool === 'pdfToTxt') {
        const text = await convertPdfToTxt(this.loadedFiles[0]);
        result = new TextEncoder().encode(text);
        ({ filename } = generateSequentialFilename('Text', 'txt', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'text/plain';
      } else if (this.activeTool === 'txtToPdf') {
        result = await convertTxtToPdf(this.textEditor.value, this.selectedPaperSize);
        ({ filename } = generateSequentialFilename('FromTxt', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'htmlToPdf') {
        result = await htmlToPdf(this.textEditor.value, 'FromHtml');
        ({ filename } = generateSequentialFilename('FromHtml', 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      } else if (this.activeTool === 'translatePdf') {
        result = await translatePdfBatch(this.loadedFiles[0], this.selectedTargetLang, onProgress);
        ({ filename } = generateSequentialFilename(`Translated_${this.selectedTargetLang.toUpperCase()}`, 'pdf', this.downloadCounter));
        this.downloadCounter++;
        mimeType = 'application/pdf';
      }

      progressManager.update(100, 100, 'PROSES SELESAI!');
      this.statusText.innerText = 'STATUS: PROSES SUKSES!';
      audioEngine.playStatusBeep(true);

      // Show download confirmation
      await modalManager.showDownloadConfirm(result, filename, mimeType);
    } catch (error) {
      progressManager.hide();
      modalManager.showAlert('Proses Gagal', formatErrorMessage(error));
      this.statusText.innerText = 'STATUS: PROSES GAGAL!';
      audioEngine.playStatusBeep(false);
    } finally {
      this.processBtn.innerText = '[ EKSEKUSI PROSES ]';
      this.processBtn.disabled = false;
      audioEngine.stopFloppyDiskSound();
    }
  }

  /**
   * Convert file to data URL
   */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }
  window.app = new PDFStudioApp();
});

export default PDFStudioApp;
