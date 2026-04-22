import { isAmountCellValue, isDateCellValue, isEmptyCellValue, type UnifiedReportCell } from '@schemas/reports/unifiedReport'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type UnifiedReportTableCellContentProps = {
  cell: UnifiedReportCell | null | undefined
}

export const UnifiedReportTableCellContent = ({ cell }: UnifiedReportTableCellContentProps) => {
  const { formatDate } = useIntlFormatter()

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

  return content
}
