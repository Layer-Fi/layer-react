import { useTranslation } from 'react-i18next'

import type { TaxSummarySection } from '@schemas/taxEstimates/summary'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

type EquationSize = 'md' | 'lg'

type AmountWithLabelProps = {
  amount: number
  label: string
  emphasis?: boolean
  size?: EquationSize
}

export const AmountWithLabel = ({ amount, label, emphasis, size = 'md' }: AmountWithLabelProps) => (
  <VStack className='Layer__TaxSummaryCard__AmountWithLabel' gap='2xs' align='start'>
    <MoneySpan size={size} weight={emphasis ? 'bold' : undefined} amount={amount} />
    <Badge size={BadgeSize.SMALL} variant={BadgeVariant.NEUTRAL}>{label}</Badge>
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
        amount={section.taxesOwed}
        label={t('taxEstimates:label.taxes_owed', 'Taxes Owed')}
        emphasis
        size={size}
      />
      <Span className='Layer__TaxSummaryCard__Operator' size={size} variant='subtle'>=</Span>
      <AmountWithLabel amount={section.total} label={t('common:label.total', 'Total')} size={size} />
      <Span className='Layer__TaxSummaryCard__Operator' size={size} variant='subtle'>-</Span>
      <AmountWithLabel
        amount={section.taxesPaid}
        label={t('taxEstimates:label.taxes_paid', 'Taxes paid')}
        size={size}
      />
    </HStack>
  )
}
