import type { OAuthResponse } from '@internal-types/authentication'
import type { PaginatedResponse } from '@schemas/common/pagination'

type AuthKeyInput = Partial<OAuthResponse> & { apiUrl?: string }

type BuildKeyParams = Record<string, unknown>

type EnablementInput = { isEnabled?: boolean }

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
