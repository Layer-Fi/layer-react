import type { PaginatedResponse } from '@schemas/common/pagination'

/**
 * Auth fields as they arrive from `useAuth()` (`{ access_token, ... }`), which is
 * typically spread into a `buildKey` call as `buildKey({ ...auth, businessId })`.
 */
type AuthKeyInput = {
  access_token?: string
  apiUrl?: string
}

/**
 * Extra parameters a caller threads through the key untouched (e.g. `businessId`,
 * path params like `serviceId`, or query params like `allowArchived`). Every
 * passthrough field is copied verbatim into the returned key object.
 */
type BuildKeyParams = Record<string, unknown>

/**
 * Optional enablement gate. When `isEnabled` is explicitly `false`, `buildKey`
 * returns `undefined` so SWR treats the request as disabled. Defaults to enabled.
 */
type EnablementInput = {
  isEnabled?: boolean
}

/**
 * Generates the `buildKey` function that nearly every API hook under
 * `src/hooks/api` declares by hand.
 *
 * The generated function:
 *   - renames `access_token` -> `accessToken` (so callers can spread `...auth`),
 *   - returns `undefined` when `isEnabled === false` or auth is incomplete
 *     (matching the ubiquitous `if (accessToken && apiUrl)` guard), so SWR skips
 *     the request until it can actually run,
 *   - copies every remaining param (`businessId`, path/query params, ...) into
 *     the key untouched,
 *   - attaches the provided cache `tags`.
 *
 * @example
 * const buildKey = createBuildKey<{ businessId: string, allowArchived?: boolean }>(
 *   [CATALOG_SERVICES_TAG_KEY, LIST_CATALOG_SERVICES_TAG_KEY],
 * )
 * // in the hook:
 * useSWR(() => withLocale(buildKey({ ...auth, businessId, allowArchived, isEnabled })), fetcher)
 */
export function createBuildKey<TParams extends BuildKeyParams>(tags: ReadonlyArray<string>) {
  return ({
    access_token: accessToken,
    apiUrl,
    isEnabled = true,
    ...params
  }: AuthKeyInput & EnablementInput & TParams) => {
    if (!isEnabled) return

    if (accessToken && apiUrl) {
      return {
        accessToken,
        apiUrl,
        ...params as TParams,
        tags,
      } as const
    }
  }
}

/**
 * `useSWRInfinite` variant of {@link createBuildKey}. Produces the `keyLoader`
 * that infinite-list hooks declare by hand: same auth/enablement/tags handling,
 * plus a `cursor` derived from the previous page.
 *
 * The default cursor extractor reads `previousPageData?.meta?.pagination.cursor`
 * (the standard {@link PaginatedResponse} shape); pass `getCursor` for responses
 * that page differently.
 *
 * @example
 * const keyLoader = createInfiniteKeyLoader<Omit<ListInvoicesParams, 'cursor'>, ListInvoicesReturn>(
 *   [LIST_INVOICES_TAG_KEY],
 * )
 * // in the hook:
 * useSWRInfinite(
 *   (_index, previousPageData) => withLocale(keyLoader(previousPageData, { ...auth, businessId, ...params })),
 *   fetcher,
 * )
 */
export function createInfiniteKeyLoader<
  TParams extends BuildKeyParams,
  TPage extends PaginatedResponse<unknown> = PaginatedResponse<unknown>,
>(
  tags: ReadonlyArray<string>,
  getCursor: (previousPageData: TPage | null) => string | undefined =
  previousPageData => previousPageData?.meta?.pagination.cursor ?? undefined,
) {
  return (
    previousPageData: TPage | null,
    {
      access_token: accessToken,
      apiUrl,
      isEnabled = true,
      ...params
    }: AuthKeyInput & EnablementInput & TParams,
  ) => {
    if (!isEnabled) return

    if (accessToken && apiUrl) {
      return {
        accessToken,
        apiUrl,
        ...(params as TParams),
        cursor: getCursor(previousPageData),
        tags,
      } as const
    }
  }
}
