import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Tooltip, TooltipTrigger, TooltipContent } from '@ui/Tooltip/Tooltip'
import { convertNumberToCurrency } from '@utils/format'
import { Download } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuList, MenuItem } from '@ui/DropdownMenu/DropdownMenu'
import { Table } from '@components/Table/Table'
import { TableBody } from '@components/TableBody/TableBody'
import { TableHead } from '@components/TableHead/TableHead'
import { TableRow } from '@components/TableRow/TableRow'
import { TableCell } from '@components/TableCell/TableCell'
import { TableCellAlign } from '@internal-types/table'

interface QuarterlyAmount {
  quarter: string
  amount: number
}

interface TaxPaymentsProps {
  quarterlyPayments?: QuarterlyAmount[]
  quarterlyEstimates?: QuarterlyAmount[]
  paymentsSectionExpanded?: boolean
  onPaymentsSectionExpandedChange?: (expanded: boolean) => void
  onNavigateToBankTransactions?: () => void
}

export const TaxPayments = ({
  quarterlyPayments = [],
  quarterlyEstimates = [],
  paymentsSectionExpanded: _paymentsSectionExpanded,
  onPaymentsSectionExpandedChange: _onPaymentsSectionExpandedChange,
  onNavigateToBankTransactions = () => {},
}: TaxPaymentsProps = {}) => {
  const [selectedYear] = useState(new Date().getFullYear().toString())

  const quarterlyData = useMemo(() => {
    const estimatesMap = new Map(quarterlyEstimates.map(e => [e.quarter, e.amount]))
    const paymentsMap = new Map(quarterlyPayments.map(p => [p.quarter, p.amount]))

    let prevTotal = 0

    return quarterlyPayments.map((payment) => {
      const quarter = payment.quarter
      const owed = estimatesMap.get(quarter) || 0
      const paid = paymentsMap.get(quarter) || 0
      const rolledOver = prevTotal
      const total = rolledOver + owed - paid

      prevTotal = total

      return {
        quarter,
        rolledOver,
        owed,
        paid,
        total,
      }
    })
  }, [quarterlyPayments, quarterlyEstimates])

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
            {selectedYear}
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
