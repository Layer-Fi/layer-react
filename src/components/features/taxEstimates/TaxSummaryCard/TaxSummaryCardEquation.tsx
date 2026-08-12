import { useTranslation } from 'react-i18next'

import type { TaxSummarySection } from '@schemas/features/taxEstimates/summary'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Badge, type BadgeProps, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan, type MoneySpanProps } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

const legacyClassNames = createLegacyClassNames({
  'equation:operator': ['Layer__TaxSummaryCard__Operator', 'Layer__TaxDetails__Operator'],
})

type EquationSize = 'md' | 'lg'

type AmountWithLabelProps = {
  slotProps: {
    MoneySpan: MoneySpanProps
    Badge: BadgeProps
  }
}

const AmountWithLabel = ({ slotProps }: AmountWithLabelProps) => (
  <VStack className='Layer__TaxSummaryCard__AmountWithLabel' gap='2xs' align='center'>
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
      <Span className={legacyClassNames('equation:operator')} size={size} variant='subtle'>-</Span>
      <AmountWithLabel
        slotProps={{
          MoneySpan: { amount: section.taxesPaid, size },
          Badge: { children: t('taxEstimates:TaxSummaryCard.TaxSummaryCardEquation.label.taxes_paid', 'Taxes Paid') },
        }}
      />
      <Span className={legacyClassNames('equation:operator')} size={size} variant='subtle'>=</Span>
      <AmountWithLabel
        slotProps={{
          MoneySpan: { amount: section.taxesOwed, size },
          Badge: { children: t('taxEstimates:TaxSummaryCard.TaxSummaryCardEquation.label.taxes_owed', 'Taxes Owed') },
        }}
      />
    </HStack>
  )
}
