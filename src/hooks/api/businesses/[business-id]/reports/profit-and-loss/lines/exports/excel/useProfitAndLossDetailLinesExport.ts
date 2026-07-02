import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { type PnlDetailLinesBaseParams, type PnlDetailLinesFilterParams } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/useProfitAndLossDetailLines'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const getProfitAndLossDetailLinesExcel = getWithQuery<
  {
    data?: S3PresignedUrl
    error?: unknown
  },
  PnlDetailLinesBaseParams & PnlDetailLinesFilterParams
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

const fetchProfitAndLossDetailLinesExcel = createKeyedFetcher(getProfitAndLossDetailLinesExcel)

const buildKey = createBuildKey<PnlDetailLinesBaseParams & PnlDetailLinesFilterParams>(['#pnl-detail-lines', '#exports', '#excel'])

type UseProfitAndLossDetailLinesExportOptions = PnlDetailLinesBaseParams & PnlDetailLinesFilterParams & {
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useProfitAndLossDetailLinesExport({
  startDate,
  endDate,
  pnlStructureLineItemName,
  tagFilter,
  reportingBasis,
  pnlStructure,
  onSuccess,
}: UseProfitAndLossDetailLinesExportOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
    })),
    key => fetchProfitAndLossDetailLinesExcel(key).then(({ data }) => {
      if (onSuccess && data) {
        return onSuccess(data)
      }
    }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
