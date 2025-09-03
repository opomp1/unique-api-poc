import { t } from 'elysia';

export const EmployeeSchema = t.Object({
  id: t.Unknown(),
  name: t.String(),
  tel: t.String(),
  department: t.String(), // ฝ่าย
  section: t.String(), // แผนก
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
