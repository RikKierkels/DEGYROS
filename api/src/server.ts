import dotenv from 'dotenv';
dotenv.config();
import { createApolloServer, createDataSources } from './apollo';
import { environment } from './environment/environment';
import { createMongoClient } from './mongo';

(async () => {
  const mongoClient = await createMongoClient(environment.mongo.uri);
  const dataSources = createDataSources(mongoClient);

  createApolloServer(dataSources)
    .listen()
    .then(({ url }) => console.log(`🚀  Server ready at ${url}`));
})();
