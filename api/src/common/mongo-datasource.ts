import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching';
import { Collection, FilterQuery, ObjectId } from 'mongodb';
import DataLoader from 'dataloader';
import { EJSON } from 'bson';
import { Context } from '../apollo';

type Id = ObjectId | string;
type MongoDataSourceConfig = {
  ttl: number;
};

const MINUTE_IN_MS = 60000;
const DEFAULT_CONFIG: MongoDataSourceConfig = {
  ttl: MINUTE_IN_MS,
};

export class MongoDataSource<T extends { _id: Id }> extends DataSource {
  private cache: KeyValueCache = new InMemoryLRUCache();
  private readonly config: MongoDataSourceConfig;
  private loader: DataLoader<Id, T>;

  public collection: Collection<T>;

  constructor(collection: Collection<T>, config: MongoDataSourceConfig = DEFAULT_CONFIG) {
    super();
    this.config = config;
    this.loader = this.createLoader();
    this.collection = collection;
  }

  initialize({ cache = this.cache }: DataSourceConfig<Context>): void {
    this.cache = cache;
  }

  createLoader(): DataLoader<Id, T> {
    return new DataLoader((ids) => {
      return this.collection
        .find({ _id: { $in: ids } } as FilterQuery<T>)
        .toArray()
        .then(this.preserveOriginalOrder(ids));
    });
  }

  private preserveOriginalOrder(ids: readonly Id[]): (documents: T[]) => T[] {
    return (documents) => {
      return ids.map((id) => {
        const index = documents.findIndex(({ _id }) => this.idToString(_id) === this.idToString(id));
        return documents[index];
      });
    };
  }

  private idToString(id: Id): string {
    return id instanceof ObjectId ? id.toHexString() : id;
  }

  private createCacheKey(id: Id): string {
    return `mongo-${this.collection.collectionName}-${this.idToString(id)}`;
  }

  async findOneById(id: Id): Promise<T> {
    const key = this.createCacheKey(id);

    const documentFromCache = await this.cache.get(key);
    if (documentFromCache) {
      return EJSON.parse(documentFromCache) as T;
    }

    const document = await this.loader.load(id);
    const { ttl } = this.config;
    if (document && ttl) {
      this.cache.set(key, EJSON.stringify(document), { ttl });
    }

    return document;
  }

  async findManyById(ids: Id[]): Promise<T[]> {
    const documents = ids.map((id) => this.findOneById(id));
    return Promise.all(documents).then((documents) => documents.filter((doc) => doc));
  }

  async removeFromCacheById(id: Id): Promise<void> {
    const key = this.createCacheKey(id);
    this.loader.clear(id);
    await this.cache.delete(key);
  }
}
