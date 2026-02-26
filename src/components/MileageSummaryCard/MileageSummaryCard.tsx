import { useMemo, useState } from 'react'

import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import ArrowRightCircleAlt from '@icons/ArrowRightCircleAlt'
import Plus from '@icons/Plus'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { Card } from '@components/Card/Card'
import { TripDrawer } from '@components/Trips/TripDrawer/TripDrawer'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { useMileageSummary } from '@features/mileage/api/useMileageSummary'

import './mileageSummaryCard.scss'

export const MileageSummaryCard = () => {
  const { data: mileageData } = useMileageSummary()
  const { date } = useGlobalDate({ dateSelectionMode: 'full' })
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)

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
    const rawDeductionRate = currentMonthMileageData?.deductionRate ?? 0
    const normalizedDeductionRate =
      rawDeductionRate > 1 ? rawDeductionRate / 100 : rawDeductionRate

    return {
      currentYear,
      currentMileageData,
      currentMonthMileageData,
      formattedDeductionRate: normalizedDeductionRate.toFixed(2),
    }
  }, [date, mileageData])

  const onRecordTrip = () => {
    setIsTripDrawerOpen(true)
  }
  const onTripDrawerSuccess = () => {
    setIsTripDrawerOpen(false)
  }
  const onDeleteTrip = () => {}

  const mileageSummaryCardContent = (
    <Card className='Layer__MileageSummaryCard'>
      <HStack className='Layer__MileageSummaryCard__Panel'>
        {/* Header */}
        <div className='Layer__MileageSummaryCard__Panel-header Layer__MileageSummaryCard__Panel-left'>
          <Text size={TextSize.lg}>Miles this month</Text>
          <ArrowRightCircleAlt size={24} className='Layer__MileageSummaryCard__Panel-header-arrow-icon' arrowColor='var(--color-base-500)' outerCircleColor='var(--color-base-400)' />
        </div>
        <div className='Layer__MileageSummaryCard__Panel-header'>
          <div className='Layer__MileageSummaryCard__Panel-header-content'>
            <Text
              size={TextSize.lg}
              className='Layer__MileageSummaryCard__Panel-header-tax-deduction-label'
            >
              Tax Deduction
            </Text>
            <Badge size={BadgeSize.MEDIUM} variant={BadgeVariant.STANDARD}>
              Standard Rate: $
              {formattedDeductionRate}
              /mile
            </Badge>
          </div>
        </div>

        {/* Value */}
        <div className='Layer__MileageSummaryCard__Panel-value Layer__MileageSummaryCard__Panel-left'>
          <Span size='xl' weight={TextWeight.bold}>
            {currentMonthMileageData?.miles ?? 0}
            {' '}
            mi
          </Span>
        </div>
        <div className='Layer__MileageSummaryCard__Panel-value'>
          <MoneySpan
            size='xl'
            weight={TextWeight.bold}
            amount={currentMonthMileageData?.estimatedDeduction ?? 0}
            className='Layer__green-money-span'
          />
        </div>
      </HStack>
    </Card>
  )

  return (
    <VStack gap='md' pb='md' pi='lg'>
      <HStack gap='md' justify='space-between'>
        <Text size={TextSize.lg} weight={TextWeight.bold} pb='2xs'>
          Mileage Tracking
        </Text>
        <Button onPress={onRecordTrip}>
          Add Trip
          <Plus size={16} />
        </Button>
      </HStack>
      {mileageSummaryCardContent}
      <HStack gap='md' justify='space-between'>
        <HStack gap='xs'>
          <Span size='sm' variant='subtle'>
            Total miles in
            {' '}
            {currentYear.toString()}
            :
            {' '}
          </Span>
          <Span size='sm'>{currentMileageData?.miles ?? 0}</Span>
        </HStack>
        <HStack gap='xs'>
          <Span size='sm' variant='subtle'>
            Total tax deduction:
            {' '}
          </Span>
          <MoneySpan
            size='sm'
            amount={currentMileageData?.estimatedDeduction ?? 0}
          />
        </HStack>
      </HStack>
      <TripDrawer
        isOpen={isTripDrawerOpen}
        onOpenChange={setIsTripDrawerOpen}
        trip={null}
        onSuccess={onTripDrawerSuccess}
        onDeleteTrip={onDeleteTrip}
      />
    </VStack>
  )
}
