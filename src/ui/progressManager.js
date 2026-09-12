/**
 * Progress Manager for DOS-style progress display
 */
class ProgressManager {
  constructor() {
    this.progressBox = document.getElementById('dos-progress-container');
    this.progressStatus = document.getElementById('dos-progress-status');
    this.progressPercent = document.getElementById('dos-progress-percent');
    this.progressBarLine = document.getElementById('dos-progress-bar-line');
  }

  /**
   * Update progress display
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {string} statusText - Status text to display
   */
  update(current, total, statusText = 'MEMPROSES DOKUMEN...') {
    this.progressBox.style.display = 'block';
    const percentage = Math.min(Math.round((current / total) * 100), 100);
    const totalBlocks = 20;
    const filledBlocks = Math.round((percentage / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;

    const barStr = '[' + '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks) + ']';

    this.progressStatus.innerText = `> ${statusText}`;
    this.progressPercent.innerText = `${percentage}%`;
    this.progressBarLine.innerText = barStr;
  }

  /**
   * Hide progress display
   */
  hide() {
    this.progressBox.style.display = 'none';
  }

  /**
   * Reset progress to zero
   */
  reset() {
    this.update(0, 100, 'SIAP');
    this.hide();
  }
}

export default new ProgressManager();
