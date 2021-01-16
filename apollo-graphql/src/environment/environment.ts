type Environment = {
  mongo: MongoConfig;
};

type MongoConfig = {
  uri: string;
};

export const environment: Environment = {
  mongo: {
    uri: process.env.MONGO_DB_URI || '',
  },
};
