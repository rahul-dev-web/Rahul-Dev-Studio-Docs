const toast = document.getElementById('toast');
const doc = document.getElementById('document');
const downloadButton = document.getElementById('downloadPdf');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function buildTableOfContents() {
  if (!doc || doc.querySelector('.doc-toc')) return;
  const sections = [...doc.querySelectorAll('.doc-section')];
  if (!sections.length) return;

  sections.forEach((section, index) => {
    section.id = section.id || `section-${index + 1}`;
  });

  const toc = document.createElement('section');
  toc.className = 'doc-toc';
  toc.setAttribute('aria-label', 'Table of contents');
  toc.innerHTML = `
    <div class="doc-toc-title">
      <h3>Contents</h3>
      <span>17 sections</span>
    </div>
    <div class="doc-toc-grid">
      ${sections.map((section, index) => {
        const title = section.querySelector('h3')?.textContent?.trim() || `Section ${index + 1}`;
        const number = String(index + 1).padStart(2, '0');
        return `<a href="#${section.id}"><span><span class="toc-num">${number}</span>${title}</span><span>→</span></a>`;
      }).join('')}
    </div>`;

  const firstSection = sections[0];
  doc.insertBefore(toc, firstSection);
}

buildTableOfContents();

if (downloadButton) {
  downloadButton.addEventListener('click', async () => {
    const old = downloadButton.innerHTML;
    downloadButton.disabled = true;
    downloadButton.innerHTML = 'Preparing PDF…';

    try {
      if (!window.html2canvas || !window.jspdf) throw new Error('PDF libraries did not load');

      const canvas = await window.html2canvas(doc, {
        scale: Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5)),
        backgroundColor: '#fffdf8',
        useCORS: true,
        logging: false,
        imageTimeout: 10000
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 10;
      const topMargin = 14;
      const bottomMargin = 14;
      const usableWidth = pageWidth - marginX * 2;
      const usableHeight = pageHeight - topMargin - bottomMargin;
      const renderedHeight = (canvas.height * usableWidth) / canvas.width;
      const pixelsPerMm = canvas.width / usableWidth;
      const pageSlicePx = usableHeight * pixelsPerMm;
      const pageCount = Math.ceil(canvas.height / pageSlicePx);
      const imageData = canvas.toDataURL('image/jpeg', 0.96);

      for (let page = 0; page < pageCount; page++) {
        if (page > 0) pdf.addPage();
        const sourceY = page * pageSlicePx;
        const sliceHeightPx = Math.min(pageSlicePx, canvas.height - sourceY);
        const sliceHeightMm = sliceHeightPx / pixelsPerMm;

        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = Math.ceil(sliceHeightPx);
        const ctx = slice.getContext('2d');
        ctx.fillStyle = '#fffdf8';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

        pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', marginX, topMargin, usableWidth, sliceHeightMm);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(125, 127, 119);
        pdf.text('Rahul Development Studio • Client Guide & Service Policy', marginX, pageHeight - 6);
        pdf.text(`Page ${page + 1} of ${pageCount}`, pageWidth - marginX, pageHeight - 6, { align: 'right' });
      }

      pdf.save('Rahul-Development-Studio-Client-Guide-Service-Policy.pdf');
      showToast('PDF downloaded successfully.');
    } catch (error) {
      console.error(error);
      showToast('PDF could not be generated. Please try again.');
    } finally {
      downloadButton.disabled = false;
      downloadButton.innerHTML = old;
    }
  });
}
