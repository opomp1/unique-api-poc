import { t } from 'elysia';

export const TemplateSchema = t.Object({
  schemas: t.Array(t.Array(t.Record(t.String(), t.Any()))),
  basePdf: t.Object({
    width: t.Number(),
    height: t.Number(),
    padding: t.Optional(t.Array(t.Number())),
  }),
  pdfmeVersion: t.Optional(t.String()),
});
export type TemplateSchema = typeof TemplateSchema.static;

export const InputSchema = t.Record(t.String(), t.Any());
export type InputSchema = typeof InputSchema;
