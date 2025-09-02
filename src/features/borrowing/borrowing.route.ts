/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import Elysia, { t } from 'elysia';
import { jsonify, StringRecordId } from 'surrealdb';
// import { v7 as uuidv7 } from 'uuid';
import { getDb } from '../../lib/database';
import { BorrowingModel } from './borrowing.schema';

export const borrowingRoutes = new Elysia({
  prefix: '/borrowing',
  tags: ['Borrowing'],
})
  .get(
    '/',
    async () => {
      const db = await getDb();
      try {
        const borrowingAll =
          await db.select<BorrowingModel.BorrowingSchema>('Borrowing');
        return borrowingAll;
      } catch (error) {
        console.log('fail to get all: ', error);
        return { message: 'Failed to get all' };
      }
    },
    {
      response: {
        200: t.Array(BorrowingModel.BorrowingSchema),
        500: t.Object({
          message: t.String(),
        }),
      },
    }
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      const db = await getDb();
      console.log('param: ', typeof params.id);
      try {
        const response = await db.select<BorrowingModel.BorrowingSchema>(
          new StringRecordId(params.id)
        );
        if (!response) {
          set.status = 404;
          return { message: 'Not found' };
        }
        return response;
      } catch (error) {
        console.log('fail to get by id: ', error);
        return { message: 'Failed to get all' };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: BorrowingModel.BorrowingSchema,
        400: t.Object({
          message: t.Literal('Not found'),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
    }
  )
  .post(
    '/',
    async ({ body }) => {
      const db = await getDb();

      const inputDate = {
        // id: uuidv7(),
        name: body.name,
        tel: body.tel,
        car: body.car,
        pdfUrl: body.pdfUrl,
        approve: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const borrowing = await db.create<BorrowingModel.UpdateBorrowingSchema>(
          'Borrowing',
          inputDate
        );
        return jsonify(borrowing);
      } catch (error) {
        console.error('Failed to create : ', error);
        return { message: 'Failed to create' };
      }
    },
    {
      body: BorrowingModel.UpdateBorrowingSchema,
      response: {
        201: BorrowingModel.BorrowingSchema,
      },
    }
  )
  .put(
    '/:id',
    async ({ params, body, set }) => {
      const db = await getDb();
      try {
        const prevData = await db.select<BorrowingModel.BorrowingSchema>(
          new StringRecordId(params.id)
        );

        if (!prevData) {
          set.status = 404;
          return { message: 'Not found' };
        }

        const inputData = {
          id: prevData.id,
          name: body.name,
          tel: body.tel,
          car: body.car,
          approve: body.approve,
          pdfUrl: body.pdfUrl,
          createdAt: prevData.createdAt || new Date(),
          updatedAt: new Date(),
        };
        const response = await db.update<BorrowingModel.BorrowingSchema>(
          new StringRecordId(params.id),
          inputData
        );
        return response;
      } catch (error) {
        console.log('Failed to update: ', error);
        return { message: 'Failed to update' };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: BorrowingModel.UpdateBorrowingSchema,
      response: {
        200: BorrowingModel.BorrowingSchema,
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
    }
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const db = await getDb();
      try {
        const response = await db.delete<BorrowingModel.BorrowingSchema>(
          new StringRecordId(params.id)
        );
        return response;
      } catch (error) {
        console.log('Failed to delete: ', error);
        return { message: 'Failed to update' };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: BorrowingModel.BorrowingSchema,
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
    }
  );
