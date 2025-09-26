import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { getDynamoDb } from './dynamodb';

export const TABLE_NAMES = {
  EMPLOYEE: 'Employee',
  RESERVATION: 'Reservation',
  REPLY_TOKEN: 'ReplyToken',
} as const;

export async function createTablesIfNotExists() {
  const dynamodb = getDynamoDb();

  try {
    await createEmployeeTable();
    await createReservationTable();
    await createReplyTokenTable();
    console.log('All tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

async function createEmployeeTable() {
  const dynamodb = getDynamoDb();

  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: TABLE_NAMES.EMPLOYEE }));
    console.log(`Table ${TABLE_NAMES.EMPLOYEE} already exists`);
  } catch (error) {
    const createTableParams = {
      TableName: TABLE_NAMES.EMPLOYEE,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'lineUserId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'lineUserId-index',
          KeySchema: [
            { AttributeName: 'lineUserId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    };

    await dynamodb.send(new CreateTableCommand(createTableParams));
    console.log(`Table ${TABLE_NAMES.EMPLOYEE} created`);
  }
}

async function createReservationTable() {
  const dynamodb = getDynamoDb();

  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: TABLE_NAMES.RESERVATION }));
    console.log(`Table ${TABLE_NAMES.RESERVATION} already exists`);
  } catch (error) {
    const createTableParams = {
      TableName: TABLE_NAMES.RESERVATION,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'lineUserId', AttributeType: 'S' },
        { AttributeName: 'requesterId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'lineUserId-index',
          KeySchema: [
            { AttributeName: 'lineUserId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          BillingMode: 'PAY_PER_REQUEST'
        },
        {
          IndexName: 'requesterId-index',
          KeySchema: [
            { AttributeName: 'requesterId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    };

    await dynamodb.send(new CreateTableCommand(createTableParams));
    console.log(`Table ${TABLE_NAMES.RESERVATION} created`);
  }
}

async function createReplyTokenTable() {
  const dynamodb = getDynamoDb();

  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: TABLE_NAMES.REPLY_TOKEN }));
    console.log(`Table ${TABLE_NAMES.REPLY_TOKEN} already exists`);
  } catch (error) {
    const createTableParams = {
      TableName: TABLE_NAMES.REPLY_TOKEN,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'lineUserId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'lineUserId-index',
          KeySchema: [
            { AttributeName: 'lineUserId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    };

    await dynamodb.send(new CreateTableCommand(createTableParams));
    console.log(`Table ${TABLE_NAMES.REPLY_TOKEN} created`);
  }
}