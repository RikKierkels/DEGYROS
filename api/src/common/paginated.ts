import { PageInput, ResolversParentTypes } from '../generated/graphql';

type Pageables<T> = { [K in keyof T]: T[K] extends { items: unknown } ? T[K] : never }[keyof T];
type PageableItems<T> = T extends { items: infer Items } ? (Items extends Array<infer Item> ? Item : never) : never;

type PageableResolverTypes = Pageables<ResolversParentTypes>;
type PageableResolverItems = PageableItems<PageableResolverTypes>;

const paginated = <Item extends PageableResolverItems>(
  items: Item[],
  page: PageInput,
  total: number,
): PageableResolverTypes => ({
  items,
  total,
  count: items.length,
  size: page.size || items.length,
  offset: page.offset,
});

export default paginated;
