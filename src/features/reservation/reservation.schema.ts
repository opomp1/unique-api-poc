
import { t } from 'elysia';

export const ReservationSchema = t.Object({
  id: t.Unknown(),
  requesterId: t.Unknown(), // relation to employee table
  lineUserId: t.String(),

  projectName: t.Optional(t.String()), //ขอใชรถจากโครงการ
  purpose: t.Optional(t.String()), // วัตถุประสงค์ในการใชรถ้
  passengerAmount: t.Optional(t.Number()), // จํานวนผู้โดยสาร
  notes: t.Optional(t.Union([t.Null(), t.String()])), // หมายเหตุเพิมเติม
  startDate: t.Optional(t.Date()), // วันทีเริมใชรถ
  endDate: t.Optional(t.Date()), // วันทีสนสุดและคืนรถ
  passenger: t.Optional(t.Union([t.Null(), t.Array(t.String())])), // ผู้โดยสาร
  approve: t.Optional(t.Union([t.Boolean(), t.Null()])),
  pdfUrl: t.Optional(t.Union([t.String(), t.Null()])),
  car: t.Optional(t.Union([t.Null(), t.String()])),

  isSelfDrive: t.Boolean(), // ผู้ขอใช้ขับเอง
  // if isSelfDriveFlase fill in the information below
  driverName: t.Optional(t.Union([t.Null(), t.String()])),
  driverEmployeeId: t.Optional(t.Union([t.Null(), t.String()])),
  driverTel: t.Optional(t.Union([t.Null(), t.String()])),

  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type ReservationSchema = typeof ReservationSchema.static;

export const ReservationArraySchema = t.Array(ReservationSchema);
export type ReservationSReservationArraySchema =
  typeof ReservationArraySchema.static;

export const CreateReservationSchema = t.Omit(ReservationSchema, [
  'id',
  'createdAt',
  'updatedAt',
]);

export type CreateReservationSchema = typeof CreateReservationSchema.static

export const UpdateReservationSchema = t.Object({
  projectName: t.Optional(t.String()), //ขอใชรถจากโครงการ
  purpose: t.Optional(t.String()), // วัตถุประสงค์ในการใชรถ้
  passengerAmount: t.Optional(t.Number()), // จํานวนผู้โดยสาร
  notes: t.Optional(t.Union([t.Null(), t.String()])), // หมายเหตุเพิมเติม
  startDate: t.Optional(t.Date()), // วันทีเริมใชรถ
  endDate: t.Optional(t.Date()), // วันทีสนสุดและคืนรถ
  passenger: t.Optional(t.Union([t.Null(), t.Array(t.String())])), // ผู้โดยสาร
  approve: t.Optional(t.Union([t.Boolean(), t.Null()])),
  pdfUrl: t.Optional(t.Union([t.String(), t.Null()])),
  car: t.Optional(t.Union([t.Null(), t.String()])),

  isSelfDrive: t.Boolean(), // ผู้ขอใช้ขับเอง
  // if isSelfDriveFlase fill in the information below
  driverName: t.Optional(t.Union([t.Null(), t.String()])),
  driverEmployeeId: t.Optional(t.Union([t.Null(), t.String()])),
  driverTel: t.Optional(t.Union([t.Null(), t.String()])),
});

export type UpdateReservationSchema = typeof UpdateReservationSchema.static