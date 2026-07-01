import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { type GetProfitAndLossDetailLinesParams, type PnlDetailLinesBaseParams, type PnlDetailLinesFilterParams } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/useProfitAndLossDetailLines'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getProfitAndLossDetailLinesExcel = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossDetailLinesParams) => {
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
    data?: S3PresignedUrl
    error?: unknown
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/lines/exports/excel?${queryParams.toString()}`,
  )(apiUrl, accessToken, { params: { businessId } })
}

const buildKey = createBuildKey<{ businessId: string } & PnlDetailLinesBaseParams & PnlDetailLinesFilterParams>(['#pnl-detail-lines', '#exports', '#excel'])

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
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()

  return useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
    })),
    ({ accessToken, apiUrl, businessId, startDate, endDate, pnlStructureLineItemName, tagFilter, reportingBasis, pnlStructure }) =>
      getProfitAndLossDetailLinesExcel(
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
      )().then(({ data }) => {
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
