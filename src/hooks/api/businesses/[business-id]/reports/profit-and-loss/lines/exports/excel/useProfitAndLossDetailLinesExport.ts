import type { S3PresignedUrl } from '@internal-types/general'
import { getAsMutation } from '@utils/api/getAsMutation'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type PnlDetailLinesBaseParams, type PnlDetailLinesFilterParams } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/useProfitAndLossDetailLines'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type PnlDetailLinesExportParams = PnlDetailLinesBaseParams & PnlDetailLinesFilterParams

const getProfitAndLossDetailLinesExcel = getWithQuery<
  {
    data?: S3PresignedUrl
    error?: unknown
  },
  PnlDetailLinesExportParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/profit-and-loss/lines/exports/excel`,
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

const requestProfitAndLossDetailLinesExcel = getAsMutation(getProfitAndLossDetailLinesExcel)

export const useProfitAndLossDetailLinesExport = createMutationHook({
  tags: ['#pnl-detail-lines', '#exports', '#excel'],
  request: requestProfitAndLossDetailLinesExcel,
  keyParamNames: ['startDate', 'endDate', 'pnlStructureLineItemName', 'tagFilter', 'reportingBasis', 'pnlStructure'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
