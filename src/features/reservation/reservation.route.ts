/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
/** biome-ignore-all lint/performance/noNamespaceImport: <explanation> */

import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import Elysia, { t } from 'elysia';
import { getDynamoDb } from '../../lib/dynamodb';
import { TABLE_NAMES } from '../../lib/setup-tables';
import * as ReservationSchema from './reservation.schema';

export const reservationRoutes = new Elysia({
  prefix: '/reservation',
  tags: ['Reservation'],
})
  .get(
    '/',
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
    async ({ query }) => {
      const db = getDynamoDb();
      try {
        let reservation: any[];

        const hasFilter =
          query.requesterId ||
          query.approve !== undefined ||
          query.isSelfDrive !== undefined;

        if (hasFilter) {
          if (query.requesterId) {
            const result = await db.send(
              new QueryCommand({
                TableName: TABLE_NAMES.RESERVATION,
                IndexName: 'requesterId-index',
                KeyConditionExpression: 'requesterId = :requesterId',
                ExpressionAttributeValues: {
                  ':requesterId': query.requesterId,
                },
              })
            );
            reservation = result.Items || [];
          } else {
            const result = await db.send(
              new ScanCommand({
                TableName: TABLE_NAMES.RESERVATION,
              })
            );
            reservation = result.Items || [];
          }

          if (query.approve !== undefined) {
            reservation = reservation.filter(
              (r) => r.approve === query.approve
            );
          }

          if (query.isSelfDrive !== undefined) {
            reservation = reservation.filter(
              (r) => r.isSelfDrive === query.isSelfDrive
            );
          }

          reservation.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          const result = await db.send(
            new ScanCommand({
              TableName: TABLE_NAMES.RESERVATION,
            })
          );
          reservation = result.Items || [];
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
      const db = getDynamoDb();
      try {
        const result = await db.send(
          new GetCommand({
            TableName: TABLE_NAMES.RESERVATION,
            Key: { id: params.id },
          })
        );
        if (!result.Item) {
          set.status = 404;
          return { message: 'Reservation Not found' };
        }
        return result.Item;
      } catch (error) {
        console.log('Fail to get by id: ', error);
        return { message: 'Failed to get by id', error };
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
  .get(
    'by-line-id/:lineUserId',
    async ({ params, set }) => {
      const db = getDynamoDb();
      try {
        const result = await db.send(
          new QueryCommand({
            TableName: TABLE_NAMES.RESERVATION,
            IndexName: 'lineUserId-index',
            KeyConditionExpression: 'lineUserId = :lineUserId',
            ExpressionAttributeValues: {
              ':lineUserId': params.lineUserId,
            },
            Limit: 1,
            ScanIndexForward: false,
          })
        );
        if (!result.Items || result.Items.length === 0) {
          set.status = 404;
          return { message: 'Reservation not found' };
        }

        return result.Items[0];
      } catch (error) {
        console.log('Fail to get reservation by Line id: ', error);
        return { message: 'Failed to get resservation by Line id', error };
      }
    },
    {
      params: t.Object({
        lineUserId: t.String(),
      }),
      response: {
        200: ReservationSchema.ReservationSchema,
        400: t.Object({
          message: t.String(),
        }),
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Get latest reservation by Line ID',
      },
      tags: ['By Line ID'],
    }
  )
  .post(
    '/:employeeId',
    async ({ body, params, set }) => {
      const db = getDynamoDb();

      const requesterId = params.employeeId;

      try {
        console.log('start');
        const requesterUser = await db.send(
          new GetCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
            Key: { id: requesterId },
          })
        );
        console.log('requesterUser', requesterUser.Item);
        if (!requesterUser.Item) {
          set.status = 404;
          return { message: 'Requester employee not found.' };
        }
        console.log('Received body:', JSON.stringify(body, null, 2));

        const inputData = {
          ...body,
          id: crypto.randomUUID(),
          requesterId: params.employeeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log(
          'inputData before DynamoDB:',
          JSON.stringify(inputData, null, 2)
        );

        await db.send(
          new PutCommand({
            TableName: TABLE_NAMES.RESERVATION,
            Item: inputData,
          })
        );
        return inputData;
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
      const db = getDynamoDb();
      try {
        const getResult = await db.send(
          new GetCommand({
            TableName: TABLE_NAMES.RESERVATION,
            Key: { id: params.id },
          })
        );

        if (!getResult.Item) {
          set.status = 404;
          return { message: 'Reservation not found' };
        }

        const prevReservation = getResult.Item;
        console.log('Previous reservation:', prevReservation);
        const inputData: ReservationSchema.ReservationSchema = {
          id: prevReservation.id,
          requesterId: prevReservation.requesterId,
          lineUserId: body.lineUserId ?? prevReservation.lineUserId,
          projectName: body.projectName,
          purpose: body.purpose ?? prevReservation.purpose,
          passengerAmount:
            body.passengerAmount ?? prevReservation.passengerAmount,
          notes: body.notes ?? prevReservation.notes,
          notesFromOfficer:
            body.notesFromOfficer ?? prevReservation.notesFromOfficer,
          startDate: body.startDate ?? prevReservation.startDate,
          endDate: body.endDate ?? prevReservation.endDate,
          passenger: body.passenger ?? prevReservation.passenger,
          approve: body.approve ?? prevReservation.approve,
          pdfUrl: body.pdfUrl ?? prevReservation.pdfUrl,
          car: body.car ?? prevReservation.car,
          numberPlate: body.numberPlate ?? prevReservation.numberPlate,

          isSelfDrive: body.isSelfDrive ?? prevReservation.isSelfDrive,
          driverName: body.driverName ?? prevReservation.driverName,
          driverEmployeeId:
            body.driverEmployeeId ?? prevReservation.driverEmployeeId,
          driverTel: body.driverTel ?? prevReservation.driverTel,

          createdAt: prevReservation.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('inputData before DynamoDB:', inputData);

        const data = await db.send(
          new PutCommand({
            TableName: TABLE_NAMES.RESERVATION,
            Item: inputData,
          })
        );
        console.log('Update result: ', data);

        return inputData;
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
      const db = getDynamoDb();
      try {
        const getResult = await db.send(
          new GetCommand({
            TableName: TABLE_NAMES.RESERVATION,
            Key: { id: params.id },
          })
        );

        if (!getResult.Item) {
          set.status = 404;
          return { message: 'Reservation not found' };
        }

        await db.send(
          new DeleteCommand({
            TableName: TABLE_NAMES.RESERVATION,
            Key: { id: params.id },
          })
        );

        return { success: true };
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
        200: t.Object({
          success: t.Boolean(),
        }),
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
