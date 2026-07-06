import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import { pipe, Schema } from 'effect'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as authenticatedHttp from '@utils/api/authenticatedHttp'
import { type MutationRequest } from '@utils/api/getAsMutation'
import { SupportedLocale } from '@utils/i18n/supportedLocale'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

import { getRequestOptions } from '@test-utils/getRequestOptions'
import { LayerTestProvider, TEST_LAYER_ACCESS_TOKEN, TEST_LAYER_API_URL, TEST_LAYER_BUSINESS_ID } from '@test-utils/LayerTestProvider'
import { renderHookWithAuth } from '@test-utils/renderHookWithAuth'

const frCaWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider locale={SupportedLocale.frCA}>{children}</LayerTestProvider>
)

type WidgetParams = { businessId: string, widgetId?: string }
type WidgetBody = { name: string }

type RawWidget = { id: string, display_name: string }
const RAW_WIDGET: RawWidget = { id: 'w1', display_name: 'Widget One' }

const WidgetSchema = Schema.Struct({
  id: Schema.String,
  displayName: pipe(Schema.propertySignature(Schema.String), Schema.fromKey('display_name')),
})

/** A `request` spy shaped like `MutationRequest`. */
const makeRequest = <T,>(impl: () => Promise<T>) =>
  vi.fn<MutationRequest<T, WidgetBody, WidgetParams>>(() => impl())

afterEach(() => vi.restoreAllMocks())

describe('createMutationHook', () => {
  it('does not fire on mount, only on trigger', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    expect(request).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('uses the trigger arg as the body by default and forwards auth + businessId', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    const [url, token, options] = request.mock.calls[0]
    expect(url).toBe(TEST_LAYER_API_URL)
    expect(token).toBe(TEST_LAYER_ACCESS_TOKEN)
    expect(options?.body).toEqual({ name: 'New Widget' })
    expect(options?.params).toMatchObject({ businessId: TEST_LAYER_BUSINESS_ID })
  })

  it('strips key context (tags/auth) from the request params', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    const params = getRequestOptions(request)?.params
    expect(params).toMatchObject({ businessId: TEST_LAYER_BUSINESS_ID })
    expect(params).not.toHaveProperty('tags')
    expect(params).not.toHaveProperty('accessToken')
    expect(params).not.toHaveProperty('apiUrl')
  })

  it('builds the body from the trigger arg with argToBody', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody, WidgetParams, RawWidget, string>({
      tags: ['Widgets'],
      request,
      argToBody: (name: string) => ({ name }),
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await result.current.trigger('New Widget')
    })

    expect(getRequestOptions(request)?.body).toEqual({ name: 'New Widget' })
  })

  it('sends no body when argToBody maps undefined to undefined', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useAction = createMutationHook<RawWidget, WidgetBody, WidgetParams, RawWidget, undefined>({
      tags: ['Widgets'],
      request,
      argToBody: (_arg: undefined) => undefined,
    })

    const { result } = await renderHookWithAuth(() => useAction())

    await act(async () => {
      await result.current.trigger()
    })

    expect(getRequestOptions(request)?.body).toBeUndefined()
  })

  it('pulls URL params from the trigger arg with argToParams (overriding key params)', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<
      RawWidget,
      WidgetBody,
      WidgetParams,
      RawWidget,
      { widgetId: string, name: string }
    >({
      tags: ['Widgets'],
      request,
      argToParams: arg => ({ widgetId: arg.widgetId }),
      argToBody: arg => ({ name: arg.name }),
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await result.current.trigger({ widgetId: 'w9', name: 'New Widget' })
    })

    expect(getRequestOptions(request)?.params).toMatchObject({ businessId: TEST_LAYER_BUSINESS_ID, widgetId: 'w9' })
    expect(getRequestOptions(request)?.body).toEqual({ name: 'New Widget' })
  })

  it('pins keyParams from the hook options into the request params', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody, WidgetParams, RawWidget, WidgetBody, readonly ['widgetId']>({
      tags: ['Widgets'],
      request,
      keyParams: ['widgetId'],
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget({ widgetId: 'w7' }))

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    expect(getRequestOptions(request)?.params).toMatchObject({ businessId: TEST_LAYER_BUSINESS_ID, widgetId: 'w7' })
  })

  it('decodes the response and applies select to what trigger resolves with', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<
      RawWidget,
      WidgetBody,
      WidgetParams,
      typeof WidgetSchema.Type,
      WidgetBody,
      readonly [],
      string
    >({
      tags: ['Widgets'],
      request,
      schema: WidgetSchema,
      select: decoded => decoded.displayName,
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    let resolved: string | undefined
    await act(async () => {
      resolved = await result.current.trigger({ name: 'New Widget' })
    })

    expect(resolved).toBe('Widget One')
    expect(result.current.data).toBe('Widget One')
  })

  it('calls onSuccess with the selected data', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const onSuccess = vi.fn()
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({
      tags: ['Widgets'],
      request,
      swrOptions: { onSuccess },
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    expect(onSuccess.mock.calls[0][0]).toEqual(RAW_WIDGET)
  })

  it('surfaces schema decode failures as an error', async () => {
    const request = makeRequest(() => Promise.resolve({ id: 'w1' } as unknown as RawWidget))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody, WidgetParams, typeof WidgetSchema.Type>({
      tags: ['Widgets'],
      request,
      schema: WidgetSchema,
      swrOptions: { throwOnError: false },
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('rejects the trigger and calls onError when the request fails', async () => {
    const request = makeRequest(() => Promise.reject(new Error('boom')))
    const onError = vi.fn()
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({
      tags: ['Widgets'],
      request,
      swrOptions: { onError },
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    await act(async () => {
      await expect(result.current.trigger({ name: 'New Widget' })).rejects.toThrow('boom')
    })

    expect(onError).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('lets caller swrOptions win over factory defaults, key by key', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const factoryOnSuccess = vi.fn()
    const callOnSuccess = vi.fn()
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({
      tags: ['Widgets'],
      request,
      swrOptions: { onSuccess: factoryOnSuccess },
    })

    const { result } = await renderHookWithAuth(() => useUpsertWidget({ swrOptions: { onSuccess: callOnSuccess } }))

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    expect(callOnSuccess).toHaveBeenCalledTimes(1)
    expect(factoryOnSuccess).not.toHaveBeenCalled()
  })

  it('toggles isMutating across the trigger and clears state on reset', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useUpsertWidget = createMutationHook<RawWidget, WidgetBody>({ tags: ['Widgets'], request })

    const { result } = await renderHookWithAuth(() => useUpsertWidget())

    expect(result.current.isMutating).toBe(false)

    await act(async () => {
      await result.current.trigger({ name: 'New Widget' })
    })

    await waitFor(() => expect(result.current.data).toEqual(RAW_WIDGET))
    expect(result.current.isMutating).toBe(false)

    act(() => result.current.reset())

    await waitFor(() => expect(result.current.data).toBeUndefined())
  })

  it('sends the active locale when localized and omits it when not', async () => {
    const setLocaleHeader = vi.spyOn(authenticatedHttp, 'setLocaleHeader')

    const localizedRequest = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const useLocalized = createMutationHook<RawWidget, WidgetBody>({ tags: ['Widgets'], request: localizedRequest })
    const { result: localized } = await renderHookWithAuth(() => useLocalized(), { wrapper: frCaWrapper })
    await act(async () => {
      await localized.current.trigger({ name: 'New Widget' })
    })
    expect(setLocaleHeader).toHaveBeenCalledWith(SupportedLocale.frCA)

    setLocaleHeader.mockClear()

    const plainRequest = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const usePlain = createMutationHook<RawWidget, WidgetBody>({ tags: ['Widgets'], request: plainRequest, isLocalized: false })
    const { result: plain } = await renderHookWithAuth(() => usePlain(), { wrapper: frCaWrapper })
    await act(async () => {
      await plain.current.trigger({ name: 'New Widget' })
    })
    expect(setLocaleHeader).not.toHaveBeenCalledWith(SupportedLocale.frCA)
  })
})
