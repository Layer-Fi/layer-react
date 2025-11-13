import { useCallback, useMemo, useState } from 'react'
import { startOfYear, getYear } from 'date-fns'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
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
import './mileageTrackingStats.scss'

type MileageMonth = {
  month: number
  miles: number
  businessMiles: number
  personalMiles: number
  estimatedDeduction: number
  trips: number
  businessTrips: number
  personalTrips: number
  deductionRate: number
}

type MileageYear = {
  year: number
  miles: number
  businessMiles: number
  personalMiles: number
  estimatedDeduction: number
  trips: number
  businessTrips: number
  personalTrips: number
  blendedDeductionRate: number
  months: MileageMonth[]
}

type MileageData = {
  years: MileageYear[]
}

const MOCK_DATA: MileageData = {
  years: [
    {
      year: 2025,
      miles: 9823983,
      businessMiles: 9200000,
      personalMiles: 623983,
      estimatedDeduction: 285928,
      trips: 29383,
      businessTrips: 27500,
      personalTrips: 1883,
      blendedDeductionRate: 0.7,
      months: [
        { month: 1, miles: 298, businessMiles: 291, personalMiles: 7, estimatedDeduction: 1923, trips: 9, businessTrips: 8, personalTrips: 1, deductionRate: 0.7 },
        { month: 2, miles: 0, businessMiles: 0, personalMiles: 0, estimatedDeduction: 0, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 3, miles: 456, businessMiles: 430, personalMiles: 26, estimatedDeduction: 2945, trips: 2, businessTrips: 2, personalTrips: 0, deductionRate: 0.7 },
        { month: 4, miles: 789, businessMiles: 750, personalMiles: 39, estimatedDeduction: 5095, trips: 9, businessTrips: 8, personalTrips: 1, deductionRate: 0.7 },
        { month: 5, miles: 234, businessMiles: 220, personalMiles: 14, estimatedDeduction: 1511, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 6, miles: 0, businessMiles: 0, personalMiles: 0, estimatedDeduction: 0, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 7, miles: 612, businessMiles: 580, personalMiles: 32, estimatedDeduction: 3952, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 8, miles: 891, businessMiles: 845, personalMiles: 46, estimatedDeduction: 5754, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 9, miles: 345, businessMiles: 327, personalMiles: 18, estimatedDeduction: 2227, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 10, miles: 1523, businessMiles: 1445, personalMiles: 78, estimatedDeduction: 9823, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 11, miles: 678, businessMiles: 643, personalMiles: 35, estimatedDeduction: 4378, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
        { month: 12, miles: 423, businessMiles: 401, personalMiles: 22, estimatedDeduction: 2730, trips: 0, businessTrips: 0, personalTrips: 0, deductionRate: 0.7 },
      ],
    },
    {
      year: 2024,
      miles: 5234567,
      businessMiles: 4900000,
      personalMiles: 334567,
      estimatedDeduction: 152345,
      trips: 15234,
      businessTrips: 14200,
      personalTrips: 1034,
      blendedDeductionRate: 0.7,
      months: [
        { month: 1, miles: 456, businessMiles: 430, personalMiles: 26, estimatedDeduction: 2945, trips: 12, businessTrips: 11, personalTrips: 1, deductionRate: 0.7 },
        { month: 2, miles: 234, businessMiles: 220, personalMiles: 14, estimatedDeduction: 1511, trips: 8, businessTrips: 7, personalTrips: 1, deductionRate: 0.7 },
        { month: 3, miles: 789, businessMiles: 750, personalMiles: 39, estimatedDeduction: 5095, trips: 15, businessTrips: 14, personalTrips: 1, deductionRate: 0.7 },
        { month: 4, miles: 612, businessMiles: 580, personalMiles: 32, estimatedDeduction: 3952, trips: 10, businessTrips: 9, personalTrips: 1, deductionRate: 0.7 },
        { month: 5, miles: 891, businessMiles: 845, personalMiles: 46, estimatedDeduction: 5754, trips: 18, businessTrips: 17, personalTrips: 1, deductionRate: 0.7 },
        { month: 6, miles: 345, businessMiles: 327, personalMiles: 18, estimatedDeduction: 2227, trips: 7, businessTrips: 6, personalTrips: 1, deductionRate: 0.7 },
        { month: 7, miles: 1523, businessMiles: 1445, personalMiles: 78, estimatedDeduction: 9823, trips: 25, businessTrips: 23, personalTrips: 2, deductionRate: 0.7 },
        { month: 8, miles: 678, businessMiles: 643, personalMiles: 35, estimatedDeduction: 4378, trips: 14, businessTrips: 13, personalTrips: 1, deductionRate: 0.7 },
        { month: 9, miles: 423, businessMiles: 401, personalMiles: 22, estimatedDeduction: 2730, trips: 9, businessTrips: 8, personalTrips: 1, deductionRate: 0.7 },
        { month: 10, miles: 298, businessMiles: 282, personalMiles: 16, estimatedDeduction: 1923, trips: 6, businessTrips: 5, personalTrips: 1, deductionRate: 0.7 },
        { month: 11, miles: 456, businessMiles: 432, personalMiles: 24, estimatedDeduction: 2945, trips: 11, businessTrips: 10, personalTrips: 1, deductionRate: 0.7 },
        { month: 12, miles: 789, businessMiles: 748, personalMiles: 41, estimatedDeduction: 5095, trips: 16, businessTrips: 15, personalTrips: 1, deductionRate: 0.7 },
      ],
    },
  ],
}

type YearOption = {
  label: string
  value: string
}

const CLASS_NAME = 'Layer__MileageTrackingStats'

export const MileageTrackingStats = () => {
  const activationDate = useBusinessActivationDate()
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
    return MOCK_DATA.years.find(y => y.year === selectedYear)
  }, [selectedYear])

  const chartData = useMemo(() => {
    if (!selectedYearData) return { years: [] }
    return {
      years: [{
        year: selectedYearData.year,
        months: selectedYearData.months,
      }],
    }
  }, [selectedYearData])

  const handleYearChange = useCallback((option: YearOption | null) => {
    if (option) {
      setSelectedYearOption(option)
    }
  }, [])

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
        <VStack className={`${CLASS_NAME}__Cards`} gap='md'>
          <VStack className={`${CLASS_NAME}__Card`} gap='3xs'>
            <Span size='sm'>Total Deduction</Span>
            <MoneySpan amount={selectedYearData?.estimatedDeduction ?? 0} size='lg' bold />
          </VStack>

          <VStack className={`${CLASS_NAME}__Card`} gap='3xs'>
            <Span size='sm'>Total Miles</Span>
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
            <Span size='sm'>Trips</Span>
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

        <VStack fluid justify='end' >
          <MileageDeductionChart data={chartData} selectedYear={selectedYear} />
        </VStack>
      </HStack>
    </Container>
  )
}

