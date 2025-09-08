/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import Elysia, { t } from 'elysia';
import { StringRecordId } from 'surrealdb';
import { getDb } from '../../lib/database';
import {
  ReplyTokenSchema,
  type UpdateReplyTokenSchema,
} from './reply-token.schema';

export const replyTokenRoutes = new Elysia({
  prefix: '/reply-token',
  tags: ['Reply token'],
}).put(
  '/:lineUserId/replyToken',
  async ({ params, body }) => {
    const db = await getDb();
    try {
      const { lineUserId } = params;
      const { replyToken } = body;
      const existingToken = await db.query<[ReplyTokenSchema[]]>(
        'SELECT * FROM ReplyToken WHERE lineUserId = $lineUserId LIMIT 1',
        { lineUserId }
      );
      if (!existingToken[0] || existingToken[0].length === 0) {
        const response = await db.create<UpdateReplyTokenSchema>('ReplyToken', {
          lineUserId,
          replyToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return response[0];
      }
      const prevReplyToken = existingToken[0][0];
      const recordId = String(prevReplyToken.id)
      const inputData = {
        lineUserId,
        replyToken,
        createdAt: prevReplyToken.createdAt ?? new Date(),
        updatedAt: new Date(),
      };
      const response = await db.update<UpdateReplyTokenSchema>(
        new StringRecordId(recordId),
        inputData
      );
      return response;
    } catch (error) {
      console.log('Failed to update reply token: ', error);
      return { message: 'Failed to update reply token', error };
    }
  },
  {
    params: t.Object({
      lineUserId: t.String(),
    }),
    body: t.Object({
      replyToken: t.String(),
    }),
    response: {
      200: ReplyTokenSchema,
      201: ReplyTokenSchema,
      500: t.Object({
        message: t.String(),
        error: t.Unknown(),
      }),
    },
    detail: {
        summary: 'Create or update reply token'
    }
  }
);
