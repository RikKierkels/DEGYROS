import dotenv from 'dotenv';
dotenv.config();
import { createApolloServer } from './apollo';
import { createMongoClient } from './mongo';
import { environment } from './environment/environment';

(async () => {
  const mongoClient = await createMongoClient(environment.mongo.uri);
  createApolloServer(mongoClient)
    .listen()
    .then(({ url }) => console.log(`🚀  Server ready at ${url}`));
})();
