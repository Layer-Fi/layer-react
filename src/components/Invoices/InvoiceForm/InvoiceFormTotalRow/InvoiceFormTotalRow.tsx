import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

import { convertNonRecursiveBigDecimalToCents, type NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './invoiceFormTotalRow.scss'

type InvoiceFormTotalRowProps = PropsWithChildren<{
  label: string
  value: NonRecursiveBigDecimal
}>

export const InvoiceFormTotalRow = ({ label, value, children }: InvoiceFormTotalRowProps) => {
  const { formatCurrencyFromCents } = useIntlFormatter()
  const className = classNames(
    'Layer__InvoiceForm__TotalRow',
    children && 'Layer__InvoiceForm__TotalRow--withField',
  )

  return (
    <HStack className={className} align='center' gap='md'>
      <Span>{label}</Span>
      {children}
      <Span align='right'>
        {formatCurrencyFromCents(convertNonRecursiveBigDecimalToCents(value))}
      </Span>
    </HStack>
  )
}
