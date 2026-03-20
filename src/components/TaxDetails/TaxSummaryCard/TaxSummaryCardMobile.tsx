import { useTranslation } from 'react-i18next'

import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { tConditional } from '@utils/i18n/conditional'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

type TaxSummaryCardMobileProps = {
  data: TaxSummary
}

export const TaxSummaryCardMobile = ({ data }: TaxSummaryCardMobileProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  return (
    <VStack className='Layer__TaxSummaryCard--mobile' gap='md'>
      <Card className='Layer__TaxSummaryCard__OverviewCard'>
        <VStack gap='xs' justify='center' align='center'>
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
      </Card>
      <Card className='Layer__TaxSummaryCard__BreakdownCard'>
        <div className='Layer__TaxSummaryCard__Grid Layer__TaxSummaryCard__Grid--mobile'>
          {data.sections.map(section => (
            <div key={section.label} className='Layer__TaxSummaryCard__SectionGroup'>
              <Span size='sm' variant='subtle'>{section.label}</Span>
              <MoneySpan size='lg' weight='bold' amount={section.taxesOwed} />
              <Span size='sm' variant='subtle'>=</Span>
              <MoneySpan size='md' amount={section.total} />
              <Span size='sm' variant='subtle'>-</Span>
              <MoneySpan size='md' amount={section.taxesPaid} />
              <span />
              <span />
              <Span size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
              <span />
              <Span size='sm' variant='subtle'>{t('taxEstimates:label.taxes_paid', 'Taxes Paid')}</Span>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  )
}
