/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
/** biome-ignore-all lint/performance/noNamespaceImport: <explanation> */
import Elysia, { t } from 'elysia';
import { StringRecordId } from 'surrealdb';
import { getDb } from '../../lib/database';
import * as ReservationSchema from './reservation.schema';

export const reservationRoutes = new Elysia({
  prefix: '/reservation',
  tags: ['Reservation'],
})
  .get(
    '/',
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
    async ({ query }) => {
      const db = await getDb();
      try {
        let reservation: ReservationSchema.ReservationSReservationArraySchema;

        const hasFilter =
          query.requesterId ||
          query.approve !== undefined ||
          query.isSelfDrive !== undefined;
        if (hasFilter) {
          let queryString = 'SELECT * FROM Reservation WHERE 1=1';
          const queryParams: Record<string, string | boolean | undefined> = {};

          if (query.requesterId) {
            queryString += ' AND requesterId = $requesterId';
            queryParams.requesterId = query.requesterId;
          }

          if (query.approve !== undefined) {
            queryString += ' AND approve = $approve';
            queryParams.approve = query.approve;
          }

          if (query.isSelfDrive !== undefined) {
            queryString += ' AND isSelfDrive = $isSelfDrive';
            queryParams.isSelfDrive = query.isSelfDrive;
          }

          queryString += ' ORDER BY createdAt DESC';

          const result = await db.query<
            [ReservationSchema.ReservationSReservationArraySchema]
          >(queryString, queryParams);
          reservation = result[0] || [];
        } else {
          reservation =
            await db.select<ReservationSchema.ReservationSchema>('Reservation');
        }
        const totalItems = reservation.length;
        return {
          totalItems,
          data: reservation,
        };
      } catch (error) {
        console.error('Failed to get reservations: ', error);
        return {
          message: 'Failed to get reservations',
          error,
        };
      }
    },
    {
      query: t.Object({
        requesterId: t.Optional(t.String()),
        approve: t.Optional(t.Boolean()),
        isSelfDrive: t.Optional(t.Boolean()),
      }),
      response: {
        200: t.Object({
          totalItems: t.Number(),
          data: ReservationSchema.ReservationArraySchema,
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Get reservations with filters',
        description:
          'Get reservations with filter by id, approve and isSelfDrive',
      },
    }
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      const db = await getDb();
      try {
        const response = await db.select<ReservationSchema.ReservationSchema>(
          new StringRecordId(params.id)
        );
        if (!response) {
          set.status = 404;
          return { message: 'Reservation Not found' };
        }
        return response;
      } catch (error) {
        console.log('Fail to get by id: ', error);
        return { message: 'Failed to get all', error };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: ReservationSchema.ReservationSchema,
        404: t.Object({
          message: t.Literal('Reservation Not found'),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Get reservations by ID',
      },
    }
  )
  .post(
    '/:employeeId',
    async ({ body, params, set }) => {
      const db = await getDb();

      const requesterId = params.employeeId;

      try {
        console.log('start');
        const requesterUser = await db.select(new StringRecordId(requesterId));
        console.log('requesterUser', requesterUser);
        if (!requesterUser) {
          set.status = 404;
          return { message: 'Requester employee not found.' };
        }

        const inputDate = {
          requesterId: params.employeeId,

          lineUserId: body.lineUserId,
          projectName: body.projectName,
          purpose: body.purpose,
          passengerAmount: body.passengerAmount,
          notes: body.notes,
          startDate: body.startDate,
          endDate: body.endDate,
          passenger: body.passenger ?? null,
          approve: body.approve ?? null,
          pdfUrl: body.pdfUrl ?? null,
          car: body.car ?? null,

          isSelfDrive: body.isSelfDrive,
          driverName: body.driverName,
          driverEmployeeId: body.driverEmployeeId,
          driverTel: body.driverTel,

          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const employee =
          await db.create<ReservationSchema.CreateReservationSchema>(
            'Reservation',
            inputDate
          );
        return employee;
      } catch (error) {
        console.error('Failed to create : ', error);
        return { message: 'Failed to create', error };
      }
    },
    {
      body: ReservationSchema.CreateReservationSchema,
      params: t.Object({
        employeeId: t.String(),
      }),
      response: {
        201: ReservationSchema.ReservationSchema,
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Create reservation',
      },
    }
  )
  .put(
    '/:id',
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: It said it's too long
    async ({ body, params, set }) => {
      const db = await getDb();
      try {
        const prevReservation =
          await db.select<ReservationSchema.ReservationSchema>(
            new StringRecordId(params.id)
          );

        if (!prevReservation) {
          set.status = 404;
          return { message: 'Reservation not found' };
        }
        const inputDate = {
          id: prevReservation.id,
          requesterId: prevReservation.requesterId,
          lineUserId: body.lineUserId ?? prevReservation.lineUserId,
          projectName: body.projectName ?? prevReservation.projectName,
          purpose: body.purpose ?? prevReservation.purpose,
          passengerAmount:
            body.passengerAmount ?? prevReservation.passengerAmount,
          notes: body.notes ?? prevReservation.notes,
          startDate: body.startDate ?? prevReservation.startDate,
          endDate: body.endDate ?? prevReservation.endDate,
          passenger: body.passenger ?? prevReservation.passenger,
          approve: body.approve ?? prevReservation.approve,
          pdfUrl: body.pdfUrl ?? prevReservation.pdfUrl,
          car: body.car ?? prevReservation.car,

          isSelfDrive: body.isSelfDrive ?? prevReservation.isSelfDrive,
          driverName: body.driverName ?? prevReservation.driverName,
          driverEmployeeId:
            body.driverEmployeeId ?? prevReservation.driverEmployeeId,
          driverTel: body.driverTel ?? prevReservation.driverTel,

          createdAt: prevReservation.createdAt ?? new Date(),
          updatedAt: new Date(),
        };

        const updatedReservation =
          await db.update<ReservationSchema.ReservationSchema>(
            new StringRecordId(params.id),
            inputDate
          );

        return updatedReservation;
      } catch (error) {
        console.error('Failed to update : ', error);
        return { message: 'Failed to update', error };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: ReservationSchema.CreateReservationSchema,
      response: {
        200: ReservationSchema.ReservationSchema,
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Update reservation',
      },
    }
  )
  .delete(
    '/:id',
    async ({ params, set }) => {
      const db = await getDb();
      try {
        const reservation =
          await db.delete<ReservationSchema.ReservationSchema>(
            new StringRecordId(params.id)
          );
        if (!reservation) {
          set.status = 404;
          return { message: 'Reservation not found' };
        }
        return reservation;
      } catch (error) {
        console.error('Failed to delete : ', error);
        return { message: 'Failed to delete', error };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: ReservationSchema.ReservationSchema,
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Delete reservation',
      },
    }
  );
