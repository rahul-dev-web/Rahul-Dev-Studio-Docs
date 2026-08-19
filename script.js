const toast = document.getElementById('toast');
const doc = document.getElementById('document');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.getElementById('downloadPdf').addEventListener('click', async () => {
  const button = document.getElementById('downloadPdf');
  const old = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Preparing PDF…';

  try {
    if (!window.html2canvas || !window.jspdf) throw new Error('PDF libraries did not load');

    const canvas = await window.html2canvas(doc, {
      scale: 2,
      backgroundColor: '#fffdf8',
      useCORS: true,
      logging: false
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const usableWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * usableWidth) / canvas.width;
    const imageData = canvas.toDataURL('image/jpeg', 0.97);

    let remaining = imageHeight;
    let position = margin;
    pdf.addImage(imageData, 'JPEG', margin, position, usableWidth, imageHeight);
    remaining -= pageHeight - margin * 2;

    while (remaining > 0) {
      position = -(imageHeight - remaining) + margin;
      pdf.addPage();
      pdf.addImage(imageData, 'JPEG', margin, position, usableWidth, imageHeight);
      remaining -= pageHeight - margin * 2;
    }

    pdf.save('Rahul-Development-Studio-Client-Guide-Service-Policy.pdf');
    showToast('PDF downloaded successfully.');
  } catch (error) {
    console.error(error);
    showToast('PDF could not be generated. Please try again.');
  } finally {
    button.disabled = false;
    button.innerHTML = old;
  }
});
