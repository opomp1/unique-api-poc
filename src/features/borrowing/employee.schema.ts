import { t } from 'elysia';

export const EmployeeSchema = t.Object({
  id: t.Unknown(),
  name: t.Optional(t.String()),
  tel: t.Optional(t.String()),
  lineUserId: t.String(),
  responseToken: t.Optional(t.String()),
  department: t.Optional(t.String()), // ฝ่าย
  section: t.Optional(t.String()), // แผนก
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type EmployeeSchema = typeof EmployeeSchema.static;

export const CreateEmployeeSchema = t.Omit(EmployeeSchema, [
  'id',
  'createdAt',
  'updatedAt',
]);

export type CreateEmployeeSchema = typeof CreateEmployeeSchema.static;
