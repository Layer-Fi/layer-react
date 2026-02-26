import { useMemo, useState } from 'react'

import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
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

import './mileageCard.scss'

export const MileageCard = () => {
  const { data: mileageData } = useMileageSummary()
  const { date } = useGlobalDate({ dateSelectionMode: 'full' })
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)

  const {
    currentYear,
    currentMileageData,
    currentMonthMileageData,
    formattedDeductionRate,
  } = useMemo(() => {
    const nextCurrentYear = date.getFullYear()
    const currentMonth = date.getMonth() + 1
    const nextCurrentMileageData = mileageData?.years.find(year => year.year === nextCurrentYear)
    const nextCurrentMonthMileageData = nextCurrentMileageData?.months.find(month => month.month === currentMonth)
    const rawDeductionRate = nextCurrentMonthMileageData?.deductionRate ?? 0
    const normalizedDeductionRate = rawDeductionRate > 1 ? rawDeductionRate / 100 : rawDeductionRate

    return {
      currentYear: nextCurrentYear,
      currentMileageData: nextCurrentMileageData,
      currentMonthMileageData: nextCurrentMonthMileageData,
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

  const mileageContent = (
    <>
      <Card className='Layer__mileage-card'>
        <HStack className='Layer__mileage-card__panel' justify='space-around'>
          <VStack className='Layer__mileage-card__panel-body Layer__mileage-card__panel-body-miles' align='center'>
            <HStack align='center' gap='sm'>
              <Text size={TextSize.lg}>Miles this month</Text>
            </HStack>
            <HStack align='center'>
              <Span size='xl' weight={TextWeight.bold}>
                {currentMonthMileageData?.miles ?? 0}
                {' '}
                mi
              </Span>
            </HStack>
          </VStack>

          <VStack className='Layer__mileage-card__panel-body Layer__mileage-card__panel-body-deduction' align='center'>
            <HStack align='center' gap='sm'>
              <Text size={TextSize.lg}>Tax Deduction</Text>
              <Badge size={BadgeSize.SMALL} variant={BadgeVariant.DEFAULT}>
                Standard Rate: $
                {formattedDeductionRate}
                /mile
              </Badge>
            </HStack>
            <HStack align='center'>
              <MoneySpan
                size='xl'
                weight={TextWeight.bold}
                amount={currentMonthMileageData?.estimatedDeduction ?? 0}
                className='Layer__green-money-span'
              />
            </HStack>
          </VStack>
        </HStack>
      </Card>
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
          <Span size='sm' variant='subtle'>Total tax deduction: </Span>
          <MoneySpan size='sm' amount={currentMileageData?.estimatedDeduction ?? 0} />
        </HStack>
      </HStack>
    </>
  )

  return (
    <VStack gap='md' pb='lg' pi='lg'>
      <HStack gap='md' justify='space-between'>
        <Text size={TextSize.lg} weight={TextWeight.bold} pb='xs'>Mileage Tracking</Text>
        <Button onPress={onRecordTrip}>
          Add Trip
          <Plus size={16} />
        </Button>
      </HStack>
      {mileageContent}
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
