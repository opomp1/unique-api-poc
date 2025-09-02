/** biome-ignore-all lint/style/noNamespace: <explanation> */
import { t } from 'elysia';

export type Borrowing = {
  id: string;
  name: string;
  tel: string;
  car: string;
  approve: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

// export const BorrowingSchema = t.Object({
//   id: t.String(),
//   name: t.String(),
//   tel: t.String(),
//   car: t.String(),
//   approve: t.Union([t.Boolean(), t.Null()]),
//   createdAt: t.Date(),
//   updatedAt: t.Date(),
// });

export namespace BorrowingModel {
  export const BorrowingSchema = t.Object({
    id: t.Unknown(),
    name: t.String(),
    tel: t.String(),
    car: t.String(),
    approve: t.Union([t.Boolean(), t.Null()]),
    pdfUrl: t.Union([t.String(), t.Null()]),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  });

  export type BorrowingSchema = typeof BorrowingSchema.static;

  export const CreateBodySchema = t.Omit(BorrowingSchema, ['id']);
  export type CreateBodySchema = typeof CreateBodySchema.static;

  export const UpdateBorrowingSchema = t.Omit(BorrowingSchema, [
    'id',
    'createdAt',
    'updatedAt',
  ]);

  export type UpdateBorrowingSchema = typeof UpdateBorrowingSchema.static;
}

// export const BorrowingSchemaType = typeof BorrowingSchema;

// export const createBorrowingSchema = t.Omit(BorrowingSchema, ['id']);