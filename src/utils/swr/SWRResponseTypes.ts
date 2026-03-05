import type { SWRResponse } from 'swr'
import type { Key } from 'swr'
import type { SWRInfiniteResponse } from 'swr/infinite'
import type { SWRMutationResponse } from 'swr/mutation'

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
}

export class SWRQueryResultWithMutate<T> extends SWRQueryResult<T> {
  get mutate() {
    return this.swrResponse.mutate
  }
}

export class SWRInfiniteResult<T> {
  protected swrResponse: SWRInfiniteResponse<T>

  constructor(swrResponse: SWRInfiniteResponse<T>) {
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
}
