import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { env } from 'bun';

type DbConfig = {
  region: string;
  endpoint?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

// Define the default database configuration
const DEFAULT_CONFIG: DbConfig = {
  region: env.AWS_REGION || 'us-east-1',
  endpoint: env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || 'local',
  },
};

let dynamoDbClient: DynamoDBDocumentClient;

// Define the function to get the DynamoDB instance
export function getDynamoDb(
  config: DbConfig = DEFAULT_CONFIG
): DynamoDBDocumentClient {
  if (!dynamoDbClient) {
    const client = new DynamoDBClient({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
    });

    dynamoDbClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        convertClassInstanceToMap: true,
      },
    });
  }

  return dynamoDbClient;
}
