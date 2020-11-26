import { PageInput, ResolversParentTypes } from '../generated/graphql';

type Pageables<T> = { [K in keyof T]: T[K] extends { items: unknown } ? T[K] : never }[keyof T];
type PageableItem<T> = T extends { items: infer Items } ? (Items extends Array<infer Item> ? Item : never) : never;

type PageableResolverType = Pageables<ResolversParentTypes>;
type PageableResolverItem = PageableItem<PageableResolverType>;

const paginated = <T extends PageableResolverItem>(
  items: T[],
  page: PageInput,
  total: number,
): PageableResolverType => ({
  items,
  total,
  count: items.length,
  size: page.size || items.length,
  offset: page.offset,
});

export default paginated;
