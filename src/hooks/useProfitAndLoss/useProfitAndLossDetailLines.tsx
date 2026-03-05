import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type ReportingBasis } from '@internal-types/general'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { type PnlDetailLineSchema, PnlDetailLinesDataSchema } from '@hooks/useProfitAndLoss/schemas'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LIST_PNL_DETAIL_LINES_TAG_KEY = '#list-pnl-detail-lines'

type PnlStructureLineItemName = string

export type PnlDetailLinesBaseParams = {
  businessId: string
  startDate: Date
  endDate: Date
  pnlStructureLineItemName: PnlStructureLineItemName
}

export type PnlDetailLinesFilterParams = {
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

  return new SWRQueryResult(swrResponse)
}

export function usePnlDetailLinesInvalidator() {
  const { invalidate } = useGlobalCacheActions()

  const invalidatePnlDetailLines = useCallback(
    () => invalidate(({ tags }) => tags.includes(LIST_PNL_DETAIL_LINES_TAG_KEY)),
    [invalidate],
  )

  return { invalidatePnlDetailLines }
}

export type GetProfitAndLossDetailLinesParams = {
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
