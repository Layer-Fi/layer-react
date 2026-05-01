import { useTranslation } from 'react-i18next'

import type { TaxSummarySection } from '@schemas/taxEstimates/summary'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan, type MoneySpanProps } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Badge, type BadgeProps, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

type EquationSize = 'md' | 'lg'

type AmountWithLabelProps = {
  slotProps: {
    MoneySpan: MoneySpanProps
    Badge: BadgeProps
  }
}

const AmountWithLabel = ({ slotProps }: AmountWithLabelProps) => (
  <VStack className='Layer__TaxSummaryCard__AmountWithLabel' gap='2xs' align='start'>
    <MoneySpan {...slotProps.MoneySpan} />
    <Badge size={BadgeSize.SMALL} variant={BadgeVariant.NEUTRAL} {...slotProps.Badge} />
  </VStack>
)

type EquationRowProps = {
  section: TaxSummarySection
  size?: EquationSize
}

export const EquationRow = ({ section, size = 'md' }: EquationRowProps) => {
  const { t } = useTranslation()
  const operatorGap = size === 'lg' ? 'md' : 'sm'
  return (
    <HStack className='Layer__TaxSummaryCard__Equation' gap={operatorGap}>
      <AmountWithLabel
        slotProps={{
          MoneySpan: { amount: section.total, size },
          Badge: { children: t('common:label.total', 'Total') },
        }}
      />
      <Span className='Layer__TaxSummaryCard__Operator' size={size} variant='subtle'>-</Span>
      <AmountWithLabel
        slotProps={{
          MoneySpan: { amount: section.taxesPaid, size },
          Badge: { children: t('taxEstimates:label.taxes_paid', 'Taxes Paid') },
        }}
      />
      <Span className='Layer__TaxSummaryCard__Operator' size={size} variant='subtle'>=</Span>
      <AmountWithLabel
        slotProps={{
          MoneySpan: { amount: section.taxesOwed, size, weight: 'bold' },
          Badge: { children: t('taxEstimates:label.taxes_owed', 'Taxes Owed') },
        }}
      />
    </HStack>
  )
}
