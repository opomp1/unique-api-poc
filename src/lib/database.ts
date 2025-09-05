import { env } from 'bun';
import Surreal from 'surrealdb';


type DbConfig = {
  url: string;
  namespace: string;
  database: string;
};

// Define the default database configuration
const DEFAULT_CONFIG: DbConfig = {
  url: `${env.DATABASE_URL || 'http://127.0.0.1:8000'}/rpc`,
  namespace: env.DATABASE_NAMESPACE || 'unique-poc',
  database: env.DATABASE || 'unique-poc',
};

// Define the function to get the database instance
export async function getDb(
  config: DbConfig = DEFAULT_CONFIG
): Promise<Surreal> {
  const db = new Surreal();

  try {
    await db.connect(config.url);

    await db.signin({
      username: 'user',
      password: 'pass',
    });

    await db.use({
      namespace: config.namespace,
      database: config.database,
    });
    return db;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: test
    console.error(
      'Failed to connect to SurrealDB:',
      err instanceof Error ? err.message : String(err)
    );
    await db.close();
    throw err;
  }
}