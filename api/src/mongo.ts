import { MongoClient } from 'mongodb';

export const createMongoClient = (uri: string): Promise<MongoClient> => {
  return new MongoClient(uri, { useUnifiedTopology: true }).connect();
};
