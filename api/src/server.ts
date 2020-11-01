import { createApolloServer } from './apollo';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient('mongodb://localhost:27017');
mongoClient.connect();

const server = createApolloServer();
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
