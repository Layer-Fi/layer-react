import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaxSummary } from '@schemas/taxEstimates/summary'
import { formatDate } from '@utils/format'
import { tConditional } from '@utils/i18n/conditional'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import Plus from '@icons/Plus'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type TaxSummaryCardMobileProps = {
  data: TaxSummary
}

export const TaxSummaryCardMobile = ({ data }: TaxSummaryCardMobileProps) => {
  const { t } = useTranslation()
  const { fullYearProjection } = useFullYearProjection()
  const [isDetailsVisible, setIsDetailsVisible] = useState(false)
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const taxesDueLabel = `${t('taxEstimates:label.taxes_due', 'Taxes Due')}: ${formatDate(data.taxesDueAt)}`

  return (
    <VStack className='Layer__TaxSummaryCard Layer__TaxSummaryCard--mobile'>
      <VStack className='Layer__TaxSummaryCard__Inner'>
        <VStack className='Layer__TaxSummaryCard__Overview Layer__TaxSummaryCard__Overview--mobile' gap='md'>
          <HStack className='Layer__TaxSummaryCard__OverviewHeader' justify='space-between' align='start' gap='sm'>
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
            <Span className='Layer__TaxSummaryCard__TaxesDueLabel' size='md' variant='subtle' align='right'>{taxesDueLabel}</Span>
          </HStack>
          <MoneySpan size='xl' weight='bold' amount={data.projectedTaxesOwed} />
        </VStack>
        {isDetailsVisible && (
          <VStack className='Layer__TaxSummaryCard__Breakdown Layer__TaxSummaryCard__Breakdown--mobile' gap='md'>
            {data.sections.map((section, index) => (
              <VStack key={section.label} gap='md'>
                {index > 0 && (
                  <HStack className='Layer__TaxSummaryCard__MobileConnector' align='center'>
                    <Span nonAria className='Layer__TaxSummaryCard__MobileConnectorLine' />
                    <Span nonAria className='Layer__TaxSummaryCard__PlusConnector'>
                      <Plus size={14} />
                    </Span>
                    <Span nonAria className='Layer__TaxSummaryCard__MobileConnectorLine' />
                  </HStack>
                )}
                <VStack className='Layer__TaxSummaryCard__Section Layer__TaxSummaryCard__Section--mobile' gap='xs'>
                  <Span size='md' variant='subtle'>{section.label}</Span>
                  <HStack className='Layer__TaxSummaryCard__Formula Layer__TaxSummaryCard__Formula--mobile' align='baseline'>
                    <MoneySpan size='lg' weight='bold' amount={section.total} />
                    <Span size='sm' variant='subtle'>=</Span>
                    <MoneySpan size='md' amount={section.taxesOwed} />
                    <Span size='sm' variant='subtle'>-</Span>
                    <MoneySpan size='md' amount={section.taxesPaid} />
                  </HStack>
                  <HStack className='Layer__TaxSummaryCard__FormulaLabels Layer__TaxSummaryCard__FormulaLabels--mobile'>
                    <Span className='Layer__TaxSummaryCard__FormulaLabel' size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
                    <Span className='Layer__TaxSummaryCard__FormulaLabelPlaceholder' size='sm' variant='subtle' />
                    <Span className='Layer__TaxSummaryCard__FormulaLabel' size='sm' variant='subtle'>{t('taxEstimates:label.taxes_owed', 'Taxes Owed')}</Span>
                    <Span className='Layer__TaxSummaryCard__FormulaLabelPlaceholder' size='sm' variant='subtle' />
                    <Span className='Layer__TaxSummaryCard__FormulaLabel' size='sm' variant='subtle'>{t('taxEstimates:label.taxes_paid', 'Taxes Paid')}</Span>
                  </HStack>
                </VStack>
              </VStack>
            ))}
          </VStack>
        )}
        <VStack align='center' className='Layer__TaxSummaryCard__DetailsToggleContainer'>
          <Button
            onPress={() => setIsDetailsVisible(prev => !prev)}
            variant='text'
          >
            {isDetailsVisible
              ? t('taxEstimates:action.hide_details', 'Hide details')
              : t('taxEstimates:action.show_details', 'Show details')}
          </Button>
        </VStack>
      </VStack>
    </VStack>
  )
}
