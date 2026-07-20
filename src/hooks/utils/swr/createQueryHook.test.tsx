import { type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { pipe, Schema } from 'effect'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as authenticatedHttp from '@utils/api/authenticatedHttp'
import { SupportedLocale } from '@utils/i18n/supportedLocale'
import { type AuthenticatedRequest } from '@utils/swr/createKeyedFetcher'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

import { getRequestOptions } from '@test-utils/getRequestOptions'
import { LayerTestProvider, TEST_LAYER_ACCESS_TOKEN, TEST_LAYER_API_URL, TEST_LAYER_BUSINESS_ID } from '@test-utils/LayerTestProvider'
import { renderHookWithAuth } from '@test-utils/renderHookWithAuth'

const frCaWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider locale={SupportedLocale.frCA}>{children}</LayerTestProvider>
)

type WidgetParams = { businessId: string, widgetId?: string }

type RawWidget = { id: string, display_name: string }
const RAW_WIDGET: RawWidget = { id: 'w1', display_name: 'Widget One' }

const WidgetSchema = Schema.Struct({
  id: Schema.String,
  displayName: pipe(Schema.propertySignature(Schema.String), Schema.fromKey('display_name')),
})

const makeRequest = <T,>(impl: () => Promise<T>) =>
  vi.fn<AuthenticatedRequest<T, WidgetParams>>(() => impl)

afterEach(() => vi.restoreAllMocks())

describe('createQueryHook', () => {
  it('fetches on mount and forwards apiUrl, accessToken, and businessId', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))

    expect(request).toHaveBeenCalledWith(
      TEST_LAYER_API_URL,
      TEST_LAYER_ACCESS_TOKEN,
      { params: { businessId: TEST_LAYER_BUSINESS_ID } },
    )
  })

  it('forwards call-site params and omits key context (tags/auth) from request params', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useWidget({ widgetId: 'w1' }))

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))

    const params = getRequestOptions(request)?.params
    expect(params).toEqual({ businessId: TEST_LAYER_BUSINESS_ID, widgetId: 'w1' })
    expect(params).not.toHaveProperty('tags')
    expect(params).not.toHaveProperty('accessToken')
    expect(params).not.toHaveProperty('apiUrl')
  })

  it('does not fetch until auth resolves', () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    // Deliberately not auth-gated: assert the pre-auth render produces no key and no fetch.
    renderHook(() => useWidget(), { wrapper: LayerTestProvider })

    expect(request).not.toHaveBeenCalled()
  })

  it('does not fetch when isEnabled is false', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    // renderHookWithAuth resolves once auth lands — an enabled hook would have fetched by then.
    const { result } = await renderHookWithAuth(() => useWidget({ isEnabled: false }))

    expect(request).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('bakes keyDefaults into the request', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({
      tags: ['Widgets'],
      request,
      keyDefaults: { widgetId: 'default' },
    })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))
    expect(getRequestOptions(request)?.params).toMatchObject({ widgetId: 'default' })
  })

  it('lets call-site params override keyDefaults', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({
      tags: ['Widgets'],
      request,
      keyDefaults: { widgetId: 'default' },
    })

    const { result } = await renderHookWithAuth(() => useWidget({ widgetId: 'override' }))

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))
    expect(getRequestOptions(request)?.params).toMatchObject({ widgetId: 'override' })
  })

  it('decodes the response with the schema', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget, typeof WidgetSchema.Type>({
      tags: ['Widgets'],
      request,
      schema: WidgetSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.data).toEqual({ id: 'w1', displayName: 'Widget One' }))
  })

  it('passes the raw response through when no schema is given', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))
  })

  it('surfaces schema decode failures as an error', async () => {
    const request = makeRequest(() => Promise.resolve({ id: 'w1' } as unknown as RawWidget))
    const useWidget = createQueryHook<WidgetParams, RawWidget, typeof WidgetSchema.Type>({
      tags: ['Widgets'],
      request,
      schema: WidgetSchema,
    })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('applies select to the decoded data', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget, typeof WidgetSchema.Type, string>({
      tags: ['Widgets'],
      request,
      schema: WidgetSchema,
      select: decoded => decoded.displayName,
    })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.data).toBe('Widget One'))
  })

  it('surfaces a rejected request as an error', async () => {
    const request = makeRequest(() => Promise.reject(new Error('boom')))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({
      tags: ['Widgets'],
      request,
      swrOptions: { shouldRetryOnError: false },
    })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('refetches when call-site params change', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    const { rerender } = await renderHookWithAuth(
      ({ widgetId }: { widgetId: string }) => useWidget({ widgetId }),
      { initialProps: { widgetId: 'w1' } },
    )

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1))

    rerender({ widgetId: 'w2' })

    await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    expect(getRequestOptions(request, 1)?.params).toEqual({ businessId: TEST_LAYER_BUSINESS_ID, widgetId: 'w2' })
  })

  it('lets caller swrOptions win over factory defaults, key by key', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const factoryOnSuccess = vi.fn()
    const callOnSuccess = vi.fn()

    const useWidget = createQueryHook<WidgetParams, RawWidget>({
      tags: ['Widgets'],
      request,
      swrOptions: { onSuccess: factoryOnSuccess },
    })

    await renderHookWithAuth(() => useWidget({ swrOptions: { onSuccess: callOnSuccess } }))

    await waitFor(() => expect(callOnSuccess).toHaveBeenCalledTimes(1))
    expect(factoryOnSuccess).not.toHaveBeenCalled()
  })

  it('refetch re-invokes the request', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useWidget = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useWidget())

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1))

    await result.current.refetch()

    await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
  })

  it('sends the active locale when localized (default)', async () => {
    const setLocaleHeader = vi.spyOn(authenticatedHttp, 'setLocaleHeader')
    const localizedRequest = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useLocalizedQuery = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request: localizedRequest })

    const { result } = await renderHookWithAuth(() => useLocalizedQuery(), { wrapper: frCaWrapper })

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))
    expect(setLocaleHeader).toHaveBeenCalledWith(SupportedLocale.frCA)
  })

  it('omits the locale from the key when isLocalized is false', async () => {
    const setLocaleHeader = vi.spyOn(authenticatedHttp, 'setLocaleHeader')
    const nonLocalizedRequest = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useNonLocalizedQuery = createQueryHook<WidgetParams, RawWidget>({ tags: ['Widgets'], request: nonLocalizedRequest, isLocalized: false })

    const { result } = await renderHookWithAuth(() => useNonLocalizedQuery(), { wrapper: frCaWrapper })

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))
    expect(setLocaleHeader).not.toHaveBeenCalledWith(SupportedLocale.frCA)
  })
})
