import { useTranslation } from 'react-i18next'

import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { formatDate } from '@utils/format'
import { tConditional } from '@utils/i18n/conditional'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type TaxSummaryCardDesktopProps = {
  data: TaxSummary
}

export const TaxSummaryCardDesktop = ({ data }: TaxSummaryCardDesktopProps) => {
  const { t } = useTranslation()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  return (
    <HStack className='Layer__TaxSummaryCard'>
      <VStack className='Layer__TaxSummaryCard__Overview' gap='xs' justify='center' align='center'>
        <VStack justify='center' align='center'>
          <Span size='md' variant='subtle'>
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
          <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
        </VStack>
        <VStack align='center'>
          <Span size='sm' variant='subtle'>{t('taxEstimates:label.taxes_due', 'Taxes Due')}</Span>
          <Span size='md'>{formatDate(data.taxesDueAt)}</Span>
        </VStack>
      </VStack>
      <VStack className='Layer__TaxSummaryCard__Breakdown'>
        <div className='Layer__TaxSummaryCard__Grid'>
          {data.sections.map(section => (
            <div key={section.label} className='Layer__TaxSummaryCard__SectionGroup'>
              <Span size='md' variant='subtle'>{section.label}</Span>
              <MoneySpan size='xl' weight='bold' amount={section.taxesOwed} />
              <Span size='md' variant='subtle'>=</Span>
              <MoneySpan size='lg' amount={section.total} />
              <Span size='md' variant='subtle'>-</Span>
              <MoneySpan size='lg' amount={section.taxesPaid} />
              <span />
              <span />
              <Span size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
              <span />
              <Span size='sm' variant='subtle'>{t('taxEstimates:label.taxes_paid', 'Taxes Paid')}</Span>
            </div>
          ))}
        </div>
      </VStack>
    </HStack>
  )
}
