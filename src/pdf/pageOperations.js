import { parsePageRange, validateFileSize } from '../utils/validators.js';

/**
 * Organize/reorder pages in PDF
 * @param {File} pdfFile - PDF file
 * @param {string} pageOrder - Comma-separated page order (e.g., '3,1,2') or empty for reverse
 * @returns {Promise<ArrayBuffer>} Reorganized PDF bytes
 * @throws {Error} if organization fails
 */
export async function organizePages(pdfFile, pageOrder = '') {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const newPdf = await PDFLib.PDFDocument.create();

  let pageIndices = [];

  if (pageOrder && pageOrder.trim().length > 0) {
    try {
      pageIndices = pageOrder
        .split(',')
        .map((n) => Number(n.trim()) - 1)
        .filter((n) => n >= 0 && n < pdfDoc.getPageCount());
    } catch (e) {
      throw new Error('Format urutan halaman tidak valid!');
    }
  } else {
    pageIndices = pdfDoc.getPageIndices().reverse();
  }

  if (pageIndices.length === 0) {
    throw new Error('Tidak ada halaman valid untuk diurutkan!');
  }

  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}
