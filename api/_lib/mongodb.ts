import { config } from 'dotenv';
import { MongoClient, type Db, type MongoClientOptions } from 'mongodb';

config({ path: '.env.local' });

const uri = process.env.MONGODB_URI!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const options: MongoClientOptions = {};
  if (process.env.MONGODB_TLS_CERT_PATH) {
    options.tlsCertificateKeyFile = process.env.MONGODB_TLS_CERT_PATH;
  }

  const client = new MongoClient(uri, options);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db('net-worth-tracker');
  return cachedDb;
}
