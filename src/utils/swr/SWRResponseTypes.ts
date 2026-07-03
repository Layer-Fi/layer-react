import type { SWRResponse } from 'swr'
import type { Key } from 'swr'
import type { SWRInfiniteResponse } from 'swr/infinite'
import type { SWRMutationResponse } from 'swr/mutation'

import type { PaginatedResponse } from '@schemas/common/pagination'
import { hasMorePages } from '@utils/swr/hasMorePages'

export class SWRQueryResult<T> {
  protected swrResponse: SWRResponse<T>

  constructor(swrResponse: SWRResponse<T>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get error(): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.swrResponse.error
  }

  get mutate() {
    return this.swrResponse.mutate
  }

  get refetch() {
    return this.swrResponse.mutate
  }
}

export type FlattenedData<T> = T extends { data: ReadonlyArray<infer E> } ? Array<E> : never

export class SWRInfiniteResult<T extends PaginatedResponse<unknown>> {
  protected swrResponse: SWRInfiniteResponse<T>
  private readonly fetchMoreFn: () => void
  private readonly flattenedDataValue: FlattenedData<T> | undefined

  constructor(
    swrResponse: SWRInfiniteResponse<T>,
    fetchMore: () => void,
    flattenedData: FlattenedData<T> | undefined,
  ) {
    this.swrResponse = swrResponse
    this.fetchMoreFn = fetchMore
    this.flattenedDataValue = flattenedData
  }

  get data() {
    return this.swrResponse.data
  }

  get flattenedData() {
    return this.flattenedDataValue
  }

  get hasMore() {
    return hasMorePages(this.swrResponse.data)
  }

  get fetchMore() {
    return this.fetchMoreFn
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get error(): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.swrResponse.error
  }

  get mutate() {
    return this.swrResponse.mutate
  }

  get refetch() {
    return this.swrResponse.mutate
  }

  get size() {
    return this.swrResponse.size
  }

  get setSize() {
    return this.swrResponse.setSize
  }
}

export class SWRMutationResult<Data, ExtraArg = never> {
  protected swrResponse: SWRMutationResponse<Data, unknown, Key, ExtraArg>

  constructor(swrResponse: SWRMutationResponse<Data, unknown, Key, ExtraArg>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get error() {
    return this.swrResponse.error
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get reset() {
    return this.swrResponse.reset
  }
}
