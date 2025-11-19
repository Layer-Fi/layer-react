import { useMemo } from 'react'
import { getYear } from 'date-fns'
import { useMileageSummary } from '@features/mileage/api/useMileageSummary'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'
import { Container } from '@components/Container/Container'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import './mileageTrackingStats.scss'

const CLASS_NAME = 'Layer__MileageTrackingStats'

export const MileageTrackingStats = () => {
  const { data: mileageData, isLoading, isError } = useMileageSummary()
  const { startDate } = useGlobalDateRange({ displayMode: 'full' })
  const selectedYear = getYear(startDate)

  const selectedYearData = useMemo(() => {
    return mileageData?.years.find(y => y.year === selectedYear)
  }, [mileageData, selectedYear])

  const chartData = useMemo(() => {
    if (!selectedYearData) {
      return {
        years: [{
          year: selectedYear,
          months: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            miles: 0,
            estimatedDeduction: 0,
          })),
        }],
      }
    }
    return {
      years: [{
        year: selectedYearData.year,
        months: selectedYearData.months.map(month => ({
          month: month.month,
          miles: month.miles,
          estimatedDeduction: month.estimatedDeduction,
        })),
      }],
    }
  }, [selectedYearData, selectedYear])



  if (isLoading) {
    return (
      <Container name='mileage-tracking-stats' asWidget>
        <HStack className={`${CLASS_NAME}__Content`} gap='lg' justify='center' align='center'>
          <Loader />
        </HStack>
      </Container>
    )
  }

  if (isError || !mileageData) {
    return (
      <Container name='mileage-tracking-stats' asWidget>
        <DataState status={DataStateStatus.failed} title='Failed to load mileage data' />
      </Container>
    )
  }

  return (
    <Container name='mileage-tracking-stats' asWidget>
      <HStack className={`${CLASS_NAME}__Content`} gap='lg'>
        <VStack className={`${CLASS_NAME}__Cards`} gap='md' justify='center'>
          <VStack className={`${CLASS_NAME}__Card`} gap='3xs'>
            <Span size='md'>Total Deduction</Span>
            <MoneySpan
              amount={selectedYearData?.estimatedDeduction ?? 0}
              size='lg'
              bold
            />
          </VStack>

          <VStack className={`${CLASS_NAME}__Card`} gap='3xs'>
            <Span size='md'>Total Miles</Span>
            <Span size='lg' weight='bold'>
              {(selectedYearData?.miles ?? 0).toLocaleString()}
            </Span>
            <HStack gap='md'>
              <VStack gap='3xs'>
                <Span size='xs' variant='subtle'>Business</Span>
                <Span size='sm'>
                  {(selectedYearData?.businessMiles ?? 0).toLocaleString()}
                </Span>
              </VStack>
              <VStack gap='3xs'>
                <Span size='xs' variant='subtle'>Personal</Span>
                <Span size='sm'>
                  {(selectedYearData?.personalMiles ?? 0).toLocaleString()}
                </Span>
              </VStack>
              <VStack gap='3xs'>
                <Span size='xs' variant='subtle'>Uncategorized</Span>
                <Span size='sm'>
                  {(selectedYearData?.uncategorizedMiles ?? 0).toLocaleString()}
                </Span>
              </VStack>
            </HStack>
          </VStack>

          <VStack className={`${CLASS_NAME}__Card`} gap='3xs'>
            <Span size='md'>Trips</Span>
            <Span size='lg' weight='bold'>
              {(selectedYearData?.trips ?? 0).toLocaleString()}
            </Span>
            <HStack gap='md'>
              <VStack gap='3xs'>
                <Span size='xs' variant='subtle'>Business</Span>
                <Span size='sm'>
                  {(selectedYearData?.businessTrips ?? 0).toLocaleString()}
                </Span>
              </VStack>
              <VStack gap='3xs'>
                <Span size='xs' variant='subtle'>Personal</Span>
                <Span size='sm'>
                  {(selectedYearData?.personalTrips ?? 0).toLocaleString()}
                </Span>
              </VStack>
              <VStack gap='3xs'>
                <Span size='xs' variant='subtle'>Uncategorized</Span>
                <Span size='sm'>
                  {(selectedYearData?.uncategorizedTrips ?? 0).toLocaleString()}
                </Span>
              </VStack>
            </HStack>
          </VStack>
        </VStack>

        <VStack fluid justify='end'>
          <MileageDeductionChart data={chartData} selectedYear={selectedYear} />
        </VStack>
      </HStack>
    </Container>
  )
}
