import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { formatCalendarDate } from '@utils/time/timeUtils'
import { type TaxEstimatesDeadlineRow as TaxEstimatesDeadlineRowData } from '@hooks/features/taxEstimates/useTaxEstimatesDeadlines'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { useTaxEstimatesContext } from '@contexts/TaxEstimatesContext/TaxEstimatesContextProvider'
import { Button } from '@ui/Button/Button'
import { HStack, Stack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { StatusIcon } from '@components/TaxEstimatesDeadlineRow/StatusIcon'

import '@components/TaxEstimatesDeadlineRow/taxEstimatesDeadlineRow.scss'

const HEADING_LEVEL = 3
const ICON_SIZE = 12

type TaxEstimatesDeadlineRowProps = {
  data: TaxEstimatesDeadlineRowData
}

export const TaxEstimatesDeadlineRow = ({
  data,
}: TaxEstimatesDeadlineRowProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { year } = useTaxEstimatesYear()
  const { onClickReviewTransactions } = useTaxEstimatesContext()
  const { isMobile } = useSizeClass()
  const isAnnual = data.type === 'annual'

  return (
    <Card className='Layer__TaxOverview__DeadlineCard'>
      <HStack justify='space-between' align='start' gap='md' pb='md' pi='md'>
        <VStack className='Layer__TaxOverview__DeadlineContent' gap='3xs' fluid>
          <Heading level={HEADING_LEVEL} size='sm'>{data.title}</Heading>
          <Span size='sm' variant='subtle'>
            {t('taxEstimates:label.due_with_date', 'Due: {{date}}', { date: formatCalendarDate(data.dueDate, formatDate) })}
          </Span>
        </VStack>
        <VStack className='Layer__TaxOverview__DeadlineAmountColumn' align='end' gap='xs'>
          <VStack align='end' gap='3xs'>
            <HStack className='Layer__TaxOverview__DeadlineValueRow' align='center' gap='sm'>
              <StatusIcon status={data.state} />
              <MoneySpan size='lg' weight='bold' amount={data.amountOwed} />
            </HStack>
            <VStack align='end' gap='3xs'>
              <Span size='xs' variant='subtle'>{t('taxEstimates:label.estimated_taxes', 'Estimated taxes')}</Span>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
      {data.uncategorizedCount > 0 && (
        <Stack direction={isMobile ? 'column' : 'row'} align={isMobile ? undefined : 'center'} className='Layer__TaxOverview__DeadlineReviewRow' justify='space-between' gap='md' pb='md' pi='md'>
          <HStack className='Layer__TaxOverview__DeadlineReviewContent' align='center' gap='xs'>
            <Span nonAria className='Layer__TaxOverview__DeadlineReviewIcon'>
              <FileText size={ICON_SIZE} />
            </Span>
            <Span className='Layer__TaxOverview__DeadlineReviewLabel' size='sm' weight='bold'>
              {isAnnual
                ? tPlural(t, 'taxEstimates:label.uncategorized_transactions_with_year', {
                  count: data.uncategorizedCount,
                  one: '{{count}} uncategorized transaction ({{year}})',
                  other: '{{count}} uncategorized transactions ({{year}})',
                  year,
                })
                : tPlural(t, 'taxEstimates:label.uncategorized_transactions', {
                  count: data.uncategorizedCount,
                  one: '{{count}} uncategorized transaction',
                  other: '{{count}} uncategorized transactions',
                })}
            </Span>
          </HStack>
          {onClickReviewTransactions && (
            <Button
              variant='outlined'
              onPress={() => onClickReviewTransactions({
                uncategorizedAmount: data.uncategorizedSum,
                uncategorizedTransactionCount: data.uncategorizedCount,
              })}
            >
              {t('taxEstimates:action.review_banner', 'Review')}
            </Button>
          )}
        </Stack>
      )}
    </Card>
  )
}
