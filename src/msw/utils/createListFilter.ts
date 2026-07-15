import { CalendarDate, parseDate } from '@internationalized/date'

type ParamPredicate<TItem> = (item: TItem, value: string | null) => boolean

export const createListFilter = <TItem>(filters: Record<string, ParamPredicate<TItem>>) =>
  (items: readonly TItem[], request: Request): TItem[] => {
    const searchParams = new URL(request.url).searchParams

    return items.filter(item =>
      Object.entries(filters).every(([param, predicate]) => predicate(item, searchParams.get(param))),
    )
  }

const whenPresent = <TItem>(predicate: (item: TItem, value: string) => boolean): ParamPredicate<TItem> =>
  (item, value) => value == null || value === '' || predicate(item, value)

export const matchesQuery = <TItem>(fields: (item: TItem) => ReadonlyArray<string | null | undefined>) =>
  whenPresent<TItem>((item, value) => {
    const query = value.toLowerCase()

    return fields(item).some(field => field?.toLowerCase()?.includes(query) ?? false)
  })

export const matchesValue = <TItem>(get: (item: TItem) => string | number | null | undefined) =>
  whenPresent<TItem>((item, value) => String(get(item)) === value)

export const matchesBoolean = <TItem>(get: (item: TItem) => boolean) =>
  whenPresent<TItem>((item, value) => get(item) === (value === 'true'))

type Comparable = number | Date | CalendarDate

// Dates compare at day granularity - range params arrive as date-only strings.
const compareToParam = (itemValue: Comparable, value: string): number => {
  if (itemValue instanceof CalendarDate) return itemValue.compare(parseDate(value))

  if (itemValue instanceof Date) {
    const day = itemValue.toISOString().slice(0, 10)
    return day < value ? -1 : day > value ? 1 : 0
  }

  return itemValue - Number(value)
}

export const matchesOnOrAfter = <TItem>(get: (item: TItem) => Comparable | null | undefined) =>
  whenPresent<TItem>((item, value) => {
    const itemValue = get(item)
    return itemValue != null && compareToParam(itemValue, value) >= 0
  })

export const matchesOnOrBefore = <TItem>(get: (item: TItem) => Comparable | null | undefined) =>
  whenPresent<TItem>((item, value) => {
    const itemValue = get(item)
    return itemValue != null && compareToParam(itemValue, value) <= 0
  })

/* Items matching `isGated` are only included when the query flag is 'true'. */
export const requiresFlag = <TItem>(isGated: (item: TItem) => boolean): ParamPredicate<TItem> =>
  (item, value) => value === 'true' || !isGated(item)

export const notDeleted = <TItem extends { deletedAt: Date | null | undefined }>(item: TItem) =>
  item.deletedAt == null
