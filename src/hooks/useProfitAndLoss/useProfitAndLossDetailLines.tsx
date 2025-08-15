import useSWR, { type SWRResponse } from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useGlobalCacheActions } from '../../utils/swr/useGlobalCacheActions'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { get } from '../../api/layer/authenticated_http'
import { Schema } from 'effect'
import { ReportingBasis } from '../../types'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { PnlDetailLineSchema, PnlDetailLinesDataSchema } from './schemas'

export const LIST_PNL_DETAIL_LINES_TAG_KEY = '#list-pnl-detail-lines'

type PnlStructureLineItemName = string

type PnlDetailLinesBaseParams = {
  businessId: string
  startDate: Date
  endDate: Date
  pnlStructureLineItemName: PnlStructureLineItemName
}

type PnlDetailLinesFilterParams = {
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
  pnlStructure?: string
}

type PnlDetailLinesParams = PnlDetailLinesBaseParams & PnlDetailLinesFilterParams

export type PnlDetailLine = typeof PnlDetailLineSchema.Type

export type PnlDetailLinesReturn = typeof PnlDetailLinesDataSchema.Type

class PnlDetailLinesSWRResponse {
  private swrResponse: SWRResponse<PnlDetailLinesReturn>

  constructor(swrResponse: SWRResponse<PnlDetailLinesReturn>) {
    this.swrResponse = swrResponse
  }

  get data(): PnlDetailLinesReturn | undefined {
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

  get refetch() {
    return this.swrResponse.mutate
  }
}

function keyLoader(
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    startDate,
    endDate,
    pnlStructureLineItemName,
    tagFilter,
    reportingBasis,
    pnlStructure,
  }: {
    access_token?: string
    apiUrl?: string
  } & PnlDetailLinesParams,
) {
  if (accessToken && apiUrl && businessId && startDate && endDate && pnlStructureLineItemName) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
      tags: [LIST_PNL_DETAIL_LINES_TAG_KEY],
    } as const
  }
  return null
}

export function useProfitAndLossDetailLines({
  startDate,
  endDate,
  pnlStructureLineItemName,
  tagFilter,
  reportingBasis,
  pnlStructure,
}: PnlDetailLinesBaseParams & PnlDetailLinesFilterParams) {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWR(
    () => keyLoader({
      ...auth,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
    }),
    ({
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
    }) => getProfitAndLossDetailLines(
      apiUrl,
      accessToken,
      {
        businessId,
        startDate,
        endDate,
        pnlStructureLineItemName,
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.values?.join(','),
        reportingBasis,
        pnlStructure,
      },
    )().then(response => response.data).then(Schema.decodeUnknownPromise(PnlDetailLinesDataSchema)),
    {
      keepPreviousData: true,
    },
  )

  return new PnlDetailLinesSWRResponse(swrResponse)
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export function usePnlDetailLinesInvalidator() {
  const { invalidate } = useGlobalCacheActions()

  const invalidatePnlDetailLines = useCallback(
    () => invalidate(tags => tags.includes(LIST_PNL_DETAIL_LINES_TAG_KEY)),
    [invalidate],
  )

  const debouncedInvalidatePnlDetailLines = useMemo(
    () => debounce(
      invalidatePnlDetailLines,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidatePnlDetailLines],
  )

  return {
    invalidatePnlDetailLines,
    debouncedInvalidatePnlDetailLines,
  }
}

type GetProfitAndLossDetailLinesParams = {
  businessId: string
  startDate: Date
  endDate: Date
  pnlStructureLineItemName: string
  tagKey?: string
  tagValues?: string
  reportingBasis?: string
  pnlStructure?: string
}

export const getProfitAndLossDetailLines = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossDetailLinesParams) => {
  const { businessId, startDate, endDate, pnlStructureLineItemName, tagKey, tagValues, reportingBasis, pnlStructure } = params
  const queryParams = toDefinedSearchParameters({
    startDate,
    endDate,
    lineItemName: pnlStructureLineItemName,
    reportingBasis,
    tagKey,
    tagValues,
    pnlStructure,
  })

  return get<{
    data?: PnlDetailLinesReturn
    params: GetProfitAndLossDetailLinesParams
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/lines?${queryParams.toString()}`,
  )(apiUrl, accessToken, { params: { businessId } })
}
