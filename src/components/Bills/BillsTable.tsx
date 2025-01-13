import React from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { TableProvider } from '../../contexts/TableContext'
import { Bill } from '../../hooks/useBills'
import ChevronRight from '../../icons/ChevronRight'
import { View } from '../../types/general'
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
  view,
  stringOverrides,
  activeTab,
}: {
  view: View
  stringOverrides?: BillsTableStringOverrides
  activeTab: string
}) => (
  <TableProvider>
    <BillsTableContent
      view={view}
      stringOverrides={stringOverrides}
      activeTab={activeTab}
    />
  </TableProvider>
)

const BillsTableContent = ({
  view,
  stringOverrides,
  activeTab,
}: {
  view: View
  stringOverrides?: BillsTableStringOverrides
  activeTab: string
}) => {
  const {
    data,
    setBillDetailsId,
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
            {bulkSelectionActive && activeTab === 'unpaid' && (
              <Checkbox
                boxSize={CheckboxSize.LARGE}
                checked={isSelected}
                onChange={(e) => {
                  handleCheckboxChange(e)
                }}
                className='Layer__bills-table__checkbox'
              />
            )}
            {entry.vendor}
          </TableCell>
          <TableCell>{entry.dueDate}</TableCell>
          <TableCell primary>
            {convertNumberToCurrency(entry.billAmount)}
          </TableCell>
          <TableCell primary>
            {convertNumberToCurrency(entry.openBalance)}
          </TableCell>
          <TableCell className='Layer__bills-table__status-col'>
            <DueStatus dueDate={entry.status} />
          </TableCell>
          <TableCell
            align={TableCellAlign.RIGHT}
            className='Layer__bills-table__actions-col'
          >
            <div className='Layer__bills__status-with-actions'>
              {activeTab === 'unpaid'
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
                  setBillDetailsId(rowKey)
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
