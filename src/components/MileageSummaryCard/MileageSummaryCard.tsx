import { useMemo, useState } from 'react'

import { convertCentsToCurrency } from '@utils/format'
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
    const formattedDeductionRate = convertCentsToCurrency(
      currentMonthMileageData?.deductionRate ?? 0,
    )

    return {
      currentYear,
      currentMileageData,
      currentMonthMileageData,
      formattedDeductionRate,
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
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-header Layer__MileageSummaryCard__Panel-left'>
          <Span size='lg'>Miles this month</Span>
          <ArrowRightCircleAlt size={24} className='Layer__MileageSummaryCard__Panel-header-arrow-icon' />
        </HStack>
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-header'>
          <HStack gap='xs' className='Layer__MileageSummaryCard__Panel-header-content'>
            <Span
              size='lg'
              className='Layer__MileageSummaryCard__Panel-header-tax-deduction-label'
            >
              Tax Deduction
            </Span>
            <Badge size={BadgeSize.MEDIUM} variant={BadgeVariant.NEUTRAL}>
              {`Standard Rate: ${formattedDeductionRate}/mile`}
            </Badge>
          </HStack>
        </HStack>

        {/* Value */}
        <HStack align='center' className='Layer__MileageSummaryCard__Panel-value Layer__MileageSummaryCard__Panel-left'>
          <Span size='xl' weight='bold'>
            {currentMonthMileageData?.miles ?? 0}
            {' '}
            mi
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
    <VStack gap='md' pb='md' pi='lg'>
      <HStack gap='md' justify='space-between'>
        <Span size='lg' weight='bold' pb='2xs'>
          Mileage Tracking
        </Span>
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
