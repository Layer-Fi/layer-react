import { ReportEnum } from '../../../schemas/reports/unifiedReport'
import { useUnifiedReportWithDateParams } from '../../../providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { BalanceSheetDownloadButton } from '../../BalanceSheet/download/BalanceSheetDownloadButton'
import { CashflowStatementDownloadButton } from '../../StatementOfCashFlow/download/CashflowStatementDownloadButton'
import { unsafeAssertUnreachable } from '../../../utils/switch/assertUnreachable'

type UnifiedReportDownloadButtonProps = {
  iconOnly?: boolean
}

export function UnifiedReportDownloadButton({
  iconOnly,
}: UnifiedReportDownloadButtonProps) {
  const reportWithDateParams = useUnifiedReportWithDateParams()

  if (reportWithDateParams.report === ReportEnum.BalanceSheet) {
    return (
      <BalanceSheetDownloadButton
        effectiveDate={reportWithDateParams.effectiveDate}
        iconOnly={iconOnly}
      />
    )
  }

  if (reportWithDateParams.report === ReportEnum.CashflowStatement) {
    return (
      <CashflowStatementDownloadButton
        startDate={reportWithDateParams.startDate}
        endDate={reportWithDateParams.endDate}
        iconOnly={iconOnly}
      />
    )
  }

  unsafeAssertUnreachable({
    value: reportWithDateParams,
    message: 'Unexpected report type in UnifiedReportDownloadButton',
  })
}
