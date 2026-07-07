/** Layer API responses wrap their payload in a top-level `data` envelope. */
export const apiData = <T>(data: T) => ({ data })

const DEFAULT_PAGE_SIZE = 20

export const paginatedApiData = <T>(
  items: readonly T[],
  request: Request,
  pageSize: number = DEFAULT_PAGE_SIZE,
) => {
  const cursor = new URL(request.url).searchParams.get('cursor')
  const start = cursor != null ? Number(cursor) : 0
  const page = items.slice(start, start + pageSize)
  const nextCursor = start + pageSize < items.length ? String(start + pageSize) : null

  return {
    data: page,
    meta: {
      pagination: {
        cursor: nextCursor,
        has_more: nextCursor != null,
        total_count: items.length,
      },
    },
  }
}
