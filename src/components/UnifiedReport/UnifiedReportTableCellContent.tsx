import type { ReportConfig } from '@schemas/reports/reportConfig'
import {
  isCurrencyCellValue,
  isDateCellValue,
  isDecimalCellValue,
  isDurationCellValue,
  isEmptyCellValue,
  type UnifiedReportCell,
  type UnifiedReportColumn,
} from '@schemas/reports/unifiedReport'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useOpenDetailReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { DurationSpan } from '@ui/Typography/DurationSpan'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type UnifiedReportTableCellContentProps = {
  cell: UnifiedReportCell | null | undefined
  column: UnifiedReportColumn
  breadcrumb: ReportConfig[]
}

export const UnifiedReportTableCellContent = ({ cell, column, breadcrumb }: UnifiedReportTableCellContentProps) => {
  const { formatDate, formatNumber } = useIntlFormatter()
  const openDetailReport = useOpenDetailReport()

  if (!cell) return

  const cellValue = cell.value
  const isBold = cell.format?.bold
  const weight = isBold ? 'bold' : 'normal'
  const variant = isBold ? undefined : 'placeholder'

  let content
  if (isCurrencyCellValue(cellValue)) {
    content = <MoneySpan ellipsis weight={weight} variant={variant} amount={cellValue.value} />
  }
  else if (isDateCellValue(cellValue)) {
    content = <Span ellipsis weight={weight} variant={variant}>{formatDate(cellValue.value)}</Span>
  }
  else if (isDecimalCellValue(cellValue)) {
    content = <Span ellipsis weight={weight} variant={variant}>{formatNumber(cellValue.value)}</Span>
  }
  else if (isDurationCellValue(cellValue)) {
    content = <DurationSpan ellipsis weight={weight} variant={variant} durationMinutes={cellValue.value} />
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
