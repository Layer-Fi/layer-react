import { useTranslation } from 'react-i18next'

import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { tConditional } from '@utils/i18n/conditional'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import ArrowRightCircleAlt from '@icons/ArrowRightCircleAlt'
import Plus from '@icons/Plus'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type TaxSummaryCardDesktopProps = {
  data: TaxSummary
}

export const TaxSummaryCardDesktop = ({ data }: TaxSummaryCardDesktopProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const taxesDueLabel = `${t('taxEstimates:label.taxes_due', 'Taxes Due')}: ${formatDate(data.taxesDueAt)}`

  return (
    <VStack className='Layer__TaxSummaryCard'>
      <VStack className='Layer__TaxSummaryCard__Inner'>
        <HStack className='Layer__TaxSummaryCard__Header'>
          <VStack className='Layer__TaxSummaryCard__HeaderCell Layer__TaxSummaryCard__HeaderCell--overview' justify='center'>
            <Span size='lg' variant='subtle'>
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
            <VStack key={section.label} className='Layer__TaxSummaryCard__HeaderCell Layer__TaxSummaryCard__HeaderCell--section' justify='center'>
              <Span nonAria className='Layer__TaxSummaryCard__HeaderConnector'>
                {index === 0
                  ? <ArrowRightCircleAlt size={30} />
                  : (
                    <Span nonAria className='Layer__TaxSummaryCard__PlusConnector'>
                      <Plus size={14} />
                    </Span>
                  )}
              </Span>
              <Span size='lg' variant='subtle'>{section.label}</Span>
            </VStack>
          ))}
        </HStack>
        <HStack className='Layer__TaxSummaryCard__Body'>
          <VStack className='Layer__TaxSummaryCard__BodyCell Layer__TaxSummaryCard__BodyCell--overview' gap='sm' justify='center'>
            <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
            <Span size='md' variant='subtle'>{taxesDueLabel}</Span>
          </VStack>
          {data.sections.map(section => (
            <VStack key={section.label} className='Layer__TaxSummaryCard__BodyCell Layer__TaxSummaryCard__BodyCell--section' gap='sm' justify='center'>
              <HStack className='Layer__TaxSummaryCard__Formula' align='baseline'>
                <MoneySpan size='lg' weight='bold' amount={section.taxesOwed} />
                <Span size='md' variant='subtle'>=</Span>
                <MoneySpan size='lg' amount={section.total} />
                <Span size='md' variant='subtle'>-</Span>
                <MoneySpan size='lg' amount={section.taxesPaid} />
              </HStack>
              <HStack className='Layer__TaxSummaryCard__FormulaLabels'>
                <Span className='Layer__TaxSummaryCard__FormulaLabel' size='sm' variant='subtle'>{t('taxEstimates:label.taxes_owed', 'Taxes Owed')}</Span>
                <Span className='Layer__TaxSummaryCard__FormulaLabelPlaceholder' size='sm' variant='subtle' />
                <Span className='Layer__TaxSummaryCard__FormulaLabel' size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
                <Span className='Layer__TaxSummaryCard__FormulaLabelPlaceholder' size='sm' variant='subtle' />
                <Span className='Layer__TaxSummaryCard__FormulaLabel' size='sm' variant='subtle'>{t('taxEstimates:label.taxes_paid', 'Taxes Paid')}</Span>
              </HStack>
            </VStack>
          ))}
        </HStack>
      </VStack>
    </VStack>
  )
}
