import audioEngine from '../audio/audioEngine.js';
import { formatErrorMessage } from '../utils/helpers.js';

/**
 * Modal Manager for DOS-style dialogs
 */
class ModalManager {
  constructor() {
    this.modal = document.getElementById('preview-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalFooter = document.getElementById('modal-footer');
  }

  /**
   * Show DOS-style alert dialog
   * @param {string} title - Dialog title
   * @param {string} message - Error message
   */
  showAlert(title, message) {
    audioEngine.playErrorBeepSound();
    this.modalTitle.innerText = `=== ${title.toUpperCase()} ===`;
    this.modalBody.innerHTML = `
      <div style="color:var(--dos-red); font-size:20px; line-height:1.4; padding:8px 0;">
        <p style="color:var(--dos-yellow); font-weight:bold; margin-bottom:6px;">[!] PESAN KESALAHAN DOS:</p>
        <p>• ${message}</p>
      </div>
    `;
    this.modalFooter.innerHTML = `
      <button class="npdf-btn-action" id="close-modal-btn" onclick="document.getElementById('preview-modal').classList.remove('active')">
        [ TUTUP ]
      </button>
    `;
    this.open();
  }

  /**
   * Show download confirmation dialog
   * @param {Blob|ArrayBuffer} data - File data
   * @param {string} filename - Suggested filename
   * @param {string} type - MIME type
   * @returns {Promise<boolean>} True if user confirms
   */
  showDownloadConfirm(data, filename, type) {
    return new Promise((resolve) => {
      this.modalTitle.innerText = '=== DOS FILE DOWNLOAD CONFIRMATION ===';
      this.modalBody.innerHTML = `
        <div style="color:var(--dos-white); font-size:19px; line-height:1.4;">
          <p style="color:var(--dos-yellow); font-weight:bold; margin-bottom:8px;">[?] APAKAH ANDA INGIN MENGUNDUH BERKAS INI?</p>
          <div style="background:var(--dos-dark-gray); border:1px solid var(--dos-yellow); padding:10px; margin:8px 0;">
            <p style="color:var(--dos-white); word-break:break-all;">
              <strong>• NAMA BERKAS :</strong> ${filename}
            </p>
            <p style="color:var(--dos-white);">
              <strong>• TIPE FORMAT :</strong> ${type}
            </p>
          </div>
          <p style="font-size:16px; color:var(--dos-green);">
            Tekan [ YES / UNDUH ] untuk menyimpan file ke perangkat.
          </p>
        </div>
      `;

      this.modalFooter.innerHTML = `
        <button class="npdf-btn-action" id="cancel-dl-btn" style="background:var(--dos-dark-gray); color:var(--dos-red); border-color:var(--dos-red);">
          [ CANCEL / BATAL ]
        </button>
        <button class="npdf-btn-action" id="confirm-dl-btn">
          [ YES / UNDUH ]
        </button>
      `;

      this.open();

      document.getElementById('cancel-dl-btn').onclick = () => {
        this.close();
        resolve(false);
      };

      document.getElementById('confirm-dl-btn').onclick = () => {
        this.close();
        const blob = data instanceof Blob ? data : new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(true);
      };
    });
  }

  /**
   * Open modal
   */
  open() {
    this.modal.classList.add('active');
  }

  /**
   * Close modal
   */
  close() {
    this.modal.classList.remove('active');
  }
}

export default new ModalManager();
