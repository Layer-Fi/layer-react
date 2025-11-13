import { useEffect, useRef } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@ui/Button/Button'
import { AlertTriangle, Download } from 'lucide-react'
import { convertNumberToCurrency } from '@utils/format'
import './taxFilingOverview.scss'

interface TaxFilingOverviewProps {
  onNavigateToBankTransactions?: () => void
}

export const TaxFilingOverview = ({ onNavigateToBankTransactions }: TaxFilingOverviewProps = {}) => {
  const incomeBarRef = useRef<HTMLDivElement>(null)
  const deductionsBarRef = useRef<HTMLDivElement>(null)
  const yearForTaxFiling = 2025

  const todoItems = [
    {
      label: `Categorize ${convertNumberToCurrency(2100)} of potential deductions`,
      buttonLabel: 'Review',
      variant: 'solid' as ButtonVariant,
      icon: null,
      onPress: () => {
        onNavigateToBankTransactions?.()
      },
    },
    {
      label: `Categorize ${convertNumberToCurrency(4925)} of deposits`,
      buttonLabel: 'Review',
      variant: 'solid' as ButtonVariant,
      icon: null,
      onPress: () => {
        onNavigateToBankTransactions?.()
      },
    },
    {
      label: 'Export your tax packet',
      buttonLabel: 'Export',
      icon: <Download size={16} />,
      variant: 'outlined' as ButtonVariant,
      onPress: () => {},
    },
  ]

  const deadlines = [
    { date: 'Apr 15, 2025', label: `Q1 estimated tax due (${convertNumberToCurrency(7856.88)})` },
    { date: 'Jul 15, 2025', label: `Q2 estimated tax due (${convertNumberToCurrency(7856.88)})` },
    { date: 'Oct 15, 2025', label: `Q3 estimated tax due (${convertNumberToCurrency(7856.88)})` },
    { date: 'Jan 15, 2026', label: `Q4 estimated tax due (${convertNumberToCurrency(7856.86)})` },
    { date: 'Apr 15, 2026', label: `Annual income taxes due (${convertNumberToCurrency(0)})`, hasFileButton: true },
  ]
  // Quarterly total: 7856.88 × 3 + 7856.86 = 31,427.50 ✓

  const taxableIncome = 110000.00 // Same as defaultTaxableIncome
  const income = 160000.00 // 75000 + 85000
  const deductions = 50000.00 // Matching federal deductions + AGI deductions
  const incomePercentage = (income / (income + deductions)) * 100
  const deductionsPercentage = (deductions / (income + deductions)) * 100

  useEffect(() => {
    if (incomeBarRef.current) {
      incomeBarRef.current.style.width = `${incomePercentage}%`
    }
    if (deductionsBarRef.current) {
      deductionsBarRef.current.style.width = `${deductionsPercentage}%`
    }
  }, [incomePercentage, deductionsPercentage])

  return (
    <VStack gap='xl' fluid>
      <HStack gap='lg' fluid>
        <VStack gap='lg' fluid pb='lg' pi='lg' className='Layer__tax-filing-overview__section'>
          <VStack gap='md'>
            <Heading size='md'>
              Tax Preparations for
              {' '}
              {yearForTaxFiling}
            </Heading>
            <VStack gap='md'>
              {todoItems.map((item, index) => (
                <HStack key={index} gap='md' align='center' justify='space-between' fluid>
                  <HStack gap='sm' align='center' fluid className='Layer__tax-filing-overview__item'>
                    <Span size='md'>{item.label}</Span>
                  </HStack>
                  <Button variant={item.variant} onPress={item.onPress}>
                    {item.buttonLabel}
                    {item.icon}
                  </Button>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>

        <VStack gap='lg' fluid pb='lg' pi='lg' className='Layer__tax-filing-overview__section'>
          <VStack gap='md'>
            <Heading size='md'>
              Your Federal Tax Deadlines
              {' '}
              for
              {' '}
              {yearForTaxFiling}
            </Heading>
            <VStack gap='sm'>
              {deadlines.map((deadline, index) => (
                <HStack key={index} gap='xl' align='center' justify='space-between' fluid>
                  <HStack gap='md' align='center' className='Layer__tax-filing-overview__item'>
                    <Span size='md' weight='bold' variant='subtle'>{deadline.date}</Span>
                    <Span size='md'>{deadline.label}</Span>
                  </HStack>
                  {deadline.hasFileButton && (
                    <Button variant='outlined' size='md' onPress={() => {}}>
                      Export
                      <Download size={16} />
                    </Button>
                  )}
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </HStack>

      <VStack gap='md' fluid pb='lg' pi='lg' className='Layer__Stack Layer__tax-filing-overview__section'>
        <HStack justify='space-between' align='center' fluid>
          <VStack gap='xs'>
            <Heading size='md'>Taxable Income</Heading>
            <Span size='sm' variant='subtle'>
              Taxable income estimate to date for Year
              {' '}
              {yearForTaxFiling}
            </Span>
          </VStack>
          <HStack gap='sm' align='center'>

          </HStack>
        </HStack>
        <HStack gap='md' align='center'>
          <Heading size='xl'>{convertNumberToCurrency(taxableIncome)}</Heading>
          <HStack gap='xs' align='center'>
            <AlertTriangle size={16} style={{ color: 'var(--fg-subtle)' }} />
            <Span size='sm' variant='subtle'>Excludes pending transactions</Span>
          </HStack>
        </HStack>
        <VStack gap='xs'>
          <HStack gap='md' align='center' fluid>
            <Span size='lg' className='Layer__tax-filing-overview__label'>
              {convertNumberToCurrency(income)}
              {' '}
              Income
            </Span>
            <HStack
              fluid
              className='Layer__tax-filing-overview__bar-container'
            >
              <HStack
                ref={incomeBarRef}
                className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--income'
              />
            </HStack>
          </HStack>
          <HStack gap='md' align='center' fluid>
            <Span size='lg' className='Layer__tax-filing-overview__label'>
              {convertNumberToCurrency(deductions)}
              {' '}
              Deductions
            </Span>
            <HStack
              fluid
              className='Layer__tax-filing-overview__bar-container'
            >
              <HStack
                ref={deductionsBarRef}
                className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--deductions'
              />
            </HStack>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
