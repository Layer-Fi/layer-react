import { type ReportingBasis } from '@internal-types/general'
import { type PnlDetailLineSchema, PnlDetailLinesDataSchema } from '@schemas/reports/profitAndLoss'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { getWithQuery } from '@utils/api/getWithQuery'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
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

const PnlDetailLinesResponseSchema = UnwrappedDataResponseSchema(PnlDetailLinesDataSchema)

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

export const useProfitAndLossDetailLines = createQueryHook({
  tags: [LIST_PNL_DETAIL_LINES_TAG_KEY],
  request: listProfitAndLossDetailLines,
  schema: PnlDetailLinesResponseSchema,
  swrOptions: { keepPreviousData: true },
})

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
