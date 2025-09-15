/** biome-ignore-all lint/suspicious/noConsole: <explanation> */

import { readFileSync } from 'node:fs';
import type { Font } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import {
  barcodes,
  checkbox,
  image,
  multiVariableText,
  table,
  text,
} from '@pdfme/schemas';
import type { InputSchema } from 'elysia';
import { uploadPdf } from '../../providers/minio/minio.provider';

const font: Font = {
  Sarabun: {
    data: readFileSync('./src/font/Sarabun/Sarabun-Regular.ttf'),
    fallback: true,
  },
};

export async function generateAndSavePDFV2(
  // biome-ignore lint/suspicious/noExplicitAny: Type any for POC for now.
  template: any,
  inputs: InputSchema
): Promise<{
  success: boolean;
  filename?: string;
  url?: string;
  base64Content?: string;
  size?: number;
  error?: unknown;
}> {
  try {
    const plugins = {
      Text: text,
      MultiVariableText: multiVariableText,
      'QR Code': barcodes.qrcode,
      Image: image,
      Checkbox: checkbox,
      Table: table,
    };

    // Convert inputs to strings (PDFme does not except number and maybe more...)
    const processedInputs = Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [
        key,
        value === null || value === undefined ? '' : String(value),
      ])
    );

    const pdf = await generate({
      template,
      inputs: [processedInputs],
      plugins,
      options: { font },
    });

    const uploadResult = await uploadPdf(Buffer.from(pdf));

    return {
      success: true,
      filename: uploadResult.filename,
      url: uploadResult.fileFullPath,
      size: uploadResult.size,
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error ? error : 'Unknown error',
    };
  }
}
