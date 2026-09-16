export const getPageCount = ({
  itemCount,
  pageSize,
}: {
  itemCount: number
  pageSize: number
}) => Math.max(0, Math.ceil(itemCount / pageSize))

export const clampPageIndex = ({
  pageCount,
  pageIndex,
}: {
  pageCount: number
  pageIndex: number
}) => Math.max(0, Math.min(pageIndex, pageCount - 1))

export const getPageItems = <T>({
  data,
  pageIndex,
  pageSize,
}: {
  data: ReadonlyArray<T>
  pageIndex: number
  pageSize: number
}) => data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
