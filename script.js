const toast = document.getElementById('toast');
const doc = document.getElementById('agreementDocument');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.getElementById('saveBtn').addEventListener('click', () => {
  showToast('Agreement saved as a draft.');
});

document.getElementById('signBtn').addEventListener('click', () => {
  showToast('Signing flow is ready for the final agreement stage.');
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  const ok = window.confirm('Cancel this agreement draft?');
  if (ok) showToast('Agreement marked for cancellation.');
});

document.getElementById('clientViewBtn').addEventListener('click', (event) => {
  document.body.classList.toggle('client-mode');
  const active = document.body.classList.contains('client-mode');
  event.currentTarget.textContent = active ? 'Developer View' : 'Client View';
  showToast(active ? 'Client preview enabled.' : 'Developer preview enabled.');
});

document.getElementById('downloadPdf').addEventListener('click', async () => {
  const button = document.getElementById('downloadPdf');
  const old = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Preparing PDF…';

  try {
    if (!window.html2canvas || !window.jspdf) throw new Error('PDF libraries did not load');
    const canvas = await window.html2canvas(doc, {
      scale: 2,
      backgroundColor: '#fcfcfa',
      useCORS: true,
      logging: false
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    let heightLeft = imgHeight;
    let position = margin;
    pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft) + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save('RDS-2026-001-Project-Agreement.pdf');
    showToast('PDF downloaded successfully.');
  } catch (error) {
    console.error(error);
    showToast('PDF could not be generated. Please try again.');
  } finally {
    button.disabled = false;
    button.innerHTML = old;
  }
});
