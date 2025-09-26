/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import Elysia, { t } from 'elysia';
import { getDynamoDb } from '../../lib/dynamodb';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { TABLE_NAMES } from '../../lib/setup-tables';
import {
  ReplyTokenSchema,
  type UpdateReplyTokenSchema,
} from './reply-token.schema';

export const replyTokenRoutes = new Elysia({
  prefix: '/reply-token',
  tags: ['Reply token'],
})
  .put(
    '/:lineUserId',
    async ({ params, body }) => {
      const db = getDynamoDb();
      try {
        const { lineUserId } = params;
        const { replyToken } = body;
        const existingTokenResult = await db.send(new QueryCommand({
          TableName: TABLE_NAMES.REPLY_TOKEN,
          IndexName: 'lineUserId-index',
          KeyConditionExpression: 'lineUserId = :lineUserId',
          ExpressionAttributeValues: {
            ':lineUserId': lineUserId
          },
          Limit: 1
        }));

        if (!existingTokenResult.Items || existingTokenResult.Items.length === 0) {
          const newToken = {
            id: crypto.randomUUID(),
            lineUserId,
            replyToken,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.send(new PutCommand({
            TableName: TABLE_NAMES.REPLY_TOKEN,
            Item: newToken
          }));
          return newToken;
        }

        const prevReplyToken = existingTokenResult.Items[0];
        const inputData = {
          id: prevReplyToken.id,
          lineUserId,
          replyToken,
          createdAt: prevReplyToken.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.send(new PutCommand({
          TableName: TABLE_NAMES.REPLY_TOKEN,
          Item: inputData
        }));
        return inputData;
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
        summary: 'Create or update reply token',
      },
    }
  )
  .get(
    '/:lineUserId',
    async ({ params, set }) => {
      const db = getDynamoDb();
      try {
        const { lineUserId } = params;
        const result = await db.send(new QueryCommand({
          TableName: TABLE_NAMES.REPLY_TOKEN,
          IndexName: 'lineUserId-index',
          KeyConditionExpression: 'lineUserId = :lineUserId',
          ExpressionAttributeValues: {
            ':lineUserId': lineUserId
          },
          Limit: 1
        }));

        if (!result.Items || result.Items.length === 0) {
          set.status = 404;
          return { message: 'Reply token not found' };
        }

        return result.Items[0];
      } catch (error) {
        console.log('Failed to get reply token: ', error);
        return { message: 'Failed to get reply token', error };
      }
    },
    {
      params: t.Object({
        lineUserId: t.String(),
      }),
      response: {
        200: ReplyTokenSchema,
        404: t.Object({
          message: t.String(),
        }),
        500: t.Object({
          message: t.String(),
          error: t.Unknown(),
        }),
      },
    }
  );
