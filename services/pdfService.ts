// Declare global types for the CDN libraries
declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

export const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await window.html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images
      logging: false,
      windowWidth: 1123, // A4 Landscape width in pixels (approx) at 96dpi
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 Landscape dimensions in mm
    const pdfWidth = 297;
    const pdfHeight = 210;
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfRatio = pdfWidth / pdfHeight;
    const imgRatio = imgProps.width / imgProps.height;
    
    // Fit image to page
    let finalWidth = pdfWidth;
    let finalHeight = pdfHeight;
    
    if (imgRatio > pdfRatio) {
        finalHeight = pdfWidth / imgRatio;
    } else {
        finalWidth = pdfHeight * imgRatio;
    }

    pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
    
    // If we had multi-page logic via scrolling, we'd handle it here, 
    // but the current implementation renders separate pages in the DOM 
    // which we would capture sequentially. 
    // For MVP, we assume the preview shows all pages vertically and we capture distinct elements.
    // However, html2canvas on a long scroll view works well if we slice it.
    
    // A simpler approach for multi-page in this specific DOM structure:
    // We will target a container that holds .sop-page elements.
    const pages = document.querySelectorAll('.sop-page-export');
    
    if (pages.length > 0) {
        const multiPdf = new jsPDF('l', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
             if (i > 0) multiPdf.addPage();
             
             const pageCanvas = await window.html2canvas(pages[i] as HTMLElement, {
                scale: 2,
                useCORS: true
             });
             const pageImg = pageCanvas.toDataURL('image/jpeg', 1.0);
             multiPdf.addImage(pageImg, 'JPEG', 0, 0, 297, 210);
        }
        multiPdf.save(`${filename}.pdf`);
    } else {
        // Fallback for single view
        pdf.save(`${filename}.pdf`);
    }

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please ensure all images are loaded.");
  }
};
