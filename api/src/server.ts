import { createApolloServer } from './apollo';
import { createMongoClient } from './mongo';

(async () => {
  const mongoClient = await createMongoClient('mongodb://localhost:27017');
  createApolloServer(mongoClient)
    .listen()
    .then(({ url }) => console.log(`🚀  Server ready at ${url}`));
})();
