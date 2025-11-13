import { useEffect, useRef } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@ui/Button/Button'
import { AlertTriangle, Download } from 'lucide-react'
import { convertNumberToCurrency } from '@utils/format'
import { format } from 'date-fns'
import './taxFilingOverview.scss'
import { taxEstimateDefaults } from './defaults'

interface TaxFilingOverviewProps {
  onNavigateToBankTransactions?: () => void
}

export const TaxFilingOverview = ({ onNavigateToBankTransactions }: TaxFilingOverviewProps = {}) => {
  const totalIncomeBarRef = useRef<HTMLDivElement>(null)
  const incomeBarRef = useRef<HTMLDivElement>(null)
  const deductionsBarRef = useRef<HTMLDivElement>(null)
  const federalBarRef = useRef<HTMLDivElement>(null)
  const selfEmployedBarRef = useRef<HTMLDivElement>(null)
  const stateBarRef = useRef<HTMLDivElement>(null)
  const totalIncomeAmountRef = useRef<HTMLSpanElement>(null)
  const taxableIncomeAmountRef = useRef<HTMLSpanElement>(null)
  const deductionsAmountRef = useRef<HTMLSpanElement>(null)
  const federalAmountRef = useRef<HTMLSpanElement>(null)
  const selfEmployedAmountRef = useRef<HTMLSpanElement>(null)
  const stateAmountRef = useRef<HTMLSpanElement>(null)
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

  const taxableIncome = taxEstimateDefaults.taxableIncome
  const income = taxEstimateDefaults.businessIncome
  const deductions = taxEstimateDefaults.deductibleExpenses
    + taxEstimateDefaults.deductibleMileage
    + taxEstimateDefaults.selfEmploymentDeduction
    + taxEstimateDefaults.qualifiedTipDeduction
    + taxEstimateDefaults.qualifiedOvertimeDeduction
    + taxEstimateDefaults.federalDeductions
    + taxEstimateDefaults.businessIncomeDeduction
  const deductionsPercentage = (deductions / income) * 100
  const taxableIncomePercentage = (taxableIncome / income) * 100

  const federalTaxesOwed = taxEstimateDefaults.federalTaxesOwed
  const selfEmployedTaxesOwed = taxEstimateDefaults.selfEmploymentDeduction
  const stateTaxesOwed = taxEstimateDefaults.stateTaxesOwed
  const totalTaxesOwed = federalTaxesOwed + selfEmployedTaxesOwed + stateTaxesOwed
  const federalPercentage = (federalTaxesOwed / totalTaxesOwed) * 100
  const selfEmployedPercentage = (selfEmployedTaxesOwed / totalTaxesOwed) * 100
  const statePercentage = (stateTaxesOwed / totalTaxesOwed) * 100
  const taxesDueDate = taxEstimateDefaults.taxesDueDate

  useEffect(() => {
    if (totalIncomeBarRef.current) {
      totalIncomeBarRef.current.style.width = '100%'
    }
    if (incomeBarRef.current) {
      incomeBarRef.current.style.width = `${taxableIncomePercentage}%`
    }
    if (deductionsBarRef.current) {
      deductionsBarRef.current.style.width = `${deductionsPercentage}%`
    }
    if (federalBarRef.current) {
      federalBarRef.current.style.width = `${federalPercentage}%`
      federalBarRef.current.style.left = '0'
    }
    if (selfEmployedBarRef.current) {
      selfEmployedBarRef.current.style.width = `${selfEmployedPercentage}%`
      selfEmployedBarRef.current.style.left = '0'
    }
    if (stateBarRef.current) {
      stateBarRef.current.style.width = `${statePercentage}%`
      stateBarRef.current.style.left = '0'
    }
    if (totalIncomeAmountRef.current) {
      totalIncomeAmountRef.current.style.left = '100%'
      totalIncomeAmountRef.current.style.transform = 'translateX(-100%)'
    }
    if (taxableIncomeAmountRef.current) {
      taxableIncomeAmountRef.current.style.left = `${taxableIncomePercentage}%`
      taxableIncomeAmountRef.current.style.transform = 'translateX(-50%)'
    }
    if (deductionsAmountRef.current) {
      deductionsAmountRef.current.style.left = `${deductionsPercentage}%`
      deductionsAmountRef.current.style.transform = 'translateX(-50%)'
    }
    if (federalAmountRef.current) {
      federalAmountRef.current.style.left = `${federalPercentage}%`
      federalAmountRef.current.style.transform = 'translateX(-50%)'
    }
    if (selfEmployedAmountRef.current) {
      selfEmployedAmountRef.current.style.left = `${selfEmployedPercentage}%`
      selfEmployedAmountRef.current.style.transform = 'translateX(-50%)'
    }
    if (stateAmountRef.current) {
      stateAmountRef.current.style.left = `${statePercentage}%`
      stateAmountRef.current.style.transform = 'translateX(-50%)'
    }
  }, [deductionsPercentage, taxableIncomePercentage, federalPercentage, selfEmployedPercentage, statePercentage])

  return (
    <VStack gap='xl' fluid>
      <HStack gap='lg' fluid>
        <VStack gap='md' fluid pb='lg' pi='lg' className='Layer__Stack Layer__tax-filing-overview__section'>
          <HStack justify='space-between'>
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
          <HStack gap='md' align='center' pbe='lg' fluid>
            <Heading size='lg'>{convertNumberToCurrency(taxableIncome)}</Heading>
            <HStack gap='xs' align='center'>
              <AlertTriangle size={16} style={{ color: 'var(--fg-subtle)' }} />
              <Span size='sm' variant='subtle'>Excludes pending transactions</Span>
            </HStack>
          </HStack>
          <VStack gap='lg'>
            <HStack gap='md' align='center' fluid>
              <Span size='lg' className='Layer__tax-filing-overview__label'>
                Total Income
              </Span>
              <HStack
                fluid
                className='Layer__tax-filing-overview__bar-container Layer__tax-filing-overview__bar-container--with-label'
              >
                <HStack
                  ref={totalIncomeBarRef}
                  className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--total-income'
                />
                <Span ref={totalIncomeAmountRef} size='sm' variant='subtle' className='Layer__tax-filing-overview__bar-amount'>
                  {convertNumberToCurrency(income)}
                </Span>
              </HStack>
            </HStack>
            <HStack gap='md' align='center' fluid>
              <Span size='lg' className='Layer__tax-filing-overview__label'>
                Taxable Income
              </Span>
              <HStack
                fluid
                className='Layer__tax-filing-overview__bar-container Layer__tax-filing-overview__bar-container--with-label'
              >
                <HStack
                  ref={incomeBarRef}
                  className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--income'
                />
                <Span ref={taxableIncomeAmountRef} size='sm' variant='subtle' className='Layer__tax-filing-overview__bar-amount'>
                  {convertNumberToCurrency(taxableIncome)}
                </Span>
              </HStack>
            </HStack>
            <HStack gap='md' align='center' fluid>
              <Span size='lg' className='Layer__tax-filing-overview__label'>
                Deductions
              </Span>
              <HStack
                fluid
                className='Layer__tax-filing-overview__bar-container Layer__tax-filing-overview__bar-container--with-label'
              >
                <HStack
                  ref={deductionsBarRef}
                  className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--deductions'
                />
                <Span ref={deductionsAmountRef} size='sm' variant='subtle' className='Layer__tax-filing-overview__bar-amount'>
                  {convertNumberToCurrency(deductions)}
                </Span>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
        <VStack gap='lg' fluid pb='lg' pi='lg' className='Layer__tax-filing-overview__section'>
          <VStack gap='md'>
            <Heading size='md'>
              Tax Preparations for
              {' '}
              {yearForTaxFiling}
            </Heading>
            <VStack gap='sm'>
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

      </HStack>
      <HStack gap='lg' fluid>
        <VStack gap='lg' fluid pb='lg' pi='lg' className='Layer__tax-filing-overview__section'>
          <VStack gap='lg'>
            <Heading size='md'>Taxes</Heading>
            <HStack gap='xl' align='start' pbe='lg' fluid>
              <VStack gap='xs'>
                <Span size='sm' variant='subtle'>Total Owed</Span>
                <Heading size='lg'>{convertNumberToCurrency(totalTaxesOwed)}</Heading>
              </VStack>
              <VStack gap='xs'>
                <Span size='sm' variant='subtle'>Taxes Due</Span>
                <Heading size='lg'>{format(taxesDueDate, 'MMMM d')}</Heading>
              </VStack>
            </HStack>
            <VStack gap='lg'>
              <HStack gap='md' align='center' fluid>
                <Span size='lg' className='Layer__tax-filing-overview__label'>
                  Federal
                </Span>
                <HStack
                  fluid
                  className='Layer__tax-filing-overview__bar-container Layer__tax-filing-overview__bar-container--with-label'
                >
                  <HStack
                    ref={federalBarRef}
                    className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--federal'
                  />
                  <Span ref={federalAmountRef} size='sm' variant='subtle' className='Layer__tax-filing-overview__bar-amount'>
                    {convertNumberToCurrency(federalTaxesOwed)}
                  </Span>
                </HStack>
              </HStack>

              <HStack gap='md' align='center' fluid>
                <Span size='lg' className='Layer__tax-filing-overview__label'>
                  State
                </Span>
                <HStack
                  fluid
                  className='Layer__tax-filing-overview__bar-container Layer__tax-filing-overview__bar-container--with-label'
                >
                  <HStack
                    ref={stateBarRef}
                    className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--state'
                  />
                  <Span ref={stateAmountRef} size='sm' variant='subtle' className='Layer__tax-filing-overview__bar-amount'>
                    {convertNumberToCurrency(stateTaxesOwed)}
                  </Span>
                </HStack>
              </HStack>
              <HStack gap='md' align='center' fluid>
                <Span size='lg' className='Layer__tax-filing-overview__label'>
                  Self-Employed
                </Span>
                <HStack
                  fluid
                  className='Layer__tax-filing-overview__bar-container Layer__tax-filing-overview__bar-container--with-label'
                >
                  <HStack
                    ref={selfEmployedBarRef}
                    className='Layer__tax-filing-overview__bar Layer__tax-filing-overview__bar--self-employed'
                  />
                  <Span ref={selfEmployedAmountRef} size='sm' variant='subtle' className='Layer__tax-filing-overview__bar-amount'>
                    {convertNumberToCurrency(selfEmployedTaxesOwed)}
                  </Span>
                </HStack>
              </HStack>
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

    </VStack>
  )
}
