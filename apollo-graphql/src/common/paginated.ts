import { ResolversParentTypes } from '../generated/graphql';

type Pages<T> = { [K in keyof T]: T[K] extends { items: unknown } ? T[K] : never }[keyof T];
type PageItems<T> = T extends { items: infer Items } ? (Items extends Array<infer Item> ? Item : never) : never;

type PageResolverTypes = Pages<ResolversParentTypes>;
type PageResolverItems = PageItems<PageResolverTypes>;

const paginated = <Item extends PageResolverItems>(
  items: Item[],
  offset: number,
  total: number,
): PageResolverTypes => ({
  items,
  total,
  size: items.length,
  offset,
});

export default paginated;
