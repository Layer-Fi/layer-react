import { SortOrder } from '@internal-types/utility/pagination'

type SortKeys<TItem> = Record<string, (item: TItem) => number>

export const ASCENDING_SORT_ORDERS: readonly string[] = [SortOrder.ASC, SortOrder.ASCENDING]

export const createListSorter = <TItem>(keys: SortKeys<TItem>, defaultKey: keyof SortKeys<TItem>) =>
  (items: readonly TItem[], request: Request): TItem[] => {
    const params = new URL(request.url).searchParams
    const key = keys[params.get('sort_by') ?? ''] ?? keys[defaultKey]
    const ascending = ASCENDING_SORT_ORDERS.includes(params.get('sort_order') ?? '')

    return [...items].sort((a, b) => (key(a) - key(b)) * (ascending ? 1 : -1))
  }
