import { Check, CircleAlert, Clock3, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  type TaxOverviewData,
  type TaxOverviewDeadline,
  type TaxOverviewDeadlineStatus,
  type TaxOverviewNextTax,
} from '@schemas/taxEstimates/overview'
import { formatDate } from '@utils/format'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { Meter } from '@ui/Meter/Meter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import type { TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { TaxEstimatesOverviewSummary } from '@components/TaxEstimatesSummaryCard/TaxEstimatesOverviewSummary'

import './taxOverview.scss'

type TaxOverviewProps = {
  nextTax: TaxOverviewNextTax
  onTaxBannerReviewClick?: (payload: TaxBannerReviewPayload) => void
}

type TaxOverviewMetricRowProps = {
  amount: number
  isMobile: boolean
  label: string
  maxMeterValue: number
  meterClassName: 'Layer__TaxOverview__IncomeMeter' | 'Layer__TaxOverview__DeductionsMeter'
}

const getDeadlineAmountTone = (status?: TaxOverviewDeadlineStatus) => {
  switch (status?.kind) {
    case 'pastDue':
      return 'pastDue'
    case 'paid':
      return 'paid'
    case 'due':
      return 'due'
    case 'categorizationIncomplete':
      return 'warning'
    default:
      return 'neutral'
  }
}

const TaxOverviewDeadlineStatusIcon = ({ status }: { status?: TaxOverviewDeadlineStatus }) => {
  const tone = getDeadlineAmountTone(status)
  const Icon = (() => {
    switch (status?.kind) {
      case 'paid':
        return Check
      case 'due':
        return Clock3
      case 'pastDue':
      case 'categorizationIncomplete':
      default:
        return CircleAlert
    }
  })()

  return (
    <Span
      nonAria
      className={`Layer__TaxOverview__AmountIcon Layer__TaxOverview__AmountIcon--${tone}`}
    >
      <Icon size={12} strokeWidth={2.25} />
    </Span>
  )
}

const TaxOverviewMetricRow = ({
  amount,
  isMobile,
  label,
  maxMeterValue,
  meterClassName,
}: TaxOverviewMetricRowProps) => {
  if (isMobile) {
    return (
      <HStack className='Layer__TaxOverview__MetricCard' align='center' gap='md'>
        <Span size='md' className='Layer__TaxOverview__MetricCardLabel'>{label}</Span>
        <HStack className='Layer__TaxOverview__MetricCardMeter' align='center'>
          <Meter className={meterClassName} label={label} minValue={0} maxValue={maxMeterValue} value={amount} meterOnly />
        </HStack>
        <MoneySpan size='md' weight='bold' amount={amount} />
      </HStack>
    )
  }

  return (
    <HStack className='Layer__TaxOverview__MetricRow' justify='space-between' align='center' gap='md'>
      <Span size='md'>{label}</Span>
      <HStack className='Layer__TaxOverview__MetricValue' align='center' gap='md'>
        <MoneySpan size='md' weight='bold' amount={amount} />
        <Meter className={meterClassName} label={label} minValue={0} maxValue={maxMeterValue} value={amount} meterOnly />
      </HStack>
    </HStack>
  )
}

const TaxOverviewDeadlineCard = ({
  deadline,
  onTaxBannerReviewClick,
}: {
  deadline: TaxOverviewDeadline
  onTaxBannerReviewClick?: (payload: TaxBannerReviewPayload) => void
}) => {
  const { t } = useTranslation()
  const reviewAction = deadline.reviewAction

  return (
    <VStack className='Layer__TaxOverview__DeadlineCard' gap='md'>
      <HStack className='Layer__TaxOverview__DeadlineRow' justify='space-between' align='start' gap='md'>
        <VStack className='Layer__TaxOverview__DeadlineContent' gap='3xs'>
          <Heading level={3} size='sm'>{deadline.title}</Heading>
          <Span size='sm' variant='subtle'>
            Due:
            {' '}
            {formatDate(deadline.dueAt)}
          </Span>
        </VStack>
        <VStack className='Layer__TaxOverview__DeadlineAmountColumn' align='end' gap='xs'>
          <VStack align='end' gap='3xs'>
            <HStack className='Layer__TaxOverview__DeadlineValueRow' align='center' gap='xs'>
              <TaxOverviewDeadlineStatusIcon status={deadline.status} />
              <MoneySpan size='lg' weight='bold' amount={deadline.amount} />
            </HStack>
            <VStack className='Layer__TaxOverview__DeadlineAmountCopy' align='end' gap='3xs'>
              <Span size='xs' variant='subtle'>{deadline.description}</Span>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
      {reviewAction && (
        <HStack className='Layer__TaxOverview__DeadlineReviewRow' justify='space-between' align='center' gap='md'>
          <HStack className='Layer__TaxOverview__DeadlineReviewContent' align='center' gap='xs'>
            <Span nonAria className='Layer__TaxOverview__DeadlineReviewIcon'>
              <FileText size={12} />
            </Span>
            <Span className='Layer__TaxOverview__DeadlineReviewLabel' size='sm' weight='bold'>
              {reviewAction.payload.count}
              {' '}
              uncategorized transactions
            </Span>
          </HStack>
          <Button
            variant='outlined'
            onPress={() => onTaxBannerReviewClick?.(reviewAction.payload)}
            isDisabled={!onTaxBannerReviewClick}
          >
            {t('taxEstimates:action.review_banner', 'Review')}
          </Button>
        </HStack>
      )}
    </VStack>
  )
}

const TaxOverviewContent = ({
  data,
  nextTax,
  onTaxBannerReviewClick,
}: TaxOverviewProps & { data: TaxOverviewData }) => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { isMobile } = useSizeClass()
  const maxMeterValue = Math.max(data.incomeTotal, data.deductionsTotal, 1)

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <VStack className='Layer__TaxOverview__Grid' gap='md'>
        <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
          <Card className='Layer__TaxOverview__Card'>
            <VStack gap='xs'>
              <Heading level={2} size='md'>
                Taxable income for
                {' '}
                {year}
              </Heading>
              <Span size='sm' variant='subtle'>
                Taxable income estimate to date for year
                {' '}
                {year}
              </Span>
            </VStack>
            <VStack gap={isMobile ? 'sm' : 'md'}>
              <TaxOverviewMetricRow
                label='Total income'
                amount={data.incomeTotal}
                maxMeterValue={maxMeterValue}
                meterClassName='Layer__TaxOverview__IncomeMeter'
                isMobile={isMobile}
              />
              <TaxOverviewMetricRow
                label='Deductions'
                amount={data.deductionsTotal}
                maxMeterValue={maxMeterValue}
                meterClassName='Layer__TaxOverview__DeductionsMeter'
                isMobile={isMobile}
              />
            </VStack>
          </Card>
          <TaxEstimatesOverviewSummary
            className='Layer__TaxOverview__Card'
            title={t('taxEstimates:label.estimated_taxes_for_year', 'Estimated taxes for {{year}}', { year })}
            categories={data.estimatedTaxCategories}
            total={data.estimatedTaxesTotal}
            nextTax={nextTax}
          />
        </VStack>
        <Card className='Layer__TaxOverview__Card'>
          <VStack gap='lg'>
            <Heading level={2} size='md'>Your tax deadlines</Heading>
            <VStack gap='sm'>
              {data.paymentDeadlines.map(deadline => (
                <TaxOverviewDeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  onTaxBannerReviewClick={onTaxBannerReviewClick}
                />
              ))}
              <TaxOverviewDeadlineCard
                deadline={data.annualDeadline}
                onTaxBannerReviewClick={onTaxBannerReviewClick}
              />
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </VStack>
  )
}

type TaxOverviewViewProps = TaxOverviewProps & {
  data: TaxOverviewData
}

export const TaxOverview = ({ data, nextTax, onTaxBannerReviewClick }: TaxOverviewViewProps) => (
  <TaxOverviewContent
    data={data}
    nextTax={nextTax}
    onTaxBannerReviewClick={onTaxBannerReviewClick}
  />
)
