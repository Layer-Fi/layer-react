import { type JsonBodyType, type PathParams } from 'msw'

import { type MockStore } from '@msw/utils/createMockStore'

type StoreResolverConfig<TItem, TBody extends JsonBodyType> = {
  store: MockStore<TItem>
  makeBase: (id: string) => TItem
  fromRequest: (request: Request, base: TItem) => Promise<TItem>
  toResponse: (item: TItem) => TBody
  /** Stamps the URL's :id param onto a test override, so `.mock(partial)` doesn't need to include it. Defaults to the `id` field. */
  setId?: (item: TItem, id: string) => TItem
}

const defaultSetId = <TItem>(item: TItem, id: string): TItem => ({ ...item, id })

export const createStoreCreateResolver = <TItem, TBody extends JsonBodyType>(
  { store, makeBase, fromRequest, toResponse }: StoreResolverConfig<TItem, TBody>,
) =>
  async ({ override, request }: { override?: TItem, request: Request }) => {
    if (override) return toResponse(override)

    const item = await fromRequest(request, makeBase(crypto.randomUUID()))
    store.save(item)

    return toResponse(item)
  }

export const createStoreUpdateResolver = <TItem, TBody extends JsonBodyType>(
  { store, makeBase, fromRequest, toResponse, idParam, setId = defaultSetId }:
  StoreResolverConfig<TItem, TBody> & { idParam: string },
) =>
  async ({ override, request, params }: { override?: TItem, request: Request, params: PathParams }) => {
    const id = params[idParam] as string

    if (override) return toResponse(setId(override, id))

    const base = store.findById(id) ?? makeBase(id)
    const item = await fromRequest(request, base)
    store.save(item)

    return toResponse(item)
  }

export const createStoreDeleteResolver = <TItem>(
  { store, idParam, markDeleted }:
  { store: MockStore<TItem>, idParam: string, markDeleted?: (item: TItem) => TItem },
) =>
  ({ params }: { params: PathParams }): Record<string, never> => {
    const id = params[idParam] as string

    if (markDeleted) {
      store.patchById(id, markDeleted)
    }
    else {
      store.deleteById(id)
    }

    return {}
  }

export const createStoreTransformResolver = <TItem, TBody extends JsonBodyType>(
  { store, makeBase, toResponse, idParam, transform, setId = defaultSetId }:
  Omit<StoreResolverConfig<TItem, TBody>, 'fromRequest'> & { idParam: string, transform: (item: TItem) => TItem },
) =>
  ({ override, params }: { override?: TItem, params: PathParams }) => {
    const id = params[idParam] as string

    if (override) return toResponse(transform(setId(override, id)))

    const item = transform(store.findById(id) ?? makeBase(id))
    store.save(item)

    return toResponse(item)
  }
