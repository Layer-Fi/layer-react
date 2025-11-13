import { useEffect, useRef } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@ui/Button/Button'
import { ChevronDown, AlertTriangle } from 'lucide-react'
import { convertNumberToCurrency } from '@utils/format'
import './taxFilingOverview.scss'

export const TaxFilingOverview = () => {
  const incomeBarRef = useRef<HTMLDivElement>(null)
  const deductionsBarRef = useRef<HTMLDivElement>(null)

  const todoItems = [
    {
      label: 'Categorize $264,640.00 of potential deductions',
      buttonLabel: 'Review',
      variant: 'solid' as ButtonVariant,
      onPress: () => {},
    },
    {
      label: 'Categorize $120,477.00 of deposits',
      buttonLabel: 'Review',
      variant: 'solid' as ButtonVariant,
      onPress: () => {},
    },
    {
      label: 'Match bank transactions to invoices to recognize income',
      buttonLabel: 'Match',
      variant: 'outlined' as ButtonVariant,
      onPress: () => {},
    },
    {
      label: 'File with [Name of Tax Provider Software]',
      buttonLabel: 'Start taxes',
      variant: 'outlined' as ButtonVariant,
      onPress: () => {},
    },
  ]

  const deadlines = [
    { date: 'Jan 15', label: 'Q4 estimated tax due ($XX,XXX.00)' },
    { date: 'Apr 15', label: '2025 annual income taxes due', hasFileButton: true },
    { date: 'Apr 15', label: 'Q1 estimated tax due ($XX,XXX.00)' },
    { date: 'Jun 16', label: 'Q2 estimated tax due ($XX,XXX.00)' },
    { date: 'Sep 15', label: 'Q3 estimated tax due ($XX,XXX.00)' },
  ]

  const taxableProfit = 108668
  const income = 119114
  const deductions = 10445
  const total = income + deductions
  const incomePercentage = (income / total) * 100
  const deductionsPercentage = (deductions / total) * 100

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
      <HStack gap='lg' align='start' fluid>
        <VStack gap='lg' fluid className='Layer__tax-filing-overview__section'>
          <VStack gap='md'>
            <Heading size='md'>
              Tax Preparations for
              {' '}
              {new Date().getFullYear()}
            </Heading>
            <VStack gap='md'>
              {todoItems.map((item, index) => (
                <HStack key={index} gap='md' align='center' justify='space-between' fluid>
                  <HStack gap='sm' align='center' fluid className='Layer__tax-filing-overview__item'>
                    <Span size='md'>{item.label}</Span>
                  </HStack>
                  <Button variant={item.variant} onPress={item.onPress}>
                    {item.buttonLabel}
                    <ChevronDown size={16} />
                  </Button>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>

        <VStack gap='lg' fluid className='Layer__tax-filing-overview__section'>
          <VStack gap='md'>
            <Heading size='md'>
              Your Federal Tax Deadlines
              {' '}
              for
              {' '}
              {new Date().getFullYear()}
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
                      Start taxes
                      <ChevronDown size={16} />
                    </Button>
                  )}
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </HStack>

      <VStack gap='md' fluid className='Layer__Stack Layer__tax-filing-overview__section'>
        <HStack justify='space-between' align='center' fluid>
          <VStack gap='xs'>
            <Heading size='md'>Taxable Profit</Heading>
            <Span size='sm' variant='subtle'>
              Taxable profit estimate to date for Year
              {' '}
              {new Date().getFullYear()}
            </Span>
          </VStack>
          <HStack gap='sm' align='center'>

          </HStack>
        </HStack>
        <HStack gap='md' align='center'>
          <Heading size='xl'>{convertNumberToCurrency(taxableProfit)}</Heading>
          <HStack gap='xs' align='center'>
            <AlertTriangle size={24} />
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
