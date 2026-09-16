import { Schema } from 'effect'

/** Layer API responses wrap their payload in a top-level `data` envelope. */
export const apiData = <T>(data: T) => ({ data })

const DEFAULT_PAGE_SIZE = 100

// Opaque wire cursor <-> the page offset it represents. Any string that
// doesn't decode to a non-negative base64'd number falls back to 0 rather
// than failing, since a client is expected to only ever echo back a cursor
// this same schema produced.
const CursorSchema = Schema.transform(
  Schema.String,
  Schema.Number,
  {
    strict: false,
    decode: (cursor) => {
      try {
        const offset = Number(atob(cursor))
        return Number.isFinite(offset) && offset >= 0 ? offset : 0
      }
      catch {
        return 0
      }
    },
    encode: offset => btoa(String(offset)),
  },
)

const decodeCursorParam = Schema.decodeSync(CursorSchema)
const encodeCursor = Schema.encodeSync(CursorSchema)

const decodeCursor = (cursor: string | null) => cursor == null ? 0 : decodeCursorParam(cursor)

export const paginatedApiData = <T>(
  items: readonly T[],
  request: Request,
  defaultPageSize: number = DEFAULT_PAGE_SIZE,
) => {
  const params = new URL(request.url).searchParams

  const requestedLimit = Number(params.get('limit'))
  const pageSize = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : defaultPageSize

  const start = decodeCursor(params.get('cursor'))
  const page = items.slice(start, start + pageSize)
  const nextCursor = start + pageSize < items.length ? encodeCursor(start + pageSize) : null

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
