import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import { Schema } from 'effect'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import * as authenticatedHttp from '@utils/api/authenticatedHttp'
import { SupportedLocale } from '@utils/i18n/supportedLocale'
import { type AuthenticatedRequest } from '@utils/swr/createKeyedFetcher'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

import { getRequestOptions } from '@test-utils/getRequestOptions'
import { LayerTestProvider, TEST_LAYER_ACCESS_TOKEN, TEST_LAYER_API_URL, TEST_LAYER_BUSINESS_ID } from '@test-utils/LayerTestProvider'
import { renderHookWithAuth } from '@test-utils/renderHookWithAuth'

const frCaWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider locale={SupportedLocale.frCA}>{children}</LayerTestProvider>
)

type WidgetParams = { businessId: string, cursor?: string, pageSize?: number }

const ItemSchema = Schema.Struct({ id: Schema.String })
const PageSchema = PaginatedResponseSchema(ItemSchema)
type Page = typeof PageSchema.Type
type PageEncoded = typeof PageSchema.Encoded

/** Raw (encoded) page shape as it comes off the wire. */
const rawPage = (ids: string[], cursor: string | null, hasMore: boolean) => ({
  data: ids.map(id => ({ id })),
  meta: { pagination: { cursor, has_more: hasMore, total_count: 3 } },
})

const PAGE_ONE = rawPage(['1', '2'], 'cursor-2', true)
const PAGE_TWO = rawPage(['3'], null, false)

/** A `request` spy that serves page two once the cursor from page one is passed. */
const makePagedRequest = () =>
  vi.fn<AuthenticatedRequest<PageEncoded, WidgetParams>>(
    (_baseUrl, _token, options) => () =>
      Promise.resolve(options?.params?.cursor === 'cursor-2' ? PAGE_TWO : PAGE_ONE),
  )

afterEach(() => vi.restoreAllMocks())

describe('createInfiniteQueryHook', () => {
  it('fetches the first page with no cursor and forwards auth + businessId', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.data).toHaveLength(1))

    expect(request).toHaveBeenCalledWith(
      TEST_LAYER_API_URL,
      TEST_LAYER_ACCESS_TOKEN,
      { params: { businessId: TEST_LAYER_BUSINESS_ID, cursor: undefined } },
    )
  })

  it('decodes each page and flattens the data across loaded pages', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.flattenedData).toEqual([{ id: '1' }, { id: '2' }]))
  })

  it('reports hasMore from the last loaded page pagination', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.data).toHaveLength(1))
    expect(result.current.hasMore).toBe(true)
  })

  it('fetchMore loads the next page using the previous page cursor and appends it', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.data).toHaveLength(1))

    act(() => result.current.fetchMore())

    await waitFor(() => expect(result.current.flattenedData).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]))
    expect(result.current.size).toBe(2)
    expect(result.current.hasMore).toBe(false)

    const secondPageCall = request.mock.calls.find(call => call[2]?.params?.cursor === 'cursor-2')
    expect(secondPageCall).toBeDefined()
  })

  it('fetchMore is a no-op on the last page', async () => {
    const request = vi.fn<AuthenticatedRequest<PageEncoded, WidgetParams>>(
      () => () => Promise.resolve(PAGE_TWO),
    )
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.data).toHaveLength(1))
    expect(result.current.hasMore).toBe(false)

    act(() => result.current.fetchMore())

    // hasMorePages guards fetchMore, so the size and request count stay put.
    expect(result.current.size).toBe(1)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('bakes keyDefaults into every page request', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
      keyDefaults: { pageSize: 50 },
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.data).toHaveLength(1))
    expect(getRequestOptions(request)?.params).toMatchObject({ pageSize: 50 })
  })

  it('lets call-site params override keyDefaults', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
      keyDefaults: { pageSize: 50 },
    })

    const { result } = await renderHookWithAuth(() => useWidgets({ pageSize: 10 }))

    await waitFor(() => expect(result.current.data).toHaveLength(1))
    expect(getRequestOptions(request)?.params).toMatchObject({ pageSize: 10 })
  })

  it('does not fetch when isEnabled is false', async () => {
    const request = makePagedRequest()
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    // renderHookWithAuth resolves once auth lands — an enabled hook would have fetched by then.
    const { result } = await renderHookWithAuth(() => useWidgets({ isEnabled: false }))

    expect(request).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('reports hasMore false when the last page has no cursor', async () => {
    const request = vi.fn<AuthenticatedRequest<PageEncoded, WidgetParams>>(
      () => () => Promise.resolve(PAGE_TWO),
    )
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.data).toHaveLength(1))
    expect(result.current.hasMore).toBe(false)
  })

  it('surfaces a page decode failure as an error', async () => {
    const request = vi.fn<AuthenticatedRequest<PageEncoded, WidgetParams>>(
      () => () => Promise.resolve({ data: [{ id: 1 }] } as unknown as PageEncoded),
    )
    const useWidgets = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request,
      schema: PageSchema,
      swrOptions: { shouldRetryOnError: false },
    })

    const { result } = await renderHookWithAuth(() => useWidgets())

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('sends the active locale when localized (default)', async () => {
    const setLocaleHeader = vi.spyOn(authenticatedHttp, 'setLocaleHeader')
    const localizedRequest = makePagedRequest()
    const useLocalizedInfiniteQuery = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request: localizedRequest,
      schema: PageSchema,
    })

    const { result } = await renderHookWithAuth(() => useLocalizedInfiniteQuery(), { wrapper: frCaWrapper })
    await waitFor(() => expect(result.current.data).toHaveLength(1))

    expect(setLocaleHeader).toHaveBeenCalledWith(SupportedLocale.frCA)
  })

  it('omits the locale from the key when isLocalized is false', async () => {
    const setLocaleHeader = vi.spyOn(authenticatedHttp, 'setLocaleHeader')
    const nonLocalizedRequest = makePagedRequest()
    const useNonLocalizedInfiniteQuery = createInfiniteQueryHook<WidgetParams, PageEncoded, Page>({
      tags: ['Widgets'],
      request: nonLocalizedRequest,
      schema: PageSchema,
      isLocalized: false,
    })

    const { result } = await renderHookWithAuth(() => useNonLocalizedInfiniteQuery(), { wrapper: frCaWrapper })
    await waitFor(() => expect(result.current.data).toHaveLength(1))

    expect(setLocaleHeader).not.toHaveBeenCalledWith(SupportedLocale.frCA)
  })
})
