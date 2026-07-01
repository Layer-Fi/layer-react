import type { OAuthResponse } from '@internal-types/authentication'
import type { PaginatedResponse } from '@schemas/common/pagination'

// Auth fields from `useAuth()`. `access_token`/`apiUrl` become part of the key;
// the rest (`token_type`, `expires_in`) are destructured out so callers can spread
// `...auth` without leaking auth metadata into cache identity.
type AuthKeyInput = Partial<OAuthResponse> & { apiUrl?: string }

type BuildKeyParams = Record<string, unknown>

type EnablementInput = { isEnabled?: boolean }

/**
 * Builds the `buildKey` used by most API hooks: renames `access_token` -> `accessToken`,
 * returns `undefined` when disabled or auth is incomplete, copies passthrough params, and
 * attaches cache `tags`.
 */
export function createBuildKey<TParams extends BuildKeyParams>(tags: ReadonlyArray<string>) {
  return ({
    access_token: accessToken,
    apiUrl,
    token_type,
    expires_in,
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
 * `useSWRInfinite` variant of {@link createBuildKey} that also derives `cursor` from the
 * previous page (defaults to the standard {@link PaginatedResponse} shape).
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
      token_type,
      expires_in,
      isEnabled = true,
      ...params
    }: AuthKeyInput & EnablementInput & TParams,
  ) => {
    if (!isEnabled) return

    if (accessToken && apiUrl) {
      return {
        accessToken,
        apiUrl,
        ...params as TParams,
        cursor: getCursor(previousPageData),
        tags,
      } as const
    }
  }
}
