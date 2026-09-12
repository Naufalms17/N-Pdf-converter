import { validateText } from '../utils/validators.js';
import progressManager from '../ui/progressManager.js';

/**
 * Convert HTML to PDF using html2pdf library
 * @param {string} htmlContent - HTML content
 * @param {string} filename - Output filename
 * @returns {Promise<ArrayBuffer>} PDF bytes
 * @throws {Error} if conversion fails
 */
export async function htmlToPdf(htmlContent, filename = 'FromHtml') {
  validateText(htmlContent, 'HTML content');

  try {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const opt = {
      margin: 1,
      filename: `${filename}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter' },
    };

    const pdfWorker = html2pdf().set(opt).from(element).toPdf();
    const pdfObj = await pdfWorker.output('arraybuffer');

    return pdfObj;
  } catch (error) {
    throw new Error(`Gagal mengkonversi HTML ke PDF: ${error.message}`);
  }
}

/**
 * Translate PDF content using Google Translate API
 * @param {File} pdfFile - PDF file
 * @param {string} targetLang - Target language code
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<ArrayBuffer>} Translated PDF bytes
 * @throws {Error} if translation fails
 */
export async function translatePdfBatch(pdfFile, targetLang = 'en', onProgress) {
  if (!pdfFile) {
    throw new Error('Pilih file PDF!');
  }

  if (!targetLang || targetLang.trim().length === 0) {
    throw new Error('Pilih bahasa tujuan!');
  }

  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = pdf.numPages;
    const { jsPDF } = window.jspdf;
    const newPdf = new jsPDF({ unit: 'pt', format: 'a4' });

    const canvasTemp = document.createElement('canvas');
    const ctxTemp = canvasTemp.getContext('2d');

    for (let pageNum = 1; pageNum <= total; pageNum++) {
      if (onProgress) onProgress(pageNum, total, `MENERJEMAHKAN HALAMAN ${pageNum}/${total}`);

      if (pageNum > 1) newPdf.addPage();

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      const itemsToTranslate = textContent.items
        .map((item) => item.str.trim())
        .filter((str) => str.length > 0);

      if (itemsToTranslate.length === 0) continue;

      const batchString = itemsToTranslate.join(' ||| ');
      let translatedTextArray = itemsToTranslate;

      try {
        const res = await fetch(
          'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
            targetLang +
            '&dt=t&q=' +
            encodeURIComponent(batchString)
        );
        const data = await res.json();
        if (data && data[0] && data[0][0]) {
          const fullTranslatedStr = data[0].map((x) => x[0]).join('');
          translatedTextArray = fullTranslatedStr.split(' ||| ');
        }
      } catch (e) {
        console.warn('Koneksi API Translate Gagal, menggunakan teks asli.');
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

    return newPdf.output('arraybuffer');
  } catch (error) {
    throw new Error(`Gagal menerjemahkan PDF: ${error.message}`);
  }
}
