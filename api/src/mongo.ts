import { MongoClient } from 'mongodb';

export const createMongoClient = (uri: string): Promise<MongoClient> =>
  new MongoClient(uri, { useUnifiedTopology: true }).connect();
