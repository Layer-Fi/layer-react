import { useCallback, useState } from 'react'

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
  const { data: mileageData, isLoading, isError } = useMileageSummary()
  const { date } = useGlobalDate({ dateSelectionMode: 'full' })
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false)
  console.log('date', date)
  console.log('isLoading', isLoading)
  console.log('isError', isError)
  // Need to compare the current date and grab the month and year after this I need to grab that specific mileage data from mileageData
  // Note that the date will change so we need to reredner the component if it does
  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth() + 1
  const currentMileageData = mileageData?.years.find(year => year.year === currentYear)
  const currentMonthMileageData = currentMileageData?.months.find(month => month.month === currentMonth)
  console.log('currentMonthMileageData', currentMonthMileageData)

  const onViewOrUpsertTrip = useCallback(() => {
    setIsTripDrawerOpen(true)
  }, [])

  const onRecordTrip = useCallback(() => onViewOrUpsertTrip(), [onViewOrUpsertTrip])

  return (
    <VStack gap='md' pb='lg' pi='lg'>
      <HStack gap='md' justify='space-between'>
        <Text size={TextSize.lg} weight={TextWeight.bold}>Mileage Tracking</Text>
        <Button onPress={onRecordTrip}>
          Add Trip
          <Plus size={16} />
        </Button>
      </HStack>
      <HStack>
        <Card>

          <HStack justify='space-between'>
            <Text size={TextSize.lg} weight={TextWeight.bold}>Miles this month</Text>
            <Text size={TextSize.lg} weight={TextWeight.bold}>Tax Deduction</Text>
            <Badge size={BadgeSize.EXTRA_SMALL} variant={BadgeVariant.INFO}>
              Standard Rate $0.
              {currentMonthMileageData?.deductionRate}
              /mile
            </Badge>
          </HStack>

          <HStack>
            <Text size={TextSize.lg} weight={TextWeight.bold}>
              {currentMonthMileageData?.miles}
              {' '}
              mi
            </Text>
            <MoneySpan size='sm' amount={currentMonthMileageData?.estimatedDeduction ?? 0} className='Layer__green-money-span' />
          </HStack>
        </Card>
      </HStack>
      <HStack gap='md' justify='space-between'>
        <HStack gap='xs'>
          <Span size='sm' variant='subtle'>
            Total miles in
            {' '}
            {currentYear.toString()}
            :
            {' '}
          </Span>
          <Span size='sm'>{currentMileageData?.miles}</Span>
        </HStack>
        <HStack gap='xs'>
          <Span size='sm' variant='subtle'>Total tax deduction: </Span>
          <MoneySpan size='sm' amount={currentMileageData?.estimatedDeduction ?? 0} />
        </HStack>
      </HStack>
      <TripDrawer
        isOpen={isTripDrawerOpen}
        onOpenChange={setIsTripDrawerOpen}
        trip={null}
        onSuccess={() => setIsTripDrawerOpen(false)}
        onDeleteTrip={() => {}}
      />
    </VStack>
  )
}
