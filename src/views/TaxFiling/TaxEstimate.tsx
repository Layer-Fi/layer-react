import { useState, useMemo } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P, Span, Label } from '@ui/Typography/Text'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { Tabs } from '@components/Tabs/Tabs'
import { Button } from '@ui/Button/Button'
import { X } from 'lucide-react'
import { convertNumberToCurrency } from '@utils/format'
import './taxEstimate.scss'

type IncomeStreamType = 'self-employed' | 'business' | 'investment' | 'ordinary'
type PeriodType = 'quarterly' | 'yearly'
type TabType = 'overview' | 'self-employed' | 'ordinary'

interface IncomeStream {
  type: IncomeStreamType
  label: string
  form: string
  isActive: boolean
}

interface QuarterlyEstimate {
  quarter: string
  amount: number
}

interface TaxEstimateProps {
  incomeStreams?: IncomeStream[]
}

const defaultIncomeStreams: IncomeStream[] = [
  { type: 'self-employed', label: 'Self-employed income', form: 'Form 1099', isActive: true },
  { type: 'business', label: 'Business income', form: 'Form K1', isActive: false },
  { type: 'investment', label: 'Investment income', form: '', isActive: false },
  { type: 'ordinary', label: 'Ordinary income', form: 'Form W2', isActive: true },
]

type PeriodOption = {
  label: string
  value: PeriodType
}

const periodOptions: PeriodOption[] = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

type YearOption = {
  label: string
  value: string
}

const yearOptions: YearOption[] = [
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
]

const defaultQuarterlyEstimates: QuarterlyEstimate[] = [
  { quarter: 'Q1 2024', amount: 800.00 },
  { quarter: 'Q2 2024', amount: 800.00 },
  { quarter: 'Q3 2024', amount: 800.00 },
  { quarter: 'Q4 2024', amount: 800.00 },
]

export const TaxEstimate = ({ incomeStreams: initialIncomeStreams = defaultIncomeStreams }: TaxEstimateProps) => {
  const [periodType, setPeriodType] = useState<PeriodType>('quarterly')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>(initialIncomeStreams)

  const relevantStreams = useMemo(() => incomeStreams.filter(s => s.isActive), [incomeStreams])
  const irrelevantStreams = useMemo(() => incomeStreams.filter(s => !s.isActive), [incomeStreams])

  const handleAddStream = (type: IncomeStreamType) => {
    setIncomeStreams(streams => streams.map(s => s.type === type ? { ...s, isActive: true } : s))
  }

  const handleRemoveStream = (type: IncomeStreamType) => {
    setIncomeStreams(streams => streams.map(s => s.type === type ? { ...s, isActive: false } : s))
  }

  const quarterlyEstimates = defaultQuarterlyEstimates
  const totalEstimate = quarterlyEstimates.reduce((sum, q) => sum + q.amount, 0)

  return (
    <VStack gap='lg' fluid>
      <VStack gap='xs' fluid>
        <Heading size='lg'>Relevant taxable income streams</Heading>
        <P variant='subtle' size='sm'>
          Based on your tax profile, these are the income streams included in your calculation.
        </P>
      </VStack>

      {relevantStreams.length > 0 && (
        <HStack gap='md' justify='center' fluid>
          {relevantStreams.map(stream => (
            <div
              key={stream.type}
              className='Layer__tax-estimate__income-stream Layer__tax-estimate__income-stream--active'
            >
              <div className='Layer__tax-estimate__income-stream__remove'>
                <Button
                  variant='ghost'
                  icon
                  onPress={() => handleRemoveStream(stream.type)}
                  aria-label={`Remove ${stream.label}`}
                >
                  <X size={16} />
                </Button>
              </div>
              <VStack gap='xs'>
                <Span weight='bold' size='sm'>
                  {stream.label}
                </Span>
                {stream.form && (
                  <Span variant='subtle' size='xs'>
                    (
                    {stream.form}
                    )
                  </Span>
                )}
              </VStack>
            </div>
          ))}
        </HStack>
      )}

      {irrelevantStreams.length > 0 && (
        <VStack gap='xs' fluid>
          <P variant='subtle' size='sm'>
            Based on your accounting data and tax profile, the following income streams were not included in your calculation.
          </P>
          <P variant='subtle' size='sm'>
            Feel free to add them back if relevant.
            {' '}
            {irrelevantStreams.map((stream, index) => (
              <span key={stream.type}>
                {index > 0 && ', '}
                <button
                  type='button'
                  className='Layer__tax-estimate__add-stream-link'
                  onClick={() => handleAddStream(stream.type)}
                >
                  {stream.label}
                  {stream.form && ` (${stream.form})`}
                </button>
              </span>
            ))}
            .
          </P>
        </VStack>
      )}

      <VStack gap='md' fluid>
        <HStack gap='md' align='center' className='Layer__tax-estimate__period-selector'>
          <VStack gap='xs' className='Layer__tax-estimate__period-selector-item'>
            <Label size='sm'>Period</Label>
            <ComboBox
              options={periodOptions}
              onSelectedValueChange={option => setPeriodType(option?.value || 'quarterly')}
              selectedValue={periodOptions.find(opt => opt.value === periodType) || null}
              isSearchable={false}
              isClearable={false}
            />
          </VStack>
          {periodType === 'quarterly' && (
            <VStack gap='xs' className='Layer__tax-estimate__period-selector-item'>
              <Label size='sm'>Year</Label>
              <ComboBox
                options={yearOptions}
                onSelectedValueChange={option => setSelectedYear(option?.value || '2024')}
                selectedValue={yearOptions.find(opt => opt.value === selectedYear) || null}
                isSearchable={false}
                isClearable={false}
              />
            </VStack>
          )}
        </HStack>

        <div className='Layer__tax-estimate__tabs'>
          <Tabs
            name='tax-estimate-tabs'
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'self-employed', label: 'Self employed income (1099)' },
              { value: 'ordinary', label: 'Ordinary income (W2)' },
            ]}
            selected={activeTab}
            onChange={e => setActiveTab(e.target.value as TabType)}
          />
        </div>

        {activeTab === 'overview' && (
          <VStack gap='md' fluid>
            <Heading size='md'>
              Tax Estimates:
              {selectedYear}
            </Heading>
            <VStack gap='sm' fluid>
              {periodType === 'quarterly' && quarterlyEstimates.map(estimate => (
                <HStack key={estimate.quarter} justify='space-between' fluid>
                  <Span size='sm'>
                    {estimate.quarter}
                    {estimate.quarter === 'Q1 2024' && (
                      <Span variant='subtle' size='xs' className='Layer__tax-estimate__period-hint'>
                        {' '}
                        (clicking this sets period selector)
                      </Span>
                    )}
                  </Span>
                  <Span size='sm' weight='bold'>
                    {convertNumberToCurrency(estimate.amount)}
                  </Span>
                </HStack>
              ))}
              <HStack justify='space-between' fluid className='Layer__tax-estimate__total'>
                <Span size='md' weight='bold'>
                  Total tax estimate
                </Span>
                <Span size='md' weight='bold'>
                  {convertNumberToCurrency(totalEstimate)}
                </Span>
              </HStack>
            </VStack>
          </VStack>
        )}

        {activeTab === 'self-employed' && (
          <VStack gap='md' fluid>
            <P variant='subtle'>Self employed income content will go here.</P>
          </VStack>
        )}

        {activeTab === 'ordinary' && (
          <VStack gap='md' fluid>
            <P variant='subtle'>Ordinary income content will go here.</P>
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}
