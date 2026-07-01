import { Schema } from 'effect'
import useSWR from 'swr'

import { type ReportingBasis } from '@internal-types/general'
import { type PnlDetailLineSchema, PnlDetailLinesDataSchema } from '@schemas/reports/profitAndLoss'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const keyLoader = createBuildKey<PnlDetailLinesParams>([LIST_PNL_DETAIL_LINES_TAG_KEY])

export function useProfitAndLossDetailLines({
  startDate,
  endDate,
  pnlStructureLineItemName,
  tagFilter,
  reportingBasis,
  pnlStructure,
}: PnlDetailLinesBaseParams & PnlDetailLinesFilterParams) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => withLocale(keyLoader({
      ...auth,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
      isEnabled: Boolean(startDate && endDate && pnlStructureLineItemName),
    })),
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
