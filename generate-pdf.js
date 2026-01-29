const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Set viewport to presentation size
  await page.setViewport({ width: 1920, height: 1080 });

  const htmlPath = path.resolve(__dirname, 'index.html');
  console.log('Loading presentation from:', htmlPath);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Get total number of slides
  const totalSlides = await page.evaluate(() => {
    return document.querySelectorAll('.slide').length;
  });
  console.log(`Found ${totalSlides} slides`);

  // Modify CSS to show all slides for PDF export
  await page.evaluate(() => {
    // Add print-friendly styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body { overflow: visible !important; height: auto !important; }
        .presentation { height: auto !important; overflow: visible !important; }
        .slide {
          position: relative !important;
          display: flex !important;
          opacity: 1 !important;
          page-break-after: always;
          page-break-inside: avoid;
          height: 100vh !important;
          width: 100vw !important;
        }
        .nav-controls { display: none !important; }
      }

      /* Also apply for PDF generation */
      body { overflow: visible !important; height: auto !important; }
      .presentation { height: auto !important; overflow: visible !important; }
      .slide {
        position: relative !important;
        display: flex !important;
        opacity: 1 !important;
        page-break-after: always;
        page-break-inside: avoid;
        min-height: 100vh !important;
        width: 100% !important;
      }
      .nav-controls { display: none !important; }
    `;
    document.head.appendChild(style);
  });

  // Wait a moment for styles to apply
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate PDF
  const outputPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop', 'CMG-AI-Agent-Opportunities-2026.pdf');
  console.log('Generating PDF to:', outputPath);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('PDF generated successfully!');
  console.log('Output:', outputPath);

  await browser.close();
})();
