import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMileageSummary } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import ArrowRightCircleAlt from '@icons/ArrowRightCircleAlt'
import Plus from '@icons/Plus'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { TripDrawer } from '@components/Trips/TripDrawer/TripDrawer'

import './mileageSummaryCard.scss'

type DistanceUnit = 'miles' | 'kilometers'
const DISTANCE_UNIT: DistanceUnit = 'miles'

export const MileageSummaryCard = () => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { data: mileageData, isLoading, isError } = useMileageSummary()
  const { isMobile } = useSizeClass()
  const { date } = useGlobalDate({ dateSelectionMode: 'full' })
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)

  const isMilesUnit = DISTANCE_UNIT === 'miles' as DistanceUnit
  const distanceUnitSuffix = isMilesUnit ? 'mi' : 'km'
  const distanceUnitLabel = isMilesUnit ? 'Miles' : 'Kilometers'
  const distanceThisMonthLabel = isMilesUnit
    ? t('mileageTracking:label.miles_month', `${distanceUnitLabel} this month`)
    : t('mileageTracking:label.kilometers_month', `${distanceUnitLabel} this month`)
  const totalDistanceLabel = isMilesUnit
    ? t('mileageTracking:label.total_miles', `Total ${distanceUnitLabel}`)
    : t('mileageTracking:label.total_kilometers', `Total ${distanceUnitLabel}`)

  const {
    currentYear,
    currentMileageData,
    currentMonthMileageData,
    formattedDeductionRate,
  } = useMemo(() => {
    const currentYear = date.getFullYear()
    const currentMonth = date.getMonth() + 1
    const currentMileageData = mileageData?.years.find(
      year => year.year === currentYear,
    )
    const currentMonthMileageData = currentMileageData?.months.find(
      month => month.month === currentMonth,
    )
    const formattedDeductionRate = formatCurrencyFromCents(
      currentMonthMileageData?.deductionRate ?? 0,
    )

    return {
      currentYear,
      currentMileageData,
      currentMonthMileageData,
      formattedDeductionRate,
    }
  }, [date, formatCurrencyFromCents, mileageData])

  const onRecordTrip = () => {
    setIsTripDrawerOpen(true)
  }
  const onTripDrawerSuccess = () => {
    setIsTripDrawerOpen(false)
  }
  const onDeleteTrip = () => {}

  if (isError) {
    return (
      <Card className='Layer__MileageSummaryCard__Container'>
        <VStack gap='md'>
          <VStack pbe='lg' pbs='lg' pi='lg'>
            <DataState
              status={DataStateStatus.failed}
              title={t('mileageTracking:error.load_mileage_data', 'An error occurred while loading your mileage data. Please check your connection and try again.')}
              spacing
            />
          </VStack>
        </VStack>
      </Card>
    )
  }

  if (isLoading || !mileageData) {
    return (
      <Card className='Layer__MileageSummaryCard__Container'>
        <VStack gap='md'>
          <HStack className='Layer__SummaryCard__ContainerHeader' align='center' gap='md' justify='space-between' pi='lg' pbe='lg' pbs='lg'>
            <SkeletonLoader height='24px' width='160px' />
            <SkeletonLoader height='32px' width='100px' />
          </HStack>
          <VStack pi='lg'>
            <Card className='Layer__MileageSummaryCard'>
              <HStack className='Layer__MileageSummaryCard__Panel'>
                <HStack align='center' className='Layer__MileageSummaryCard__Panel-header Layer__MileageSummaryCard__Panel-left'>
                  <SkeletonLoader height='20px' width='120px' />
                </HStack>
                <HStack align='center' className='Layer__MileageSummaryCard__Panel-header'>
                  <HStack gap='xs' className='Layer__MileageSummaryCard__Panel-header-content'>
                    <SkeletonLoader height='20px' width='110px' />
                    <SkeletonLoader height='24px' width='180px' />
                  </HStack>
                </HStack>
                <HStack align='center' className='Layer__MileageSummaryCard__Panel-value Layer__MileageSummaryCard__Panel-left'>
                  <SkeletonLoader height='28px' width='80px' />
                </HStack>
                <HStack align='center' className='Layer__MileageSummaryCard__Panel-value'>
                  <SkeletonLoader height='28px' width='100px' />
                </HStack>
              </HStack>
            </Card>
          </VStack>
        </VStack>
      </Card>
    )
  }

  const mileageSummaryCardContent = (
    <Card className='Layer__MileageSummaryCard'>
      <HStack className='Layer__MileageSummaryCard__Panel'>
        {/* Header */}
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-header Layer__MileageSummaryCard__Panel-left'>
          <Span size='lg'>{distanceThisMonthLabel}</Span>
          <ArrowRightCircleAlt size={24} className='Layer__MileageSummaryCard__Panel-header-arrow-icon' />
        </HStack>
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-header'>
          <HStack gap='xs' className='Layer__MileageSummaryCard__Panel-header-content'>
            <Span
              size='lg'
              className='Layer__MileageSummaryCard__Panel-header-tax-deduction-label'
            >
              {t('mileageTracking:label.tax_deduction', 'Tax Deduction')}
            </Span>
            <Badge size={isMobile ? BadgeSize.SMALL : BadgeSize.MEDIUM} variant={BadgeVariant.NEUTRAL}>
              {t('mileageTracking:label.standard_rate_formatted_deduction', 'Standard Rate: {{formattedDeductionRate}}/{{distanceUnit}}', { formattedDeductionRate, distanceUnit: distanceUnitSuffix })}
            </Badge>
          </HStack>
        </HStack>

        {/* Value */}
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-value Layer__MileageSummaryCard__Panel-left'>
          <Span size='xl' weight='bold'>
            {currentMonthMileageData?.miles ?? 0}
            {' '}
            {distanceUnitSuffix}
          </Span>
        </HStack>
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-value'>
          <MoneySpan
            size='xl'
            weight='bold'
            amount={currentMonthMileageData?.estimatedDeduction ?? 0}
            status='success'
          />
        </HStack>
      </HStack>
    </Card>
  )

  return (
    <>
      <Card className='Layer__MileageSummaryCard__Container'>
        <VStack gap='md'>
          <HStack className='Layer__SummaryCard__ContainerHeader' align='center' gap='md' justify='space-between' pi='lg' pbe='lg' pbs='lg'>
            <Span size='lg' weight='bold'>
              {t('mileageTracking:label.mileage_tracking', 'Mileage Tracking')}
            </Span>
            <Button onPress={onRecordTrip}>
              {t('trips:action.add_trip', 'Add Trip')}
              <Plus size={16} />
            </Button>
          </HStack>
          <VStack pi='lg'>
            {mileageSummaryCardContent}
          </VStack>
          <HStack className='Layer__SummaryCard__ContainerFooter' gap='xs' justify='space-between' pi='lg' pbe='md'>
            <HStack gap='xs'>
              <Span size='sm' variant='subtle'>
                {totalDistanceLabel}
                {' '}
                in
                {' '}
                {currentYear.toString()}
                :
                {' '}
              </Span>
              <Span size='sm'>
                {currentMileageData?.miles ?? 0}
                {' '}
                {distanceUnitSuffix}
              </Span>
            </HStack>
            <HStack gap='xs'>
              <Span size='sm' variant='subtle'>
                {t('mileageTracking:label.total_tax_deduction', 'Total tax deduction:')}
                {' '}
              </Span>
              <MoneySpan
                size='sm'
                amount={currentMileageData?.estimatedDeduction ?? 0}
              />
            </HStack>
          </HStack>
        </VStack>
      </Card>
      <TripDrawer
        isOpen={isTripDrawerOpen}
        onOpenChange={setIsTripDrawerOpen}
        trip={null}
        onSuccess={onTripDrawerSuccess}
        onDeleteTrip={onDeleteTrip}
      />
    </>
  )
}
