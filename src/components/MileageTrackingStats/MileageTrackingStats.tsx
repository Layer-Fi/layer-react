import { useCallback, useMemo, useState } from 'react'
import { startOfYear, getYear } from 'date-fns'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { useMileageSummary } from '@features/mileage/api/useMileageSummary'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'
import { Container } from '@components/Container/Container'
import { Header } from '@components/Header/Header'
import { HeaderRow } from '@components/Header/HeaderRow'
import { HeaderCol } from '@components/Header/HeaderCol'
import { Heading } from '@ui/Typography/Heading'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import './mileageTrackingStats.scss'

type YearOption = {
  label: string
  value: string
}

const CLASS_NAME = 'Layer__MileageTrackingStats'

export const MileageTrackingStats = () => {
  const activationDate = useBusinessActivationDate()
  const { data: mileageData, isLoading, isError } = useMileageSummary()
  const currentYear = getYear(new Date())

  const yearOptions = useMemo<YearOption[]>(() => {
    if (!activationDate) {
      return [{ label: String(currentYear), value: String(currentYear) }]
    }

    const activationYear = getYear(startOfYear(activationDate))
    const years: YearOption[] = []

    for (let year = currentYear; year >= activationYear; year--) {
      years.push({ label: String(year), value: String(year) })
    }

    return years
  }, [activationDate, currentYear])

  const [selectedYearOption, setSelectedYearOption] = useState<YearOption>(yearOptions[0])
  const selectedYear = Number(selectedYearOption.value)

  const selectedYearData = useMemo(() => {
    return mileageData?.years.find(y => y.year === selectedYear)
  }, [mileageData, selectedYear])

  const chartData = useMemo(() => {
    if (!selectedYearData) return { years: [] }
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
  }, [selectedYearData])

  const handleYearChange = useCallback((option: YearOption | null) => {
    if (option) {
      setSelectedYearOption(option)
    }
  }, [])

  if (isLoading) {
    return (
      <Container name='mileage-tracking-stats' asWidget>
        <Header>
          <HeaderRow>
            <HeaderCol>
              <Heading level={2} size='md'>Mileage Tracking</Heading>
            </HeaderCol>
          </HeaderRow>
        </Header>
        <HStack className={`${CLASS_NAME}__Content`} gap='lg' justify='center' align='center'>
          <Loader />
        </HStack>
      </Container>
    )
  }

  if (isError || !mileageData) {
    return (
      <Container name='mileage-tracking-stats' asWidget>
        <Header>
          <HeaderRow>
            <HeaderCol>
              <Heading level={2} size='md'>Mileage Tracking</Heading>
            </HeaderCol>
          </HeaderRow>
        </Header>
        <DataState status={DataStateStatus.failed} title='Failed to load mileage data' />
      </Container>
    )
  }

  return (
    <Container name='mileage-tracking-stats' asWidget>
      <Header>
        <HeaderRow>
          <HeaderCol>
            <Heading level={2} size='md'>Mileage Tracking</Heading>
          </HeaderCol>
          <HeaderCol>
            <div className={`${CLASS_NAME}__YearSelector`}>
              <ComboBox
                selectedValue={selectedYearOption}
                onSelectedValueChange={handleYearChange}
                options={yearOptions}
                isSearchable={false}
                isClearable={false}
                aria-label='Select year'
              />
            </div>
          </HeaderCol>
        </HeaderRow>
      </Header>

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
