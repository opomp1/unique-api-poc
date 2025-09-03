/** biome-ignore-all lint/performance/noNamespaceImport: <explanation> */
/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import Elysia, { t } from 'elysia';
import { StringRecordId } from 'surrealdb';
// import { v7 as uuidv7 } from 'uuid';
import { getDb } from '../../lib/database';
import * as EmployeeSchema from './employee.schema';

export const employeeRoutes = new Elysia({
  prefix: '/employee',
  tags: ['Employee'],
})
  .get(
    '/',
    async () => {
      const db = await getDb();
      try {
        const employees =
          await db.select<EmployeeSchema.EmployeeSchema>('Employee');
        return employees;
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
        summary: "Get all employees"
      }
    }
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      const db = await getDb();
      try {
        const response = await db.select<EmployeeSchema.EmployeeSchema>(
          new StringRecordId(params.id)
        );
        if (!response) {
          set.status = 404;
          return { message: 'Employee Not found' };
        }
        return response;
      } catch (error) {
        console.log('Fail to get by id: ', error);
        return { message: 'Failed to get all' };
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
        summary: "Get employee by ID"
      }
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
        department: body.department,
        section: body.section,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const employee = await db.create<EmployeeSchema.CreateEmployeeSchema>(
          'Employee',
          inputDate
        );
        return employee;
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
          error: t.Unknown()
        })
      },
      detail: {
        summary: "Create new employee"
      }
    }
  )
  .put(
    '/:id',
    async ({ params, body, set }) => {
      const db = await getDb();
      try {
        const prevData = await db.select<EmployeeSchema.EmployeeSchema>(
          new StringRecordId(params.id)
        );

        if (!prevData) {
          set.status = 404;
          return { message: 'Employee not found' };
        }

        const inputData = {
          id: prevData.id,
          name: body.name,
          tel: body.tel,
          department: body.department,
          section: body.section,
          createdAt: prevData.createdAt || new Date(),
          updatedAt: new Date(),
        };
        const response = await db.update<EmployeeSchema.EmployeeSchema>(
          new StringRecordId(params.id),
          inputData
        );
        return response;
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
        summary: "Update employee data"
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, set }) => {
      const db = await getDb();
      try {
        const response = await db.delete<EmployeeSchema.EmployeeSchema>(
          new StringRecordId(params.id)
        );
        if (!response) {
          set.status = 404;
          return { message: 'Employee not found' };
        }
        return response;
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
        summary: "Delete employee"
      }
    }
  );
