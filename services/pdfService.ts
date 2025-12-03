
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
    // Ensure top scroll to prevent offset issues
    window.scrollTo(0, 0);

    // CRITICAL: Wait for fonts to be fully loaded
    await document.fonts.ready;

    // CRITICAL: Wait for all images within the element to be fully loaded
    const images = Array.from(element.querySelectorAll('img'));
    const imagePromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to avoid hanging
      });
    });
    await Promise.all(imagePromises);

    // Small additional safety delay for layout stabilization
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await window.html2canvas(element, {
      scale: 3, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images
      logging: false,
      windowWidth: 1123, // A4 Landscape width in pixels (approx) at 96dpi
      letterRendering: true, // Helps with text kerning and clipping
      allowTaint: true,
      backgroundColor: '#ffffff', // Ensure white background
      scrollY: 0, // Force scroll to top for capture
      scrollX: 0,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
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

    // Centering vertically if aspect ratio differs slightly
    const yOffset = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight);
    
    // Multi-page logic
    const pages = document.querySelectorAll('.sop-page-export');
    
    if (pages.length > 0) {
        const multiPdf = new jsPDF('l', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
             if (i > 0) multiPdf.addPage();
             
             // Capture individual pages with same settings
             const pageCanvas = await window.html2canvas(pages[i] as HTMLElement, {
                scale: 3,
                useCORS: true,
                letterRendering: true,
                allowTaint: true,
                scrollY: 0,
                scrollX: 0,
             });
             const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95); // 0.95 quality is sufficient and smaller
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
