import { Download } from 'lucide-react'
import { useCallback } from 'react'

import { convertNumberToCurrency } from '@utils/format'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Table } from '@components/Table/Table'
import { TableBody } from '@components/TableBody/TableBody'
import { TableCell } from '@components/TableCell/TableCell'
import { TableCellAlign } from '@internal-types/table'
import { TableHead } from '@components/TableHead/TableHead'
import { TableRow } from '@components/TableRow/TableRow'

interface QuarterlyPaymentData {
  quarter: string
  rolledOver: number
  owed: number
  paid: number
  total: number
}

interface TaxPaymentsProps {
  quarterlyData?: QuarterlyPaymentData[]
  paymentsSectionExpanded?: boolean
  onPaymentsSectionExpandedChange?: (expanded: boolean) => void
  onNavigateToBankTransactions?: () => void
  year?: number
}

export const TaxPayments = ({
  quarterlyData = [],
  paymentsSectionExpanded: _paymentsSectionExpanded,
  onPaymentsSectionExpandedChange: _onPaymentsSectionExpandedChange,
  onNavigateToBankTransactions = () => {},
  year,
}: TaxPaymentsProps = {}) => {
  const displayYear = year ?? new Date().getFullYear()

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
            These are your federal and state tax payments for Year
            {' '}
            {displayYear}
            .
          </Span>
        </VStack>
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
      </HStack>
      <VStack gap='md' fluid className='Layer__tax-estimate__overview'>
        <VStack gap='md' fluid className='Layer__tax-estimate__details-container'>
          <VStack gap='sm' fluid>
            <div className='Layer__tax-estimate__payments-table'>
              <Table>
                <TableHead>
                  <TableRow isHeadRow rowKey='payments-header'>
                    <TableCell isHeaderCell>
                      Quarter
                    </TableCell>
                    <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
                      Rolled Over from Previous Quarter
                    </TableCell>
                    <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
                      Owed This Quarter
                    </TableCell>
                    <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
                      Total Paid
                    </TableCell>
                    <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quarterlyData.map(data => (
                    <TableRow
                      key={data.quarter}
                      rowKey={data.quarter}
                    >
                      <TableCell>
                        <Span size='md'>{data.quarter}</Span>
                      </TableCell>
                      <TableCell align={TableCellAlign.RIGHT}>
                        <Span size='md'>
                          {convertNumberToCurrency(data.rolledOver)}
                        </Span>
                      </TableCell>
                      <TableCell align={TableCellAlign.RIGHT}>
                        <Span size='md'>
                          {convertNumberToCurrency(data.owed)}
                        </Span>
                      </TableCell>
                      <TableCell align={TableCellAlign.RIGHT}>
                        <Button variant='text' onPress={() => onNavigateToBankTransactions?.()}>
                          {convertNumberToCurrency(data.paid)}
                        </Button>
                      </TableCell>
                      <TableCell align={TableCellAlign.RIGHT}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Span size='md'>
                              {convertNumberToCurrency(data.total)}
                            </Span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <Span size='sm' className='Layer__UI__tooltip-content--text'>
                              {convertNumberToCurrency(data.rolledOver)}
                              {' '}
                              +
                              {' '}
                              {convertNumberToCurrency(data.owed)}
                              {' '}
                              -
                              {' '}
                              {convertNumberToCurrency(data.paid)}
                              {' '}
                              =
                              {' '}
                              {convertNumberToCurrency(data.total)}
                            </Span>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
