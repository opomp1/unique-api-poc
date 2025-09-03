import { BLANK_A4_PDF, type Template } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { barcodes, image, multiVariableText, text } from '@pdfme/schemas';
import fs from 'fs';
import path from 'path';

// Define the template
const template: Template = {
  basePdf: BLANK_A4_PDF,
  schemas: [
    [
      {
        name: 'example_text',
        type: 'text',
        position: { x: 20, y: 20 },
        width: 100,
        height: 15,
        fontSize: 16,
        fontColor: '#000000',
      },
      {
        name: 'example_image',
        type: 'image',
        position: { x: 20, y: 50 },
        width: 60,
        height: 40,
      },
      {
        name: 'example_qr_code',
        type: 'qrcode',
        position: { x: 20, y: 110 },
        width: 50,
        height: 50,
      },
    ],
  ],
};

// Define plugins - these need to be passed to the generate function
const plugins = {
  text,
  multiVariableText,
  qrcode: barcodes.qrcode,
  image,
};

// Input data for the PDF
const inputs = [
  {
    example_text: 'Hello, World! This is a generated PDF.',
    example_image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    example_qr_code: 'https://pdfme.com/',
  },
];

// Generate PDF with error handling
async function generateAndSavePDF() {
  try {
    console.log('Starting PDF generation...');

    const pdf = await generate({
      template,
      inputs,
      plugins,
    });

    console.log('PDF generated successfully');

    // For Node.js environment - save to file system
    if (typeof window === 'undefined') {
      // We're in Node.js
      const outputPath = path.join(process.cwd(), 'generated-document.pdf');
      fs.writeFileSync(outputPath, pdf);
      console.log(`PDF saved to: ${outputPath}`);
    } else {
      // We're in browser - trigger download
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('PDF download initiated');
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Alternative function for browser environment with custom filename
async function generateAndDownloadPDF(filename = 'document.pdf') {
  try {
    const pdf = await generate({
      template,
      inputs,
      plugins,
    });

    // Create download link
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`PDF "${filename}" downloaded successfully`);
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Alternative function for Node.js with custom path
async function generateAndSavePDFToPath(outputPath: string) {
  try {
    const pdf = await generate({
      template,
      inputs,
      plugins,
    });

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdf);
    console.log(`PDF saved to: ${outputPath}`);
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Function to generate PDF and return as base64 string
async function generatePDFAsBase64() {
  try {
    const pdf = await generate({
      template,
      inputs,
      plugins,
    });

    const base64 = Buffer.from(pdf).toString('base64');
    console.log('PDF generated as base64 string');
    return base64;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Export functions for different use cases
export {
  generateAndSavePDF,
  generateAndDownloadPDF,
  generateAndSavePDFToPath,
  generatePDFAsBase64,
  template,
  plugins,
  inputs,
};

// Usage examples:
// 1. Basic generation and save/download
generateAndSavePDF();

// 2. Browser download with custom filename
// generateAndDownloadPDF('my-custom-document.pdf');

// 3. Node.js save to specific path
// generateAndSavePDFToPath('./output/reports/monthly-report.pdf');

// 4. Generate as base64 for API responses
// const base64PDF = await generatePDFAsBase64();