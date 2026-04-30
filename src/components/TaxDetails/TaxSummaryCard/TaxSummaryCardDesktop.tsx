import { useTranslation } from 'react-i18next'

import type { TaxSummary, TaxSummarySection } from '@schemas/taxEstimates/summary'
import { tConditional } from '@utils/i18n/conditional'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import ArrowRightCircle from '@icons/ArrowRightCircle'
import Plus from '@icons/Plus'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

type TaxSummaryCardDesktopProps = {
  data: TaxSummary
}

type AmountWithLabelProps = {
  amount: number
  label: string
  emphasis?: boolean
}

const AmountWithLabel = ({ amount, label, emphasis }: AmountWithLabelProps) => (
  <VStack className='Layer__TaxSummaryCard__AmountWithLabel' gap='2xs' align='start'>
    <MoneySpan size='lg' weight={emphasis ? 'bold' : undefined} amount={amount} />
    <Badge size={BadgeSize.SMALL} variant={BadgeVariant.NEUTRAL}>{label}</Badge>
  </VStack>
)

type SectionEquationProps = {
  section: TaxSummarySection
  totalLabel: string
  taxesOwedLabel: string
  taxesPaidLabel: string
}

const SectionEquation = ({ section, totalLabel, taxesOwedLabel, taxesPaidLabel }: SectionEquationProps) => (
  <HStack className='Layer__TaxSummaryCard__Equation' gap='md'>
    <AmountWithLabel amount={section.taxesOwed} label={taxesOwedLabel} emphasis />
    <Span className='Layer__TaxSummaryCard__Operator' size='lg' variant='subtle'>=</Span>
    <AmountWithLabel amount={section.total} label={totalLabel} />
    <Span className='Layer__TaxSummaryCard__Operator' size='lg' variant='subtle'>-</Span>
    <AmountWithLabel amount={section.taxesPaid} label={taxesPaidLabel} />
  </HStack>
)

const PlusCircle = () => (
  <span className='Layer__TaxSummaryCard__OperatorCircle' aria-hidden>
    <Plus size={14} />
  </span>
)

const ArrowCircle = () => (
  <span className='Layer__TaxSummaryCard__OperatorCircle Layer__TaxSummaryCard__OperatorCircle--filled' aria-hidden>
    <ArrowRightCircle size={24} />
  </span>
)

export const TaxSummaryCardDesktop = ({ data }: TaxSummaryCardDesktopProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  const totalLabel = t('common:label.total', 'Total')
  const taxesOwedLabel = t('taxEstimates:label.taxes_owed', 'Taxes Owed')
  const taxesPaidLabel = t('taxEstimates:label.taxes_paid', 'Taxes paid')

  return (
    <div className='Layer__TaxSummaryCard'>
      <VStack className='Layer__TaxSummaryCard__Cell Layer__TaxSummaryCard__Cell--header'>
        <Span size='md'>
          {tConditional(t, 'taxEstimates:label.taxes_owed', {
            condition: projectedCondition,
            cases: {
              default: 'Taxes Owed',
              projected: 'Projected Taxes Owed',
            },
            contexts: {
              projected: 'projected',
            },
          })}
        </Span>
      </VStack>
      {data.sections.map((section, index) => (
        <HStack
          key={`${section.label}-header`}
          className='Layer__TaxSummaryCard__Cell Layer__TaxSummaryCard__Cell--header Layer__TaxSummaryCard__Cell--bordered'
          align='center'
        >
          <span className='Layer__TaxSummaryCard__OperatorIconAnchor'>
            {index === 0 ? <ArrowCircle /> : <PlusCircle />}
          </span>
          <Span size='md'>{section.label}</Span>
        </HStack>
      ))}
      <VStack className='Layer__TaxSummaryCard__Cell' gap='2xs' align='start'>
        <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
        <Span size='sm' variant='subtle'>
          {t('taxEstimates:label.taxes_due_at', 'Taxes due on {{date}}', { date: formatDate(data.taxesDueAt) })}
        </Span>
      </VStack>
      {data.sections.map(section => (
        <VStack
          key={`${section.label}-body`}
          className='Layer__TaxSummaryCard__Cell Layer__TaxSummaryCard__Cell--bordered'
        >
          <SectionEquation
            section={section}
            totalLabel={totalLabel}
            taxesOwedLabel={taxesOwedLabel}
            taxesPaidLabel={taxesPaidLabel}
          />
        </VStack>
      ))}
    </div>
  )
}
