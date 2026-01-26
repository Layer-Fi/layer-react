import classNames from 'classnames'
import { type BigDecimal as BD } from 'effect'
import type { PropsWithChildren } from 'react'

import { convertBigDecimalToCents } from '@utils/bigDecimalUtils'
import { convertCentsToCurrency } from '@utils/format'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './invoiceFormTotalRow.scss'

type InvoiceFormTotalRowProps = PropsWithChildren<{
  label: string
  value: BD.BigDecimal
}>

export const InvoiceFormTotalRow = ({ label, value, children }: InvoiceFormTotalRowProps) => {
  const className = classNames(
    'Layer__InvoiceForm__TotalRow',
    children && 'Layer__InvoiceForm__TotalRow--withField',
  )

  return (
    <HStack className={className} align='center' gap='md'>
      <Span>{label}</Span>
      {children}
      <Span align='right'>
        {convertCentsToCurrency(convertBigDecimalToCents(value))}
      </Span>
    </HStack>
  )
}
