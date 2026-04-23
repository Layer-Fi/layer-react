import type { ReportConfig } from '@schemas/reports/reportConfig'
import { isAmountCellValue, isDateCellValue, isEmptyCellValue, type UnifiedReportCell, type UnifiedReportColumn } from '@schemas/reports/unifiedReport'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type UnifiedReportTableCellContentProps = {
  cell: UnifiedReportCell | null | undefined
  column: UnifiedReportColumn
  breadcrumb: ReportConfig[]
}

export const UnifiedReportTableCellContent = ({ cell, column, breadcrumb }: UnifiedReportTableCellContentProps) => {
  const { formatDate } = useIntlFormatter()
  const { openDetailReport } = useDetailUnifiedReport()

  if (!cell) return

  const cellValue = cell.value
  const isBold = cell.format?.bold
  const weight = isBold ? 'bold' : 'normal'
  const variant = isBold ? undefined : 'placeholder'

  let content
  if (isAmountCellValue(cellValue)) {
    content = <MoneySpan ellipsis weight={weight} variant={variant} amount={cellValue.value} />
  }
  else if (isDateCellValue(cellValue)) {
    content = <Span ellipsis weight={weight} variant={variant}>{formatDate(cellValue.value)}</Span>
  }
  else if (isEmptyCellValue(cellValue)) {
    return null
  }
  else {
    content = <Span ellipsis weight={weight} variant={variant}>{String(cellValue.value)}</Span>
  }

  if (cell.reportConfig) {
    const reportConfig = cell.reportConfig
    return (
      <Button
        variant='text'
        onClick={() => openDetailReport({ report: reportConfig, column, breadcrumb })}
      >
        {content}
      </Button>
    )
  }

  return content
}
