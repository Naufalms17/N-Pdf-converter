import { parsePageRange, validateFileSize, validatePassword } from '../utils/validators.js';
import { fileToDataURL, loadImage } from '../utils/helpers.js';
import progressManager from '../ui/progressManager.js';

/**
 * Convert images to PDF
 * @param {File[]} images - Array of image files
 * @param {Object} options
 * @param {string} options.paperSize - Paper size (a4, letter, legal)
 * @param {string} options.orientation - Page orientation (p, l)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<ArrayBuffer>} PDF bytes
 * @throws {Error} if conversion fails
 */
export async function convertImgToPdf(images, options = {}, onProgress) {
  if (!images || images.length === 0) {
    throw new Error('Pilih minimal satu gambar!');
  }

  const { paperSize = 'a4', orientation = 'p' } = options;

  // Validate all files
  for (const file of images) {
    validateFileSize(file);
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ format: paperSize, orientation });
  const total = images.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total, `MENULIS HALAMAN ${i + 1}/${total}`);

    const base64 = await fileToDataURL(images[i]);
    const img = await loadImage(base64);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let imgWidth = pageWidth;
    let imgHeight = (img.height * pageWidth) / img.width;

    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = (img.width * pageHeight) / img.height;
    }

    if (i > 0) pdf.addPage();
    pdf.addImage(
      base64,
      'JPEG',
      (pageWidth - imgWidth) / 2,
      (pageHeight - imgHeight) / 2,
      imgWidth,
      imgHeight
    );
  }

  return pdf.output('arraybuffer');
}

/**
 * Convert PDF to images (ZIP)
 * @param {File} pdfFile - PDF file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} ZIP blob
 * @throws {Error} if conversion fails
 */
export async function convertPdfToImgZip(pdfFile, onProgress) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const zip = new JSZip();

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(i, total, `RENDERING GAMBAR HALAMAN ${i}/${total}`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    zip.file(`Halaman_${i}.png`, base64Data, { base64: true });
  }

  if (onProgress) onProgress(100, 100, 'MENGEMAS ARSIP ZIP...');
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Compress PDF
 * @param {File} pdfFile - PDF file
 * @param {string} quality - Compression quality (0.7, 0.5, 0.3)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<ArrayBuffer>} Compressed PDF bytes
 * @throws {Error} if compression fails
 */
export async function compressPdf(pdfFile, quality = '0.5', onProgress) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const scaleQuality = Number(quality);
  if (isNaN(scaleQuality) || scaleQuality <= 0 || scaleQuality >= 1) {
    throw new Error('Kualitas kompresi tidak valid!');
  }

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const { jsPDF } = window.jspdf;
  const newPdf = new jsPDF();

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(i, total, `KOMPRES HALAMAN ${i}/${total}`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const compressedBase64 = canvas.toDataURL('image/jpeg', scaleQuality);
    const pageWidth = newPdf.internal.pageSize.getWidth();
    const pageHeight = newPdf.internal.pageSize.getHeight();

    if (i > 1) newPdf.addPage();
    newPdf.addImage(compressedBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  return newPdf.output('arraybuffer');
}

/**
 * Protect PDF with password
 * @param {File} pdfFile - PDF file
 * @param {string} password - Password to set
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<ArrayBuffer>} Protected PDF bytes
 * @throws {Error} if protection fails
 */
export async function protectPdf(pdfFile, password, onProgress) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);
  validatePassword(password);

  if (onProgress) onProgress(50, 100, 'MELINDUNGI DOKUMEN...');

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const { jsPDF } = window.jspdf;

  const newPdf = new jsPDF({
    encryption: {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print', 'modify', 'copy'],
    },
  });

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(50 + (i / total) * 50, 100, `PROTEKSI HALAMAN ${i}/${total}`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pageWidth = newPdf.internal.pageSize.getWidth();
    const pageHeight = newPdf.internal.pageSize.getHeight();

    if (i > 1) newPdf.addPage();
    newPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  return newPdf.output('arraybuffer');
}

/**
 * Unlock PDF (remove password protection)
 * @param {File} pdfFile - PDF file
 * @param {string} password - Password (optional)
 * @returns {Promise<ArrayBuffer>} Unprotected PDF bytes
 * @throws {Error} if unlock fails
 */
export async function unlockPdf(pdfFile, password = '') {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();

  try {
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
      password: password || undefined,
      ignoreEncryption: true,
    });

    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => newPdf.addPage(page));

    return await newPdf.save();
  } catch (e) {
    throw new Error('Kata sandi tidak valid atau berkas bukan terproteksi!');
  }
}

/**
 * Merge multiple PDFs
 * @param {File[]} pdfFiles - Array of PDF files
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<ArrayBuffer>} Merged PDF bytes
 * @throws {Error} if merge fails
 */
export async function mergePdfs(pdfFiles, onProgress) {
  if (!pdfFiles || pdfFiles.length === 0) {
    throw new Error('Pilih minimal satu PDF!');
  }

  for (const file of pdfFiles) {
    validateFileSize(file);
  }

  const mergedPdf = await PDFLib.PDFDocument.create();
  const total = pdfFiles.length;

  for (let idx = 0; idx < total; idx++) {
    if (onProgress) onProgress(idx + 1, total, `GABUNG BERKAS ${idx + 1}/${total}`);

    const file = pdfFiles[idx];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split PDF (extract specific pages)
 * @param {File} pdfFile - PDF file
 * @param {string} pageRange - Page range (e.g., '1-3,5')
 * @returns {Promise<ArrayBuffer>} Split PDF bytes
 * @throws {Error} if split fails
 */
export async function splitPdf(pdfFile, pageRange) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  if (!pageRange || pageRange.trim().length === 0) {
    throw new Error('Masukkan rentang halaman yang valid!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const newPdf = await PDFLib.PDFDocument.create();

  const pagesToExtract = parsePageRange(pageRange, pdfDoc.getPageCount());
  const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Delete specific pages from PDF
 * @param {File} pdfFile - PDF file
 * @param {string} pageRange - Pages to delete (e.g., '2,5')
 * @returns {Promise<ArrayBuffer>} Modified PDF bytes
 * @throws {Error} if deletion fails
 */
export async function deletePagesPdf(pdfFile, pageRange) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  if (!pageRange || pageRange.trim().length === 0) {
    throw new Error('Masukkan nomor halaman yang ingin dihapus!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();
  const pagesToDelete = new Set(parsePageRange(pageRange, totalPages));

  const newPdf = await PDFLib.PDFDocument.create();
  const pagesToKeep = [];

  for (let i = 0; i < totalPages; i++) {
    if (!pagesToDelete.has(i)) pagesToKeep.push(i);
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Tidak bisa menghapus seluruh halaman dokumen!');
  }

  const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Rotate PDF pages
 * @param {File} pdfFile - PDF file
 * @param {number} angle - Rotation angle (90, 180, 270)
 * @returns {Promise<ArrayBuffer>} Rotated PDF bytes
 * @throws {Error} if rotation fails
 */
export async function rotatePdf(pdfFile, angle = 90) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  if (![90, 180, 270].includes(Number(angle))) {
    throw new Error('Sudut rotasi harus 90, 180, atau 270 derajat!');
  }

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

  pdfDoc.getPages().forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(PDFLib.degrees(currentRotation + Number(angle)));
  });

  return await pdfDoc.save();
}

/**
 * Add watermark to PDF
 * @param {File} pdfFile - PDF file
 * @param {string} text - Watermark text
 * @returns {Promise<ArrayBuffer>} Watermarked PDF bytes
 * @throws {Error} if watermarking fails
 */
export async function watermarkPdf(pdfFile, text = 'N PDF DOKUMEN') {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Masukkan teks watermark!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

  pdfDoc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: 36,
      font,
      color: PDFLib.rgb(0.75, 0.75, 0.75),
      rotate: PDFLib.degrees(45),
      opacity: 0.4,
    });
  });

  return await pdfDoc.save();
}

/**
 * Add page numbers to PDF
 * @param {File} pdfFile - PDF file
 * @param {string} position - Position (bottom-right, top-left, etc.)
 * @returns {Promise<ArrayBuffer>} PDF with page numbers
 * @throws {Error} if adding page numbers fails
 */
export async function addPageNumbers(pdfFile, position = 'bottom-right') {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const text = `Halaman ${idx + 1} dari ${pages.length}`;
    let x = width - 120;
    let y = 25;

    if (position === 'bottom-center') {
      x = width / 2 - 40;
      y = 25;
    } else if (position === 'bottom-left') {
      x = 30;
      y = 25;
    } else if (position === 'top-right') {
      x = width - 120;
      y = height - 30;
    } else if (position === 'top-center') {
      x = width / 2 - 40;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: 12,
      font,
      color: PDFLib.rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}

/**
 * Clean metadata from PDF
 * @param {File} pdfFile - PDF file
 * @returns {Promise<ArrayBuffer>} PDF with cleaned metadata
 * @throws {Error} if cleaning fails
 */
export async function cleanMetadata(pdfFile) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('N PDF Studio');
  pdfDoc.setCreator('N PDF Studio');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
}

/**
 * Flatten PDF (convert forms and content to images)
 * @param {File} pdfFile - PDF file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<ArrayBuffer>} Flattened PDF bytes
 * @throws {Error} if flattening fails
 */
export async function flattenPdf(pdfFile, onProgress) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const { jsPDF } = window.jspdf;
  const newPdf = new jsPDF();

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(i, total, `FLATTENING HALAMAN ${i}/${total}`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    const pageWidth = newPdf.internal.pageSize.getWidth();
    const pageHeight = newPdf.internal.pageSize.getHeight();

    if (i > 1) newPdf.addPage();
    newPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  return newPdf.output('arraybuffer');
}

/**
 * Extract images from PDF to ZIP
 * @param {File} pdfFile - PDF file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} ZIP blob with images
 * @throws {Error} if extraction fails
 */
export async function extractImagesToZip(pdfFile, onProgress) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const zip = new JSZip();

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress(i, total, `EKSTRAK GAMBAR HALAMAN ${i}/${total}`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    zip.file(`Gambar_Hal_${i}.png`, base64Data, { base64: true });
  }

  if (onProgress) onProgress(100, 100, 'MEMBUAT BERKAS ZIP...');
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Extract text from PDF
 * @param {File} pdfFile - PDF file
 * @returns {Promise<string>} Extracted text
 * @throws {Error} if extraction fails
 */
export async function convertPdfToTxt(pdfFile) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += `--- HALAMAN ${i} ---\n` + textContent.items.map((item) => item.str).join(' ') + '\n\n';
  }

  return fullText;
}

/**
 * Convert text to PDF
 * @param {string} text - Text content
 * @param {string} paperSize - Paper size
 * @returns {Promise<ArrayBuffer>} PDF bytes
 * @throws {Error} if conversion fails
 */
export async function convertTxtToPdf(text, paperSize = 'a4') {
  if (!text || text.trim().length === 0) {
    throw new Error('Masukkan teks terlebih dahulu!');
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ format: paperSize });
  const splitText = pdf.splitTextToSize(text, 180);
  pdf.text(splitText, 15, 15);

  return pdf.output('arraybuffer');
}

/**
 * Crop margins from PDF
 * @param {File} pdfFile - PDF file
 * @param {number} margin - Margin size in points
 * @returns {Promise<ArrayBuffer>} Cropped PDF bytes
 * @throws {Error} if cropping fails
 */
export async function cropMarginsPdf(pdfFile, margin = 20) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  validateFileSize(pdfFile);

  margin = Number(margin);
  if (isNaN(margin) || margin < 0) {
    throw new Error('Nilai margin tidak valid!');
  }

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

  pdfDoc.getPages().forEach((page) => {
    const { x, y, width, height } = page.getCropBox();
    page.setCropBox(x + margin, y + margin, width - margin * 2, height - margin * 2);
  });

  return await pdfDoc.save();
}
