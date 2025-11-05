import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { Schema } from 'effect'
import { ReportEnum } from '../../../schemas/reports/unifiedReport'
import {
  useUnifiedReportWithDateParams,
  type UnifiedReportWithDateParams,
} from '../../../providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { getBalanceSheetExcel } from '../../../api/layer/balance_sheet'
import { getCashflowStatementCSV } from '../../../api/layer/statement-of-cash-flow'
import { unsafeAssertUnreachable } from '../../../utils/switch/assertUnreachable'
import { S3PresignedUrlSchema, S3PresignedUrlSchemaType } from '../../../schemas/common/s3PresignedUrl'

type BalanceParams = Extract<UnifiedReportWithDateParams, { report: ReportEnum.BalanceSheet }>
type CashflowParams = Extract<UnifiedReportWithDateParams, { report: ReportEnum.CashflowStatement }>

const getTag = (report: ReportEnum) => `#download-unified-${report}-report`

const DownloadUnifiedReportReturnSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

type DownloadUnifiedReportSWRMutationResponse =
  SWRMutationResponse<S3PresignedUrlSchemaType, unknown, Key, never>

class DownloadUnifiedReportSWRResponse {
  private swrResponse: DownloadUnifiedReportSWRMutationResponse

  constructor(swrResponse: DownloadUnifiedReportSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  reportWithDateParams,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  reportWithDateParams: UnifiedReportWithDateParams
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      ...reportWithDateParams,
      tags: [getTag(reportWithDateParams.report)],
    }
  }
}

const reportDownloadConfig = {
  [ReportEnum.BalanceSheet]: {
    downloadFn: getBalanceSheetExcel,
    getParams: (businessId: string, params: BalanceParams) => ({
      businessId,
      ...params,
    }),
  },
  [ReportEnum.CashflowStatement]: {
    downloadFn: getCashflowStatementCSV,
    getParams: (businessId: string, params: CashflowParams) => ({
      businessId,
      ...params,
    }),
  },
} as const

function downloadReport(
  apiUrl: string,
  accessToken: string | undefined,
  businessId: string,
  unifiedReportParams: UnifiedReportWithDateParams,
) {
  switch (unifiedReportParams.report) {
    case ReportEnum.BalanceSheet: {
      const config = reportDownloadConfig[ReportEnum.BalanceSheet]
      return config.downloadFn(apiUrl, accessToken, { params: config.getParams(businessId, unifiedReportParams) })
    }
    case ReportEnum.CashflowStatement: {
      const config = reportDownloadConfig[ReportEnum.CashflowStatement]
      return config.downloadFn(apiUrl, accessToken, { params: config.getParams(businessId, unifiedReportParams) })
    }
    default:
      return unsafeAssertUnreachable({
        value: unifiedReportParams,
        message: 'Unexpected report type in useUnifiedReportDownload',
      })
  }
}

type UseUnifiedReportDownloadOptions = {
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportDownload({ onSuccess }: UseUnifiedReportDownloadOptions = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const reportWithDateParams = useUnifiedReportWithDateParams()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
      reportWithDateParams,
    }),
    async ({ accessToken, apiUrl, businessId, tags, ...reportParams }) =>
      downloadReport(apiUrl, accessToken, businessId, reportParams)()
        .then(Schema.decodeUnknownPromise(DownloadUnifiedReportReturnSchema))
        .then(async ({ data }) => {
          if (onSuccess) await onSuccess(data)
          return data
        }),
    { revalidate: false, throwOnError: false },
  )

  return new DownloadUnifiedReportSWRResponse(rawMutationResponse)
}
