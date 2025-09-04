import Elysia, { t } from 'elysia';
import * as PdfSchema from './pdf.schema';
import { generateAndSavePDFV2 } from './pdf.service';


export const pdfRoutes = new Elysia({
  prefix: '/pdf',
  tags: ['PDF'],
})
  .post(
    '/generate',
    async ({ body }) => {
      // console.log('template', body.template);
      try {
        const result = await generateAndSavePDFV2(body.template, body.inputs);
        return result;
      } catch (error) {
        console.log("Failed to generate and save PDF file: ", error)
        return {
          success: false,
          message: "Failed to generate and save PDF file",
          error
        }
      }
    },
    {
      body: t.Object({
        template: PdfSchema.TemplateSchema,
        inputs: PdfSchema.InputSchema,
      }),
      response: {
        201: t.Object({
          success: t.Boolean(),
          filename: t.String(),
          filePath: t.Optional(t.String()),
          base64Content: t.Optional(t.String()),
          size: t.Optional(t.Number())
        }),
        500: t.Object({
          message: t.String()
        })
      }
    }
  );
