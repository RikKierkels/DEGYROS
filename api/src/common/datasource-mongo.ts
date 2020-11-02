import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching';
import { Collection, FilterQuery, ObjectId } from 'mongodb';
import DataLoader from 'dataloader';
import { hasValue } from './util';
import { EJSON } from 'bson';
import { Context } from '../apollo';

type MongoDataSourceConfig = {
  timeToLive: number;
};

const MINUTE_IN_MS = 60000;
const DEFAULT_CONFIG: MongoDataSourceConfig = {
  timeToLive: MINUTE_IN_MS,
};

export class MongoDataSource<T extends { _id: ObjectId }> extends DataSource {
  private cache: KeyValueCache = new InMemoryLRUCache();
  private readonly config: MongoDataSourceConfig;
  private loader: DataLoader<string, T>;

  public collection: Collection<T>;

  constructor(collection: Collection<T>, config: MongoDataSourceConfig = DEFAULT_CONFIG) {
    super();
    this.config = config;
    this.loader = this.createLoader();
    this.collection = collection;
  }

  initialize({ cache = this.cache }: DataSourceConfig<any>): void {
    this.cache = cache;
  }

  // TODO: Get rid of cast to FilterQuery
  createLoader(): DataLoader<string, T> {
    return new DataLoader<string, T>((ids) => {
      return this.collection
        .find({ _id: { $in: ids } } as FilterQuery<T>)
        .toArray()
        .then(this.preserveLoaderOrder(ids));
    });
  }

  private preserveLoaderOrder(ids: readonly string[]): (documents: T[]) => T[] {
    return (documents) => {
      return ids.map((id) => documents.find(({ _id }) => _id.equals(id))).filter(hasValue);
    };
  }

  async findOneById(id: string): Promise<T> {
    const key = this.createCacheKey(id);

    const documentFromCache = await this.cache.get(key);
    if (documentFromCache) {
      return EJSON.parse(documentFromCache) as T;
    }

    const document = await this.loader.load(id);
    const { timeToLive } = this.config;
    if (timeToLive) {
      this.cache.set(key, EJSON.stringify(document), { ttl: timeToLive });
    }

    return document;
  }

  async findManyById(ids: string[]): Promise<T[]> {
    return Promise.all(ids.map(this.findOneById));
  }

  async removeFromCacheById(id: string): Promise<void> {
    const key = this.createCacheKey(id);
    this.loader.clear(id);
    await this.cache.delete(key);
  }

  private createCacheKey(id: string): string {
    return `mongo-${this.collection.collectionName}-${id}`;
  }
}
