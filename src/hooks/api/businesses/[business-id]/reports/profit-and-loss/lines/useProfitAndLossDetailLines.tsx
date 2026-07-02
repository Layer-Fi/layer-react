import { Schema } from 'effect'

import { type ReportingBasis } from '@internal-types/general'
import { type PnlDetailLineSchema, PnlDetailLinesDataSchema } from '@schemas/reports/profitAndLoss'
import { get } from '@utils/api/authenticatedHttp'
import { getWithQuery } from '@utils/api/getWithQuery'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

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

const PnlDetailLinesResponseSchema = Schema.Struct({
  data: PnlDetailLinesDataSchema,
})

const listProfitAndLossDetailLines = getWithQuery<
  typeof PnlDetailLinesResponseSchema.Encoded,
  PnlDetailLinesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/profit-and-loss/lines`,
  ({ startDate, endDate, pnlStructureLineItemName, tagFilter, reportingBasis, pnlStructure }) => ({
    startDate,
    endDate,
    lineItemName: pnlStructureLineItemName,
    reportingBasis,
    tagKey: tagFilter?.key,
    tagValues: tagFilter?.values?.join(','),
    pnlStructure,
  }),
)

const useProfitAndLossDetailLinesQuery = createQueryHook({
  tags: [LIST_PNL_DETAIL_LINES_TAG_KEY],
  request: listProfitAndLossDetailLines,
  schema: PnlDetailLinesResponseSchema,
  select: ({ data }) => data,
  swrOptions: { keepPreviousData: true },
})

export function useProfitAndLossDetailLines({
  startDate,
  endDate,
  pnlStructureLineItemName,
  tagFilter,
  reportingBasis,
  pnlStructure,
}: PnlDetailLinesBaseParams & PnlDetailLinesFilterParams) {
  return useProfitAndLossDetailLinesQuery({
    startDate,
    endDate,
    pnlStructureLineItemName,
    tagFilter,
    reportingBasis,
    pnlStructure,
    isEnabled: Boolean(startDate && endDate && pnlStructureLineItemName),
  })
}

export const usePnlDetailLinesInvalidator = createResourceGlobalCacheActions<PnlDetailLinesReturn>(LIST_PNL_DETAIL_LINES_TAG_KEY)

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
