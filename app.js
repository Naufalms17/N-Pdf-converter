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

let audioCtx = null;
let mainGain = null;
let processInterval = null;

function initAudioEngine() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    mainGain = audioCtx.createGain();
    mainGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playRetroClickSound() {
  try {
    initAudioEngine();
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.02);

    noteGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);

    osc.connect(noteGain);
    noteGain.connect(mainGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.02);
  } catch (e) {}
}

function playTypewriterSound() {
  try {
    initAudioEngine();
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = 'square';
    const freq = 1800 + Math.random() * 400;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    noteGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);

    osc.connect(noteGain);
    noteGain.connect(mainGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
  } catch (e) {}
}

function playErrorBeepSound() {
  try {
    initAudioEngine();
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);

    noteGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(noteGain);
    noteGain.connect(mainGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

function startFloppyDiskSound() {
  try {
    initAudioEngine();
    stopFloppyDiskSound();
    processInterval = setInterval(() => {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = 'sawtooth';
      const freq = 120 + Math.random() * 80;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      noteGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

      osc.connect(noteGain);
      noteGain.connect(mainGain);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    }, 60);
  } catch (e) {}
}

function stopFloppyDiskSound() {
  if (processInterval) {
    clearInterval(processInterval);
    processInterval = null;
  }
}

function playStatusBeep(isSuccess = true) {
  try {
    initAudioEngine();
    stopFloppyDiskSound();
    if (!isSuccess) {
      playErrorBeepSound();
      return;
    }
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);

    noteGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    osc.connect(noteGain);
    noteGain.connect(mainGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
}

window.addEventListener('pointerdown', () => playRetroClickSound(), { capture: true, passive: true });

function showDosAlert(title, message) {
  playErrorBeepSound();
  const modal = document.getElementById('preview-modal');
  document.getElementById('modal-title').innerText = `=== ${title.toUpperCase()} ===`;
  document.getElementById('modal-body').innerHTML = `
    <div style="color:var(--dos-red); font-size:20px; line-height:1.4; padding:8px 0;">
      <p style="color:var(--dos-yellow); font-weight:bold; margin-bottom:6px;">[!] PESAN KESALAHAN DOS:</p>
      <p>• ${message}</p>
    </div>
  `;
  document.getElementById('modal-footer').innerHTML = `<button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">[ TUTUP (ESC) ]</button>`;
  modal.classList.add('active');
}

const progressBox = document.getElementById('dos-progress-container');
const progressStatus = document.getElementById('dos-progress-status');
const progressPercent = document.getElementById('dos-progress-percent');
const progressBarLine = document.getElementById('dos-progress-bar-line');

function updateDosProgress(current, total, statusText = "MEMPROSES DOKUMEN...") {
  progressBox.style.display = 'block';
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  
  const barStr = '[' + '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks) + ']';
  
  progressStatus.innerText = `> ${statusText}`;
  progressPercent.innerText = `${percentage}%`;
  progressBarLine.innerText = barStr;
}

function hideDosProgress() {
  progressBox.style.display = 'none';
}

function triggerDosDownloadModal(data, filename, type) {
  const modal = document.getElementById('preview-modal');

  document.getElementById('modal-title').innerText = '=== DOS FILE DOWNLOAD CONFIRMATION ===';
  document.getElementById('modal-body').innerHTML = `
    <div style="color:var(--dos-white); font-size:19px; line-height:1.4;">
      <p style="color:var(--dos-yellow); font-weight:bold; margin-bottom:8px;">[?] APAKAH ANDA INGIN MENGUNDUH BERKAS INI?</p>
      <div style="background:var(--dos-dark-gray); border:1px solid var(--dos-yellow); padding:10px; margin:8px 0;">
        <p style="color:var(--dos-white); word-break:break-all;"><strong>• NAMA BERKAS :</strong> ${filename}</p>
        <p style="color:var(--dos-white);"><strong>• TIPE FORMAT :</strong> ${type}</p>
      </div>
      <p style="font-size:16px; color:var(--dos-green);">Tekan [ YES / UNDUH ] untuk menyimpan file ke perangkat.</p>
    </div>
  `;

  document.getElementById('modal-footer').innerHTML = `
    <button class="npdf-btn-action" id="cancel-dl-btn" style="background:var(--dos-dark-gray); color:var(--dos-red); border-color:var(--dos-red);">[ CANCEL / BATAL ]</button>
    <button class="npdf-btn-action" id="confirm-dl-btn">[ YES / UNDUH ]</button>
  `;

  modal.classList.add('active');

  document.getElementById('cancel-dl-btn').onclick = () => {
    modal.classList.remove('active');
  };

  document.getElementById('confirm-dl-btn').onclick = () => {
    modal.classList.remove('active');
    const blob = data instanceof Blob ? data : new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }

  let activeTool = 'imgToPdf';
  let loadedFiles = [];
  let downloadCounter = 1;
  let draggedIndex = null;

  let selectedPaperSize = 'a4';
  let selectedOrientation = 'p';
  let selectedCompressLevel = '0.5';
  let selectedRotateAngle = '90';
  let selectedPagePos = 'bottom-right';
  let selectedTargetLang = 'en';

  const fileInput = document.getElementById('file-input');
  const dropzone = document.getElementById('dropzone');
  const toolTitle = document.getElementById('tool-title');
  const toolDesc = document.getElementById('tool-desc');
  const fileListContainer = document.getElementById('file-list-container');
  const fileList = document.getElementById('file-list');
  const processBtn = document.getElementById('process-btn');
  const previewBtn = document.getElementById('preview-btn');
  const textEditor = document.getElementById('text-editor');
  const statusText = document.getElementById('status-text');
  const dynamicContainer = document.getElementById('dynamic-container');

  const optPaperSize = document.getElementById('opt-paper-size');
  const optOrientation = document.getElementById('opt-orientation');
  const optCompressLevel = document.getElementById('opt-compress-level');
  const optPassword = document.getElementById('opt-password');
  const optPageRange = document.getElementById('opt-page-range');
  const optDeletePages = document.getElementById('opt-delete-pages');
  const optPageOrder = document.getElementById('opt-page-order');
  const optRotateAngle = document.getElementById('opt-rotate-angle');
  const optWatermarkText = document.getElementById('opt-watermark-text');
  const optTargetLang = document.getElementById('opt-target-lang');
  const optPagePos = document.getElementById('opt-page-pos');
  const optCropMargin = document.getElementById('opt-crop-margin');

  textEditor.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      playTypewriterSound();
    }
  });

  function getSequentialFilename(prefix, ext) {
    const numStr = String(downloadCounter).padStart(3, '0');
    downloadCounter++;
    return `N_PDF_${prefix}_${numStr}.${ext}`;
  }

  function setupCustomDropdown(dropdownId, onChangeCallback) {
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

      document.querySelectorAll('.npdf-select-custom.open').forEach(d => { if (d !== dropdown) d.classList.remove('open'); });
      dropdown.classList.toggle('open');
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        label.innerText = item.innerText;
        dropdown.classList.remove('open');
        onChangeCallback(item.getAttribute('data-value'));
      });
    });
  }

  setupCustomDropdown('dd-paper-size', val => selectedPaperSize = val);
  setupCustomDropdown('dd-orientation', val => selectedOrientation = val);
  setupCustomDropdown('dd-compress-level', val => selectedCompressLevel = val);
  setupCustomDropdown('dd-rotate-angle', val => selectedRotateAngle = val);
  setupCustomDropdown('dd-page-pos', val => selectedPagePos = val);
  setupCustomDropdown('dd-target-lang', val => selectedTargetLang = val);

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => { if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files); });

  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault(); dropzone.classList.remove('dragover');
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  });

  function handleFiles(files) {
    for (let file of files) loadedFiles.push(file);
    renderUI();
  }

  window.removeFile = function(index) {
    loadedFiles.splice(index, 1);
    renderUI();
  };

  function renderUI() {
    fileList.innerHTML = '';
    if (loadedFiles.length > 0) {
      fileListContainer.style.display = 'block';
      loadedFiles.forEach((f, idx) => {
        const row = document.createElement('div');
        row.className = 'npdf-file-row';
        row.draggable = true;
        row.dataset.index = idx;
        row.innerHTML = `
          <div>
            <span class="file-drag-handle">☰</span>
            <span>[${idx+1}] ${f.name} (${Math.round(f.size/1024)} KB)</span>
          </div>
          <span class="del-btn" onclick="window.removeFile(${idx})">[HAPUS]</span>
        `;

        row.addEventListener('dragstart', (e) => {
          draggedIndex = idx;
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          draggedIndex = null;
        });

        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });

        row.addEventListener('drop', (e) => {
          e.preventDefault();
          const targetIndex = Number(row.dataset.index);
          if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const movedItem = loadedFiles.splice(draggedIndex, 1)[0];
            loadedFiles.splice(targetIndex, 0, movedItem);
            renderUI();
          }
        });

        fileList.appendChild(row);
      });
    } else { fileListContainer.style.display = 'none'; }

    if (!['txtToPdf', 'htmlToPdf'].includes(activeTool)) {
      processBtn.disabled = loadedFiles.length === 0;
      previewBtn.style.display = loadedFiles.length > 0 ? 'inline-block' : 'none';
    }
  }

  textEditor.addEventListener('input', () => { processBtn.disabled = textEditor.value.trim() === ''; });

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
      e.preventDefault();
      openTerminalModal();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      if (['txtToPdf', 'htmlToPdf'].includes(activeTool)) textEditor.focus();
      else fileInput.click();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      document.getElementById('sub-reset').click();
    } else if (e.key === 'Enter' && !e.shiftKey && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.id !== 'cmd-input') {
      if (!processBtn.disabled) {
        e.preventDefault();
        processBtn.click();
      }
    } else if (e.key === 'Escape') {
      const modal = document.getElementById('preview-modal');
      if (modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    } else if (e.key === 'F1') {
      e.preventDefault();
      document.getElementById('sub-help').click();
    }
  });

  document.getElementById('sub-terminal').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    openTerminalModal();
  });

  function openTerminalModal() {
    const modal = document.getElementById('preview-modal');
    document.getElementById('modal-title').innerText = '=== DOS COMMAND PROMPT (CMD.EXE) ===';
    document.getElementById('modal-body').innerHTML = `
      <div class="dos-terminal-box">
        <div class="dos-terminal-output" id="cmd-output">Microsoft MS-DOS Version 6.22\n(C)Copyright Microsoft Corp 1981-1993.\n\nKetik 'HELP' untuk melihat daftar perintah.\n</div>
        <div class="dos-terminal-input-row">
          <span>C:\\N_PDF></span>
          <input type="text" id="cmd-input" class="dos-terminal-input" autofocus autocomplete="off" spellcheck="false">
        </div>
      </div>
    `;
    document.getElementById('modal-footer').innerHTML = `<button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">[ TUTUP (ESC) ]</button>`;
    modal.classList.add('active');

    const cmdInput = document.getElementById('cmd-input');
    const cmdOutput = document.getElementById('cmd-output');

    cmdInput.focus();
    cmdInput.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        const val = cmdInput.value.trim().toUpperCase();
        cmdOutput.innerText += `C:\\N_PDF> ${cmdInput.value}\n`;
        cmdInput.value = '';

        if (val === 'HELP') {
          cmdOutput.innerText += `Daftar Perintah DOS:\n  DIR       : Tampilkan berkas terunggah\n  CLS       : Bersihkan layar terminal\n  STATUS    : Tampilkan modul aktif\n  CLEAR     : Hapus daftar berkas\n  RELOAD    : Muat ulang halaman web\n  TIME      : Waktu sistem saat ini\n  EXIT      : Tutup terminal\n\n`;
        } else if (val === 'DIR') {
          if (loadedFiles.length === 0) {
            cmdOutput.innerText += `File Not Found. 0 file(s) loaded.\n\n`;
          } else {
            loadedFiles.forEach((f, i) => {
              cmdOutput.innerText += `  [${i+1}] ${f.name.padEnd(24, ' ')} ${Math.round(f.size/1024)} KB\n`;
            });
            cmdOutput.innerText += `        ${loadedFiles.length} File(s) loaded.\n\n`;
          }
        } else if (val === 'CLS') {
          cmdOutput.innerText = '';
        } else if (val === 'STATUS') {
          cmdOutput.innerText += `Modul Aktif: ${activeTool.toUpperCase()}\nUkuran Kertas: ${selectedPaperSize.toUpperCase()}\n\n`;
        } else if (val === 'CLEAR') {
          loadedFiles = []; renderUI();
          cmdOutput.innerText += `Daftar berkas berhasil dibersihkan.\n\n`;
        } else if (val === 'RELOAD') {
          window.location.reload();
        } else if (val === 'TIME') {
          cmdOutput.innerText += `Current time is ${new Date().toLocaleTimeString()}\n\n`;
        } else if (val === 'EXIT') {
          modal.classList.remove('active');
        } else if (val !== '') {
          playErrorBeepSound();
          cmdOutput.innerText += `Bad command or file name.\n\n`;
        }
        cmdOutput.scrollTop = cmdOutput.scrollHeight;
      }
    });
  }

  document.querySelectorAll('.npdf-menu-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllMenubarDropdowns();
      if (!isOpen) wrapper.classList.add('open');
    });
  });

  function closeAllMenubarDropdowns() {
    document.querySelectorAll('.npdf-menu-wrapper').forEach(w => w.classList.remove('open'));
    document.querySelectorAll('.npdf-select-custom.open').forEach(d => d.classList.remove('open'));
  }

  document.addEventListener('click', () => closeAllMenubarDropdowns());

  document.getElementById('sub-buka').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    if (['txtToPdf', 'htmlToPdf'].includes(activeTool)) textEditor.focus();
    else fileInput.click();
  });

  document.getElementById('sub-reset').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    loadedFiles = []; fileInput.value = ''; textEditor.value = '';
    renderUI(); statusText.innerText = "STATUS: RESET SELESAI";
  });

  document.getElementById('sub-eksekusi').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    if (!processBtn.disabled) processBtn.click();
    else showDosAlert("Kesalahan Eksekusi", "Pilih atau masukkan berkas terlebih dahulu!");
  });

  document.getElementById('sub-cleartxt').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    textEditor.value = ''; processBtn.disabled = true;
    statusText.innerText = "STATUS: TEKS DIBERSIHKAN";
  });

  document.getElementById('sub-clearfiles').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    loadedFiles = []; renderUI(); statusText.innerText = "STATUS: BERKAS DIHAPUS";
  });

  document.querySelectorAll('.npdf-subitem[data-tool]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation(); closeAllMenubarDropdowns();
      switchMode(item.getAttribute('data-tool'));
    });
  });

  document.getElementById('sub-preview').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    if (loadedFiles.length === 0) showDosAlert("Peringatan Pratinjau", "Belum ada berkas yang diunggah!");
    else previewBtn.click();
  });

  document.getElementById('sub-sysinfo').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    const modal = document.getElementById('preview-modal');
    document.getElementById('modal-title').innerText = '=== DOS SYSTEM STATUS ===';
    document.getElementById('modal-body').innerHTML = `
      <div style="color:var(--dos-green); font-size:20px; line-height:1.5;">
        <p>> MEMORY CONVENTIONAL: 640 KB</p>
        <p>> EXTENDED MEMORY (XMS): 16384 KB</p>
        <p>> DRIVE C FREE SPACE: 20.4 MB</p>
        <p>> ACTIVE MODUL: ${activeTool.toUpperCase()}</p>
        <p>> BERKAS DI-LOAD: ${loadedFiles.length} File</p>
      </div>
    `;
    document.getElementById('modal-footer').innerHTML = `<button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">[ TUTUP (ESC) ]</button>`;
    modal.classList.add('active');
  });

  document.getElementById('sub-help').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    const modal = document.getElementById('preview-modal');
    document.getElementById('modal-title').innerText = '=== PANDUAN PENGGUNAAN ===';
    document.getElementById('modal-body').innerHTML = `
      <div style="color:var(--dos-white); font-size:18px; line-height:1.4;">
        <p style="color:var(--dos-yellow);">1. PILIH MODUL</p>
        <p>Klik tombol modul di atas atau gunakan menu Tools.</p><br>
        <p style="color:var(--dos-yellow);">2. UNGGAH / KETIK</p>
        <p>Klik/seret berkas ke kotak area seret, atau ketik teks jika di modul Teks/HTML.</p><br>
        <p style="color:var(--dos-yellow);">3. ATUR OPSI & EKSEKUSI</p>
        <p>Pilih ukuran kertas, orientasi, atau kata sandi lalu klik tombol [ EKSEKUSI PROSES ].</p>
      </div>
    `;
    document.getElementById('modal-footer').innerHTML = `<button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">[ TUTUP (ESC) ]</button>`;
    modal.classList.add('active');
  });

  document.getElementById('sub-about').addEventListener('click', (e) => {
    e.stopPropagation(); closeAllMenubarDropdowns();
    const modal = document.getElementById('preview-modal');
    document.getElementById('modal-title').innerText = '=== TENTANG N PDF ===';
    document.getElementById('modal-body').innerHTML = `
      <div style="color:var(--dos-green); font-size:19px; line-height:1.5; text-align:center;">
        <p style="color:var(--dos-yellow); font-size:22px;">N PDF STUDIO v1.0</p>
        <p>All-in-One Web-based PDF Utility Toolkit</p>
        <p>© N PDF Workspace. All Rights Reserved.</p>
      </div>
    `;
    document.getElementById('modal-footer').innerHTML = `<button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">[ TUTUP (ESC) ]</button>`;
    modal.classList.add('active');
  });

  document.querySelectorAll('.npdf-nav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      switchMode(this.getAttribute('data-mode'));
    });
  });

  function switchMode(mode) {
    if (activeTool === mode) return;

    dynamicContainer.classList.add('switching');

    setTimeout(() => {
      activeTool = mode; 
      loadedFiles = []; 
      fileInput.value = ''; 
      textEditor.value = '';
      hideDosProgress();
      
      document.querySelectorAll('.npdf-nav-btn').forEach(b => {
        if (b.getAttribute('data-mode') === mode) b.classList.add('active');
        else b.classList.remove('active');
      });

      optPaperSize.style.display = 'none'; optOrientation.style.display = 'none';
      optCompressLevel.style.display = 'none'; optPassword.style.display = 'none';
      optPageRange.style.display = 'none'; optDeletePages.style.display = 'none';
      optPageOrder.style.display = 'none'; optRotateAngle.style.display = 'none';
      optWatermarkText.style.display = 'none'; optTargetLang.style.display = 'none';
      optPagePos.style.display = 'none'; optCropMargin.style.display = 'none';
      previewBtn.style.display = 'none';

      if (mode === 'imgToPdf') {
        toolTitle.innerText = '> MODUL: FOTO KE PDF DOKUMEN';
        toolDesc.innerText = 'Ubah daftar berkas gambar (JPG, PNG) menjadi dokumen PDF terstruktur.';
        fileInput.accept = 'image/*'; fileInput.multiple = true;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optPaperSize.style.display = 'flex'; optOrientation.style.display = 'flex';
      } else if (mode === 'pdfToImg') {
        toolTitle.innerText = '> MODUL: PDF KE FOTO (PAKET ZIP)';
        toolDesc.innerText = 'Ekstrak setiap halaman PDF menjadi foto PNG & kemas dalam format .ZIP.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
      } else if (mode === 'compressPdf') {
        toolTitle.innerText = '> MODUL: KOMPRES UKURAN PDF';
        toolDesc.innerText = 'Kecilkan resolusi & ukuran file PDF secara optimal.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optCompressLevel.style.display = 'flex';
      } else if (mode === 'protectPdf') {
        toolTitle.innerText = '> MODUL: KUNCI / PASSWORD PDF';
        toolDesc.innerText = 'Proteksi dokumen PDF menggunakan kata sandi.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optPassword.style.display = 'flex';
      } else if (mode === 'unlockPdf') {
        toolTitle.innerText = '> MODUL: BUKA KUNCI PDF';
        toolDesc.innerText = 'Hapus atau buka proteksi password pada berkas PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optPassword.style.display = 'flex';
      } else if (mode === 'flattenPdf') {
        toolTitle.innerText = '> MODUL: FLATTEN PDF (KUNCI ISI DOKUMEN)';
        toolDesc.innerText = 'Ubah seluruh isi dokumen/formulir PDF menjadi gambar datar agar tidak bisa disunting.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
      } else if (mode === 'cleanMetadata') {
        toolTitle.innerText = '> MODUL: HAPUS METADATA SENSITIF';
        toolDesc.innerText = 'Hapus data tersembunyi seperti Author, Software, dan tanggal riwayat dari file PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
      } else if (mode === 'mergePdf') {
        toolTitle.innerText = '> MODUL: GABUNG PDF';
        toolDesc.innerText = 'Satukan beberapa dokumen PDF menjadi satu file.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = true;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
      } else if (mode === 'splitPdf') {
        toolTitle.innerText = '> MODUL: PISAH PDF';
        toolDesc.innerText = 'Ambil halaman tertentu dari berkas PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optPageRange.style.display = 'flex';
      } else if (mode === 'deletePages') {
        toolTitle.innerText = '> MODUL: HAPUS HALAMAN PDF';
        toolDesc.innerText = 'Hapus satu atau beberapa halaman yang tidak diinginkan.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optDeletePages.style.display = 'flex';
      } else if (mode === 'rotatePdf') {
        toolTitle.innerText = '> MODUL: PUTAR ORIENTASI PDF';
        toolDesc.innerText = 'Putar rotasi halaman dokumen PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optRotateAngle.style.display = 'flex';
      } else if (mode === 'watermarkPdf') {
        toolTitle.innerText = '> MODUL: TAMBAH WATERMARK';
        toolDesc.innerText = 'Cetak teks watermark diagonal pada dokumen.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optWatermarkText.style.display = 'flex';
      } else if (mode === 'pageNumbersPdf') {
        toolTitle.innerText = '> MODUL: NOMOR HALAMAN PDF';
        toolDesc.innerText = 'Tambahkan penomoran halaman otomatis dengan posisi custom.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optPagePos.style.display = 'flex';
      } else if (mode === 'organizePdf') {
        toolTitle.innerText = '> MODUL: URUTKAN HALAMAN PDF';
        toolDesc.innerText = 'Atur ulang atau balikkan urutan susunan halaman PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optPageOrder.style.display = 'flex';
      } else if (mode === 'cropPdf') {
        toolTitle.innerText = '> MODUL: CROP MARGINS PDF';
        toolDesc.innerText = 'Potong area pinggir (margin) kosong pada halaman PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optCropMargin.style.display = 'flex';
      } else if (mode === 'extractImages') {
        toolTitle.innerText = '> MODUL: EKSTRAK GAMBAR (PAKET ZIP)';
        toolDesc.innerText = 'Ambil dan unduh seluruh aset foto/gambar PDF dalam satu file .ZIP.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
      } else if (mode === 'pdfToTxt') {
        toolTitle.innerText = '> MODUL: PDF KE TEKS (EKSTRAK)';
        toolDesc.innerText = 'Ekstrak seluruh teks mentah dari file PDF.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
      } else if (mode === 'txtToPdf') {
        toolTitle.innerText = '> MODUL: TEKS KE PDF';
        toolDesc.innerText = 'Ketik catatan teks langsung untuk dikonversi.';
        dropzone.style.display = 'none'; textEditor.style.display = 'block';
        optPaperSize.style.display = 'flex';
      } else if (mode === 'htmlToPdf') {
        toolTitle.innerText = '> MODUL: HTML KE PDF';
        toolDesc.innerText = 'Render markup kode HTML menjadi halaman PDF.';
        dropzone.style.display = 'none'; textEditor.style.display = 'block';
      } else if (mode === 'translatePdf') {
        toolTitle.innerText = '> MODUL: TERJEMAHKAN PDF (TEROPTIMASI)';
        toolDesc.innerText = 'Terjemahkan dokumen PDF secara presisi menggunakan mode batch terjemahan.';
        fileInput.accept = 'application/pdf'; fileInput.multiple = false;
        dropzone.style.display = 'block'; textEditor.style.display = 'none';
        optTargetLang.style.display = 'flex';
      }
      statusText.innerText = "STATUS: MODUL " + mode.toUpperCase();
      renderUI();

      dynamicContainer.classList.remove('switching');
    }, 100);
  }

  previewBtn.addEventListener('click', async () => {
    if (loadedFiles.length === 0) return;
    const modal = document.getElementById('preview-modal');
    document.getElementById('modal-title').innerText = '=== HASIL PRATINJAU DOKUMEN ===';
    document.getElementById('modal-body').innerHTML = '<canvas id="pdf-preview-canvas"></canvas>';
    document.getElementById('modal-footer').innerHTML = `<button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">[ TUTUP (ESC) ]</button>`;
    modal.classList.add('active');

    const file = loadedFiles[0]; let arrayBuffer;
    if (file.type === 'application/pdf') { arrayBuffer = await file.arrayBuffer(); } 
    else {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const base64 = await fileToDataURL(file);
      pdf.addImage(base64, 'JPEG', 10, 10, 180, 240);
      arrayBuffer = pdf.output('arraybuffer');
    }

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.getElementById('pdf-preview-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
  });

  processBtn.addEventListener('click', async () => {
    processBtn.disabled = true; processBtn.innerText = "PROSES...";
    statusText.innerText = "STATUS: MEMPROSES DOKUMEN...";
    startFloppyDiskSound();
    try {
      if (activeTool === 'imgToPdf') await convertImgToPdf();
      else if (activeTool === 'pdfToImg') await convertPdfToImgZip();
      else if (activeTool === 'compressPdf') await compressPdf();
      else if (activeTool === 'protectPdf') await protectPdf();
      else if (activeTool === 'unlockPdf') await unlockPdf();
      else if (activeTool === 'flattenPdf') await flattenPdf();
      else if (activeTool === 'cleanMetadata') await cleanMetadata();
      else if (activeTool === 'mergePdf') await mergePdfs();
      else if (activeTool === 'splitPdf') await splitPdf();
      else if (activeTool === 'deletePages') await deletePagesPdf();
      else if (activeTool === 'rotatePdf') await rotatePdf();
      else if (activeTool === 'watermarkPdf') await watermarkPdf();
      else if (activeTool === 'pageNumbersPdf') await addPageNumbers();
      else if (activeTool === 'organizePdf') await organizePages();
      else if (activeTool === 'cropPdf') await cropMarginsPdf();
      else if (activeTool === 'extractImages') await extractImagesToZip();
      else if (activeTool === 'pdfToTxt') await convertPdfToTxt();
      else if (activeTool === 'txtToPdf') await convertTxtToPdf();
      else if (activeTool === 'htmlToPdf') await htmlToPdf();
      else if (activeTool === 'translatePdf') await translatePdfBatch();
      
      updateDosProgress(100, 100, "PROSES SELESAI!");
      statusText.innerText = "STATUS: PROSES SUKSES!";
      playStatusBeep(true);
    } catch (err) {
      hideDosProgress();
      showDosAlert("Proses Gagal", err.message);
      statusText.innerText = "STATUS: PROSES GAGAL!";
      playStatusBeep(false);
    } finally {
      processBtn.innerText = "[ EKSEKUSI PROSES ]"; processBtn.disabled = false;
    }
  });

  async function convertImgToPdf() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ format: selectedPaperSize, orientation: selectedOrientation });
    const total = loadedFiles.length;
    for (let i = 0; i < total; i++) {
      updateDosProgress(i + 1, total, `MENULIS HALAMAN ${i+1}/${total}`);
      const base64 = await fileToDataURL(loadedFiles[i]);
      const img = await loadImage(base64);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pageWidth; let imgHeight = (img.height * pageWidth) / img.width;
      if (imgHeight > pageHeight) { imgHeight = pageHeight; imgWidth = (img.width * pageHeight) / img.height; }
      if (i > 0) pdf.addPage();
      pdf.addImage(base64, 'JPEG', (pageWidth - imgWidth) / 2, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
    }
    const outBytes = pdf.output('arraybuffer');
    triggerDosDownloadModal(outBytes, getSequentialFilename('Foto', 'pdf'), 'application/pdf');
  }

  async function convertPdfToImgZip() {
    const file = loadedFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const zip = new JSZip();

    for (let i = 1; i <= total; i++) {
      updateDosProgress(i, total, `RENDERING GAMBAR HALAMAN ${i}/${total}`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
      zip.file(`Halaman_${i}.png`, base64Data, { base64: true });
    }

    updateDosProgress(100, 100, "MENGEMAS ARSIP ZIP...");
    const zipContent = await zip.generateAsync({ type: "blob" });
    triggerDosDownloadModal(zipContent, getSequentialFilename('Halaman_Gambar', 'zip'), 'application/zip');
  }

  async function compressPdf() {
    const file = loadedFiles[0];
    const scaleQuality = Number(selectedCompressLevel);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const { jsPDF } = window.jspdf; const newPdf = new jsPDF();
    for (let i = 1; i <= total; i++) {
      updateDosProgress(i, total, `KOMPRES HALAMAN ${i}/${total}`);
      const page = await pdf.getPage(i); const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      const compressedBase64 = canvas.toDataURL('image/jpeg', scaleQuality);
      const pageWidth = newPdf.internal.pageSize.getWidth();
      const pageHeight = newPdf.internal.pageSize.getHeight();
      if (i > 1) newPdf.addPage();
      newPdf.addImage(compressedBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
    }
    const outBytes = newPdf.output('arraybuffer');
    triggerDosDownloadModal(outBytes, getSequentialFilename('Compressed', 'pdf'), 'application/pdf');
  }

  async function protectPdf() {
    const file = loadedFiles[0]; const password = document.getElementById('input-password').value.trim();
    if (!password) throw new Error("Masukkan kata sandi terlebih dahulu!");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const { jsPDF } = window.jspdf;
    const newPdf = new jsPDF({ encryption: { userPassword: password, ownerPassword: password, userPermissions: ["print", "modify", "copy"] } });
    for (let i = 1; i <= total; i++) {
      updateDosProgress(i, total, `PROTEKSI HALAMAN ${i}/${total}`);
      const page = await pdf.getPage(i); const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pageWidth = newPdf.internal.pageSize.getWidth();
      const pageHeight = newPdf.internal.pageSize.getHeight();
      if (i > 1) newPdf.addPage();
      newPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }
    const outBytes = newPdf.output('arraybuffer');
    triggerDosDownloadModal(outBytes, getSequentialFilename('Protected', 'pdf'), 'application/pdf');
  }

  async function unlockPdf() {
    updateDosProgress(50, 100, "MEMBUKA PROTEKSI...");
    const file = loadedFiles[0]; const password = document.getElementById('input-password').value.trim();
    const arrayBuffer = await file.arrayBuffer();
    try {
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { password: password || undefined, ignoreEncryption: true });
      const newPdf = await PDFLib.PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => newPdf.addPage(page));
      const pdfBytes = await newPdf.save(); 
      triggerDosDownloadModal(pdfBytes, getSequentialFilename('Unlocked', 'pdf'), 'application/pdf');
    } catch (e) { throw new Error("Kata sandi tidak valid atau berkas bukan terproteksi!"); }
  }

  async function flattenPdf() {
    const file = loadedFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const { jsPDF } = window.jspdf;
    const newPdf = new jsPDF();

    for (let i = 1; i <= total; i++) {
      updateDosProgress(i, total, `FLATTENING HALAMAN ${i}/${total}`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      const pageWidth = newPdf.internal.pageSize.getWidth();
      const pageHeight = newPdf.internal.pageSize.getHeight();

      if (i > 1) newPdf.addPage();
      newPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }
    const outBytes = newPdf.output('arraybuffer');
    triggerDosDownloadModal(outBytes, getSequentialFilename('Flattened', 'pdf'), 'application/pdf');
  }

  async function cleanMetadata() {
    updateDosProgress(50, 100, "MEMBERSIHKAN METADATA...");
    const file = loadedFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('N PDF Studio');
    pdfDoc.setCreator('N PDF Studio');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    const pdfBytes = await pdfDoc.save();
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Cleaned', 'pdf'), 'application/pdf');
  }

  async function mergePdfs() {
    const mergedPdf = await PDFLib.PDFDocument.create();
    const total = loadedFiles.length;
    for (let idx = 0; idx < total; idx++) {
      updateDosProgress(idx + 1, total, `GABUNG BERKAS ${idx + 1}/${total}`);
      const file = loadedFiles[idx];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    const pdfBytes = await mergedPdf.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Merged', 'pdf'), 'application/pdf');
  }

  async function splitPdf() {
    updateDosProgress(50, 100, "MEMISAHKAN DOKUMEN...");
    const file = loadedFiles[0]; const rangeVal = document.getElementById('input-range').value.trim();
    if (!rangeVal) throw new Error("Masukkan rentang halaman yang valid!");
    const arrayBuffer = await file.arrayBuffer(); const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const newPdf = await PDFLib.PDFDocument.create();
    let pagesToExtract = parsePageRange(rangeVal, pdfDoc.getPageCount());
    if (pagesToExtract.length === 0) throw new Error("Halaman tidak teridentifikasi pada dokumen!");
    const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Split', 'pdf'), 'application/pdf');
  }

  async function deletePagesPdf() {
    updateDosProgress(50, 100, "MENGHAPUS HALAMAN...");
    const file = loadedFiles[0]; const delVal = document.getElementById('input-delete-pages').value.trim();
    if (!delVal) throw new Error("Masukkan nomor halaman yang ingin dihapus!");
    const arrayBuffer = await file.arrayBuffer(); const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    const pagesToDelete = new Set(parsePageRange(delVal, totalPages));
    
    const newPdf = await PDFLib.PDFDocument.create();
    const pagesToKeep = [];
    for (let i = 0; i < totalPages; i++) { if (!pagesToDelete.has(i)) pagesToKeep.push(i); }
    if (pagesToKeep.length === 0) throw new Error("Tidak bisa menghapus seluruh halaman dokumen!");
    const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Modified', 'pdf'), 'application/pdf');
  }

  async function rotatePdf() {
    updateDosProgress(50, 100, "MEMUTAR DOKUMEN...");
    const file = loadedFiles[0]; const angle = Number(selectedRotateAngle);
    const arrayBuffer = await file.arrayBuffer(); const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    pdfDoc.getPages().forEach(page => { const currentRotation = page.getRotation().angle; page.setRotation(PDFLib.degrees(currentRotation + angle)); });
    const pdfBytes = await pdfDoc.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Rotated', 'pdf'), 'application/pdf');
  }

  async function watermarkPdf() {
    updateDosProgress(50, 100, "MENAMBAHKAN WATERMARK...");
    const file = loadedFiles[0]; const text = document.getElementById('input-watermark').value.trim() || 'N PDF DOKUMEN';
    const arrayBuffer = await file.arrayBuffer(); const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    pdfDoc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(text, { x: width / 4, y: height / 2, size: 36, font: font, color: PDFLib.rgb(0.75, 0.75, 0.75), rotate: PDFLib.degrees(45), opacity: 0.4 });
    });
    const pdfBytes = await pdfDoc.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Watermark', 'pdf'), 'application/pdf');
  }

  async function addPageNumbers() {
    updateDosProgress(50, 100, "MENAMBAHKAN NOMOR HALAMAN...");
    const file = loadedFiles[0]; const arrayBuffer = await file.arrayBuffer();
    const pos = selectedPagePos;
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      const text = `Halaman ${idx + 1} dari ${pages.length}`;
      let x = width - 120; let y = 25;
      if (pos === 'bottom-center') { x = (width / 2) - 40; y = 25; }
      else if (pos === 'bottom-left') { x = 30; y = 25; }
      else if (pos === 'top-right') { x = width - 120; y = height - 30; }
      else if (pos === 'top-center') { x = (width / 2) - 40; y = height - 30; }
      page.drawText(text, { x: x, y: y, size: 12, font: font, color: PDFLib.rgb(0, 0, 0) });
    });
    const pdfBytes = await pdfDoc.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Numbered', 'pdf'), 'application/pdf');
  }

  async function organizePages() {
    updateDosProgress(50, 100, "MENGURUTKAN HALAMAN...");
    const file = loadedFiles[0]; const orderVal = document.getElementById('input-page-order').value.trim();
    const arrayBuffer = await file.arrayBuffer(); const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const newPdf = await PDFLib.PDFDocument.create();
    let pageIndices = [];
    if (orderVal) {
      pageIndices = orderVal.split(',').map(n => Number(n.trim()) - 1);
    } else {
      pageIndices = pdfDoc.getPageIndices().reverse();
    }
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Organized', 'pdf'), 'application/pdf');
  }

  async function cropMarginsPdf() {
    updateDosProgress(50, 100, "CROP MARGINS...");
    const file = loadedFiles[0];
    const margin = Number(document.getElementById('input-crop-margin').value) || 20;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    pdfDoc.getPages().forEach(page => {
      const { x, y, width, height } = page.getCropBox();
      page.setCropBox(x + margin, y + margin, width - (margin * 2), height - (margin * 2));
    });
    const pdfBytes = await pdfDoc.save(); 
    triggerDosDownloadModal(pdfBytes, getSequentialFilename('Cropped', 'pdf'), 'application/pdf');
  }

  async function extractImagesToZip() {
    const file = loadedFiles[0]; const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const zip = new JSZip();

    for (let i = 1; i <= total; i++) {
      updateDosProgress(i, total, `EKSTRAK GAMBAR HALAMAN ${i}/${total}`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
      zip.file(`Gambar_Hal_${i}.png`, base64Data, { base64: true });
    }

    updateDosProgress(100, 100, "MEMBUAT BERKAS ZIP...");
    const zipContent = await zip.generateAsync({ type: "blob" });
    triggerDosDownloadModal(zipContent, getSequentialFilename('Ekstrak_Gambar', 'zip'), 'application/zip');
  }

  async function convertPdfToTxt() {
    updateDosProgress(50, 100, "EKSTRAK TEKS...");
    const file = loadedFiles[0]; const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += `--- HALAMAN ${i} ---\n` + textContent.items.map(item => item.str).join(' ') + '\n\n';
    }
    const textBytes = new TextEncoder().encode(fullText);
    triggerDosDownloadModal(textBytes, getSequentialFilename('Text', 'txt'), 'text/plain');
  }

  async function convertTxtToPdf() {
    updateDosProgress(50, 100, "MEMBUAT PDF DARI TEKS...");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ format: selectedPaperSize });
    const text = textEditor.value; const splitText = pdf.splitTextToSize(text, 180);
    pdf.text(splitText, 15, 15); 
    const outBytes = pdf.output('arraybuffer');
    triggerDosDownloadModal(outBytes, getSequentialFilename('FromTxt', 'pdf'), 'application/pdf');
  }

  async function htmlToPdf() {
    updateDosProgress(50, 100, "RENDERING HTML KE PDF...");
    const content = textEditor.value;
    const fileName = getSequentialFilename('FromHtml', 'pdf');
    const opt = { margin: 1, filename: fileName, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter' } };
    
    const element = document.createElement('div');
    element.innerHTML = content;
    const pdfWorker = html2pdf().set(opt).from(element).toPdf();
    const pdfObj = await pdfWorker.output('arraybuffer');
    
    triggerDosDownloadModal(pdfObj, fileName, 'application/pdf');
  }

  async function translatePdfBatch() {
    const file = loadedFiles[0];
    const targetLang = selectedTargetLang;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const { jsPDF } = window.jspdf; 
    const newPdf = new jsPDF({ unit: 'pt', format: 'a4' });

    const canvasTemp = document.createElement('canvas');
    const ctxTemp = canvasTemp.getContext('2d');

    for (let pageNum = 1; pageNum <= total; pageNum++) {
      updateDosProgress(pageNum, total, `MENERJEMAHKAN HALAMAN ${pageNum}/${total}`);
      if (pageNum > 1) newPdf.addPage();
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      const itemsToTranslate = textContent.items
        .map(item => item.str.trim())
        .filter(str => str.length > 0);

      if (itemsToTranslate.length === 0) continue;

      const batchString = itemsToTranslate.join(" ||| ");
      let translatedTextArray = itemsToTranslate;

      try {
        const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(batchString));
        const data = await res.json();
        if (data && data[0] && data[0][0]) {
          const fullTranslatedStr = data[0].map(x => x[0]).join('');
          translatedTextArray = fullTranslatedStr.split(" ||| ");
        }
      } catch (e) {
        console.warn("Koneksi API Translate Gagal, menggunakan teks asli.");
      }

      let tIndex = 0;
      for (let item of textContent.items) {
        const text = item.str.trim(); 
        if (!text) continue;

        const translatedText = translatedTextArray[tIndex] || text;
        tIndex++;

        const tx = item.transform; 
        const x = tx[4]; 
        const y = viewport.height - tx[5];
        const fontSize = Math.max(Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) || 10, 8);

        ctxTemp.font = `${fontSize * 1.5}px sans-serif`;
        const metrics = ctxTemp.measureText(translatedText);
        const textWidth = Math.max(metrics.width, 10);
        const textHeight = fontSize * 2;

        canvasTemp.width = textWidth + 10;
        canvasTemp.height = textHeight + 10;

        ctxTemp.font = `${fontSize * 1.5}px sans-serif`;
        ctxTemp.fillStyle = '#000000';
        ctxTemp.textBaseline = 'top';
        ctxTemp.fillText(translatedText, 5, 5);

        const imgData = canvasTemp.toDataURL('image/png');
        newPdf.addImage(imgData, 'PNG', x, y - fontSize, textWidth, textHeight);
      }
    }
    const outBytes = newPdf.output('arraybuffer');
    triggerDosDownloadModal(outBytes, getSequentialFilename(`Translated_${targetLang.toUpperCase().replace('-', '_')}`, 'pdf'), 'application/pdf');
  }

  function parsePageRange(rangeStr, maxPages) {
    const indices = [];
    const parts = rangeStr.split(',');
    for (let part of parts) {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxPages) indices.push(i - 1);
        }
      } else {
        const num = Number(part);
        if (num >= 1 && num <= maxPages) indices.push(num - 1);
      }
    }
    return indices;
  }

  function fileToDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result); reader.readAsDataURL(file);
    });
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image(); img.onload = () => resolve(img); img.src = url;
    });
  }
});
