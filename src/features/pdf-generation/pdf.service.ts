import type { Template } from '@pdfme/common';
import { BLANK_A4_PDF, type Font } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { barcodes, checkbox, image, multiVariableText, text } from '@pdfme/schemas';
import type { InputSchema } from 'elysia';
import { readFileSync } from 'fs';

import { join } from 'path';

const font: Font = {
  sarabun: {
    data: readFileSync('./src/font/Sarabun/Sarabun-Regular.ttf'),
    fallback: true,
  },
};
export async function generateAndSavePDFV2(
  template: any,
  inputs: InputSchema
): Promise<{
  success: boolean;
  filename?: string;
  filePath?: string;
  base64Content?: string;
  size?: number;
  error?: unknown;
}> {
  try {

    const uploadsDir = './uploads/pdfs';

    const plugins = {
      Text: text,
      MultiVariableText: multiVariableText,
      'QR Code': barcodes.qrcode,
      Image: image,
      Checkbox: checkbox
    };

    // Convert inputs to strings (PDFme does not except number and maybe more...)
    const processedInputs = Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [
        key,
        value === null || value === undefined ? '' : String(value),
        console.log(typeof value)
      ])
    );

    // Use the template directly as PDFme JSON format
    const pdf = await generate({
      template,
      inputs: [processedInputs],
      plugins,
      options: { font },
    });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomString = Math.random().toString(36).substring(2, 10)
    const filename = `generated-${timestamp}-${randomString}.pdf`;
    const filePath = join(uploadsDir, filename);

    // Save file
    await Bun.write(filePath, pdf);

    // Convert to base64 if needed
    // const base64Content = Buffer.from(pdf).toString('base64');

    return {
      success: true,
      filename,
      filePath,
      // base64Content,
      // size: pdf.length,
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error ? error : 'Unknown error',
    };
  }
}
