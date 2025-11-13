import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { convertNumberToCurrency } from '@utils/format'
import { Download } from 'lucide-react'
import { useState, useCallback } from 'react'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuList, MenuItem } from '@ui/DropdownMenu/DropdownMenu'
import { TaxEstimateAnnualProjection, type TaxEstimateAnnualProjectionProps } from './TaxEstimateAnnualProjection'
import { TaxEstimateDetailSection } from './TaxEstimateDetailSection'
import { taxEstimateDefaults } from './defaults'

interface QuarterlyAmount {
  quarter: string
  amount: number
}

interface TaxPaymentsProps {
  taxEstimateAnnualProjectionProps?: TaxEstimateAnnualProjectionProps
  quarterlyPayments?: QuarterlyAmount[]
  paymentsSectionExpanded?: boolean
  onPaymentsSectionExpandedChange?: (expanded: boolean) => void
}

export const TaxPayments = ({
  taxEstimateAnnualProjectionProps = {
    projectedTaxesOwed: taxEstimateDefaults.projectedTaxesOwed,
    taxesDueDate: taxEstimateDefaults.taxesDueDate,
    federalTaxesOwed: taxEstimateDefaults.federalTaxesOwed,
    federalTaxesPaid: taxEstimateDefaults.federalTaxesPaid,
    stateTaxesOwed: taxEstimateDefaults.stateTaxesOwed,
    stateTaxesPaid: taxEstimateDefaults.stateTaxesPaid,
  },
  quarterlyPayments = taxEstimateDefaults.quarterlyPayments,
  paymentsSectionExpanded,
  onPaymentsSectionExpandedChange,
}: TaxPaymentsProps = {}) => {
  const [selectedYear] = useState(taxEstimateDefaults.year)

  const Trigger = useCallback(() => {
    return (
      <Button variant='ghost' onPress={() => {}}>
        Tax Forms
        <Download size={16} />
      </Button>
    )
  }, [])

  return (
    <VStack gap='lg' fluid>
      <HStack justify='space-between' align='center' fluid>
        <VStack>
          <Heading size='lg'>Tax Payments</Heading>
          <Span size='md' variant='subtle'>
            These are the projected federal and state tax payments for Year
            {' '}
            {selectedYear}
            {' '}
            , as categorized in your bank transactions.
          </Span>
        </VStack>
      </HStack>
      <VStack gap='md' fluid className='Layer__tax-estimate__overview'>
        <TaxEstimateAnnualProjection {...taxEstimateAnnualProjectionProps} />

        <VStack gap='md' fluid className='Layer__tax-estimate__details-container'>
          <VStack gap='sm' fluid>
            <TaxEstimateDetailSection
              title='Payments'
              expanded={paymentsSectionExpanded}
              onExpandedChange={onPaymentsSectionExpandedChange}
              headerActions={(
                <HStack gap='md'>
                  <DropdownMenu
                    ariaLabel='Tax forms'
                    slots={{ Trigger }}
                    slotProps={{ Dialog: { width: 300 } }}
                  >
                    <MenuList>
                      <MenuItem onClick={() => {}}>
                        Schedule C
                        <Download size={16} />
                      </MenuItem>
                      <MenuItem>
                        Tax Packet
                        <Download size={16} />
                      </MenuItem>
                      <MenuItem>
                        Tax Payment History
                        <Download size={16} />
                      </MenuItem>
                    </MenuList>
                  </DropdownMenu>
                  <Button variant='solid' onPress={() => {}}>
                    Record Payment
                  </Button>
                </HStack>
              )}
            >
              {quarterlyPayments.map(payment => (
                <HStack gap='lg' pbs='sm' pbe='sm' key={payment.quarter} justify='space-between' align='center' fluid>
                  <Span size='md'>{payment.quarter}</Span>
                  <Span size='md'>
                    {convertNumberToCurrency(payment.amount)}
                  </Span>
                </HStack>
              ))}
            </TaxEstimateDetailSection>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
