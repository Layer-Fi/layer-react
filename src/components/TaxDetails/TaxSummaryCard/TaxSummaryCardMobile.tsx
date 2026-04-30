import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaxSummary, TaxSummarySection } from '@schemas/taxEstimates/summary'
import { tConditional } from '@utils/i18n/conditional'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { EquationRow } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCardEquation'

type TaxSummaryCardMobileProps = {
  data: TaxSummary
}

type SectionEquationProps = {
  section: TaxSummarySection
}

const SectionEquation = ({ section }: SectionEquationProps) => (
  <VStack className='Layer__TaxSummaryCard__MobileSection' gap='xs' align='start'>
    <Span size='sm' variant='subtle'>{section.label}</Span>
    <EquationRow section={section} />
  </VStack>
)

export const TaxSummaryCardMobile = ({ data }: TaxSummaryCardMobileProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const [isExpanded, setIsExpanded] = useState(false)
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  return (
    <Card className='Layer__TaxSummaryCard--mobile'>
      <VStack className='Layer__TaxSummaryCard__MobileCard' gap='md'>
        <HStack justify='space-between' align='center'>
          <Span size='sm'>
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
          <Span size='sm' variant='subtle'>
            {t('taxEstimates:label.taxes_due_at', 'Taxes due on {{date}}', { date: formatDate(data.taxesDueAt) })}
          </Span>
        </HStack>
        <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
        {isExpanded && (
          <VStack className='Layer__TaxSummaryCard__MobileSections' gap='md'>
            {data.sections.map(section => (
              <Fragment key={section.label}>
                <SectionEquation section={section} />
              </Fragment>
            ))}
          </VStack>
        )}
        <HStack justify='center'>
          <button
            type='button'
            className='Layer__TaxSummaryCard__MobileToggle'
            onClick={() => setIsExpanded(prev => !prev)}
          >
            {isExpanded
              ? t('common:label.hide_details', 'Hide details')
              : t('common:label.show_details', 'Show details')}
          </button>
        </HStack>
      </VStack>
    </Card>
  )
}
