import { t } from 'elysia';

export const ReplyTokenSchema = t.Object({
  id: t.Unknown(),
  lineUserId: t.String(),
  replyToken: t.String(),
  createdAt: t.Optional(t.Date()),
  updatedAt: t.Optional(t.Date()),
});
export type ReplyTokenSchema = typeof ReplyTokenSchema.static;

export const UpdateReplyTokenSchema = t.Omit(ReplyTokenSchema, ["id"]);
export type UpdateReplyTokenSchema = typeof UpdateReplyTokenSchema.static

// export const UpdateReplyTokenBody = t.Omit(ReplyTokenSchema, [
//   'id',
//   'lineUserId',
//   'createdAt',
//   'updatedAt',
// ]);
// export type UpdateReplyTokenBody = typeof UpdateReplyTokenBody.static;