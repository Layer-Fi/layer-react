import React from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { TableProvider } from '../../contexts/TableContext'
import { Bill } from '../../types/bills'
import ChevronRight from '../../icons/ChevronRight'
import { TableCellAlign } from '../../types/table'
import { convertNumberToCurrency } from '../../utils/format'
import { ButtonVariant, IconButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { DueStatus } from '../DueStatus/DueStatus'
import { Checkbox } from '../Input'
import { CheckboxSize } from '../Input/Checkbox'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'
import { BillsTableStringOverrides } from './BillsTableWithPanel'

export const BillsTable = ({
  stringOverrides,
}: {
  stringOverrides?: BillsTableStringOverrides
}) => (
  <TableProvider>
    <BillsTableContent
      stringOverrides={stringOverrides}
    />
  </TableProvider>
)

const BillsTableContent = ({
  stringOverrides,
}: {
  stringOverrides?: BillsTableStringOverrides
}) => {
  const {
    data,
    setBillInDetails,
    status,
  } = useBillsContext()

  const {
    billsToPay,
    addBill,
    removeBill,
    bulkSelectionActive,
    setShowRecordPaymentForm,
  } = useBillsRecordPaymentContext()

  const renderBillsRow = (
    entry: Bill,
    index: number,
    rowKey: string,
    depth: number,
  ) => {
    const isSelected = Boolean(billsToPay.find(record => record.bill?.id === entry.id))

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked && !isSelected) {
        addBill(entry)
      }
      else {
        removeBill(entry)
      }
    }

    return (
      <React.Fragment key={rowKey + '-' + index}>
        <TableRow
          rowKey={rowKey + '-' + index}
          selected={isSelected}
          depth={depth}
        >
          <TableCell primary>
            {bulkSelectionActive && status === 'UNPAID' && (
              <Checkbox
                boxSize={CheckboxSize.LARGE}
                checked={isSelected}
                onChange={(e) => {
                  handleCheckboxChange(e)
                }}
                className='Layer__bills-table__checkbox'
              />
            )}
            {entry.vendor?.company_name ?? 'Missing vendor'}
          </TableCell>
          <TableCell>{entry.due_at}</TableCell>
          <TableCell primary>
            {convertNumberToCurrency(entry.total_amount)}
          </TableCell>
          <TableCell primary>
            {convertNumberToCurrency(entry.outstanding_balance)}
          </TableCell>
          <TableCell className='Layer__bills-table__status-col'>
            <DueStatus dueDate={entry.due_at} />
          </TableCell>
          <TableCell
            align={TableCellAlign.RIGHT}
            className='Layer__bills-table__actions-col'
          >
            <div className='Layer__bills__status-with-actions'>
              {status === 'UNPAID'
                ? (
                  <SubmitButton
                    onClick={(e) => {
                      e.stopPropagation()

                      if (billsToPay.map(x => x.bill?.id).includes(rowKey)) {
                        setShowRecordPaymentForm(false)
                      }
                      else {
                        addBill(entry)
                        setShowRecordPaymentForm(true)
                      }
                    }}
                    active={true}
                    action={SubmitAction.UPDATE}
                    variant={ButtonVariant.secondary}
                  >
                    {stringOverrides?.recordPaymentButtonText || 'Record payment'}
                  </SubmitButton>
                )
                : null}
              <IconButton
                icon={<ChevronRight />}
                onClick={() => {
                  setBillInDetails(entry)
                }}
              />
            </div>
          </TableCell>
        </TableRow>
      </React.Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow isHeadRow rowKey='bills-head-row'>
          <TableCell>
            {stringOverrides?.vendorColumnHeader || 'Vendor'}
          </TableCell>
          <TableCell>
            {stringOverrides?.dueDateColumnHeader || 'Due date'}
          </TableCell>
          <TableCell>
            {stringOverrides?.billAmountColumnHeader || 'Bill amount'}
          </TableCell>
          <TableCell>
            {stringOverrides?.openBalanceColumnHeader || 'Open balance'}
          </TableCell>
          <TableCell>
            {stringOverrides?.statusColumnHeader || 'Status'}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((entry, idx) =>
          renderBillsRow(entry, idx, `bills-row-${idx}`, 0),
        )}
      </TableBody>
    </Table>
  )
}
