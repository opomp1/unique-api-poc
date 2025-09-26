/** biome-ignore-all lint/performance/noNamespaceImport: <explanation> */
/** biome-ignore-all lint/suspicious/noConsole: <explanation> */

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
import * as EmployeeSchema from './employee.schema';

export const employeeRoutes = new Elysia({
  prefix: '/employee',
  tags: ['Employee'],
})
  .get(
    '/',
    async () => {
      const db = getDynamoDb();
      try {
        const result = await db.send(
          new ScanCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
          })
        );
        return result.Items || [];
      } catch (error) {
        console.log('fail to get all: ', error);
        return { message: 'Failed to get all' };
      }
    },
    {
      response: {
        200: t.Array(EmployeeSchema.EmployeeSchema),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        summary: 'Get all employees',
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
            TableName: TABLE_NAMES.EMPLOYEE,
            Key: { id: params.id },
          })
        );
        if (!result.Item) {
          set.status = 404;
          return { message: 'Employee Not found' };
        }
        return result.Item;
      } catch (error) {
        console.log('Fail to get by ID: ', error);
        return { message: 'Failed to get by ID' };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: EmployeeSchema.EmployeeSchema,
        404: t.Object({
          message: t.Literal('Employee Not found'),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        summary: 'Get employee by ID',
      },
    }
  )
  .get(
    '/by-line-id/:lineUserId',
    async ({ params, set }) => {
      const db = getDynamoDb();
      try {
        const result = await db.send(
          new QueryCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
            IndexName: 'lineUserId-index',
            KeyConditionExpression: 'lineUserId = :lineUserId',
            ExpressionAttributeValues: {
              ':lineUserId': params.lineUserId,
            },
            Limit: 1,
          })
        );

        if (!result.Items || result.Items.length === 0) {
          set.status = 404;
          return { message: 'Employee not found' };
        }

        return result.Items[0];
      } catch (error) {
        console.log('Fail to get by Line ID: ', error);
        set.status = 500;
        return { message: 'Failed to get Line ID' };
      }
    },
    {
      params: t.Object({
        lineUserId: t.String(),
      }),
      response: {
        200: EmployeeSchema.EmployeeSchema,
        404: t.Object({
          message: t.Literal('Employee not found'),
        }),
        500: t.Object({
          message: t.String(),
        }),
      },
      detail: {
        summary: 'Get employee by Line User ID',
      },
      tags: ['By Line ID'],
    }
  )
  .post(
    '/',
    async ({ body }) => {
      const db = getDynamoDb();

      const inputData = {
        id: crypto.randomUUID(),
        name: body.name,
        tel: body.tel,
        lineUserId: body.lineUserId,
        department: body.department,
        section: body.section,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await db.send(
          new PutCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
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
      body: EmployeeSchema.CreateEmployeeSchema,
      response: {
        201: EmployeeSchema.EmployeeSchema,
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Create new employee',
      },
    }
  )
  .put(
    '/:id',
    async ({ params, body, set }) => {
      const db = getDynamoDb();
      try {
        const getResult = await db.send(
          new GetCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
            Key: { id: params.id },
          })
        );

        if (!getResult.Item) {
          set.status = 404;
          return { message: 'Employee not found' };
        }

        const inputData = {
          id: params.id,
          name: body.name,
          tel: body.tel,
          lineUserId: body.lineUserId,
          department: body.department,
          section: body.section,
          createdAt: getResult.Item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.send(
          new PutCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
            Item: inputData,
          })
        );
        return inputData;
      } catch (error) {
        console.log('Failed to update: ', error);
        return { message: 'Failed to update', error };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: EmployeeSchema.CreateEmployeeSchema,
      response: {
        200: EmployeeSchema.EmployeeSchema,
        404: t.Object({
          message: t.Literal('Employee not found'),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Optional(t.Any()),
        }),
      },
      detail: {
        summary: 'Update employee data',
      },
    }
  )
  .delete(
    '/',
    async () => {
      const db = getDynamoDb();
      try {
        const employeesResult = await db.send(
          new ScanCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
          })
        );
        const reservationsResult = await db.send(
          new ScanCommand({
            TableName: 'Reservation',
          })
        );

        for (const employee of employeesResult.Items || []) {
          await db.send(
            new DeleteCommand({
              TableName: TABLE_NAMES.EMPLOYEE,
              Key: { id: employee.id },
            })
          );
        }

        for (const reservation of reservationsResult.Items || []) {
          await db.send(
            new DeleteCommand({
              TableName: 'Reservation',
              Key: { id: reservation.id },
            })
          );
        }

        return { message: 'All Employees and Reservations are deleted' };
      } catch (error) {
        console.log('Failed to delete: ', error);
        return { message: 'Failed to delete', error };
      }
    },
    {
      response: {
        200: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Delete all Employees and Reservations',
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
            TableName: TABLE_NAMES.EMPLOYEE,
            Key: { id: params.id },
          })
        );

        if (!getResult.Item) {
          set.status = 404;
          return { message: 'Employee not found' };
        }

        await db.send(
          new DeleteCommand({
            TableName: TABLE_NAMES.EMPLOYEE,
            Key: { id: params.id },
          })
        );

        return getResult.Item;
      } catch (error) {
        console.log('Failed to delete: ', error);
        return { message: 'Failed to update', error };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: EmployeeSchema.EmployeeSchema,
        404: t.Object({
          message: t.Literal('Employee not found'),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
      detail: {
        summary: 'Delete employee by ID',
      },
    }
  );
