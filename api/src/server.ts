import dotenv from 'dotenv';
dotenv.config();
import { createApolloServer, createDataSources } from './apollo';
import { createMongoClient } from './mongo';
import { environment } from './environment/environment';

(async () => {
  const mongoClient = await createMongoClient(environment.mongo.uri);
  const dataSources = createDataSources(mongoClient);
  createApolloServer(dataSources)
    .listen()
    .then(({ url }) => console.log(`🚀  Server ready at ${url}`));
})();
