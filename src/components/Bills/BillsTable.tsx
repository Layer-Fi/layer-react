import { Fragment } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '../../contexts/BillsContext'
import { TableProvider } from '../../contexts/TableContext'
import { Bill } from '../../types/bills'
import ChevronRight from '../../icons/ChevronRight'
import { TableCellAlign } from '../../types/table'
import { convertCentsToCurrency, formatDate } from '../../utils/format'
import { ButtonVariant, IconButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { DueStatus } from '../DueStatus/DueStatus'
import { Checkbox } from '../Input'
import { CheckboxSize } from '../Input/Checkbox'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'
import { BillsTableStringOverrides } from './BillsTableWithPanel'
import { getVendorName } from '../../utils/vendors'
import { Text } from '../Typography'
import { isBillPaid } from '../../utils/bills'

export const BillsTable = ({
  stringOverrides,
}: {
  stringOverrides?: BillsTableStringOverrides
}) => (
  <TableProvider>
    <BillsTableContent stringOverrides={stringOverrides} />
  </TableProvider>
)

const BillsTableContent = ({
  stringOverrides,
}: {
  stringOverrides?: BillsTableStringOverrides
}) => {
  const { data, setBillInDetails, status } = useBillsContext()

  const {
    billsToPay,
    addBill,
    removeBill,
    bulkSelectionActive,
    setShowRecordPaymentForm,
    showRecordPaymentForm,
    vendor,
  } = useBillsRecordPaymentContext()

  const renderBillsRow = (
    entry: Bill,
    index: number,
    rowKey: string,
    depth: number,
  ) => {
    const isSelected = Boolean(billsToPay.find(record => record.bill?.id === entry.id))
    const isSelectionDisabled = bulkSelectionActive && vendor && vendor?.id !== entry.vendor?.id

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked && !isSelected) {
        addBill(entry)
      }
      else {
        removeBill(entry)
      }
    }

    return (
      <Fragment key={rowKey + '-' + index}>
        <TableRow rowKey={rowKey + '-' + index} depth={depth}>
          <TableCell primary nowrap className='Layer__bills-table__vendor-col'>
            {bulkSelectionActive && status === 'UNPAID' && (
              <Checkbox
                boxSize={CheckboxSize.LARGE}
                checked={isSelected}
                onChange={(e) => {
                  handleCheckboxChange(e)
                }}
                className='Layer__bills-table__checkbox'
                disabled={isSelectionDisabled}
              />
            )}
            <Text as='span' ellipsis status={isSelectionDisabled ? 'disabled' : ''}>
              {getVendorName(entry.vendor)}
            </Text>
          </TableCell>
          <TableCell nowrap>{formatDate(entry.due_at)}</TableCell>
          <TableCell primary>
            {convertCentsToCurrency(entry.total_amount)}
          </TableCell>
          <TableCell primary nowrap>
            {convertCentsToCurrency(entry.outstanding_balance)}
          </TableCell>
          <TableCell className='Layer__bills-table__status-col' nowrap>
            <DueStatus
              dueDate={entry.due_at}
              paidAt={entry.paid_at}
              paid={isBillPaid(entry.status)}
            />
          </TableCell>
          {!showRecordPaymentForm && (
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
          )}
        </TableRow>
      </Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow isHeadRow rowKey='bills-head-row'>
          <TableCell className='Layer__bills-table__vendor-col'>
            {stringOverrides?.vendorColumnHeader || 'Vendor'}
          </TableCell>
          <TableCell nowrap>
            {stringOverrides?.dueDateColumnHeader || 'Due date'}
          </TableCell>
          <TableCell nowrap>
            {stringOverrides?.billAmountColumnHeader || 'Bill amount'}
          </TableCell>
          <TableCell nowrap>
            {stringOverrides?.openBalanceColumnHeader || 'Open balance'}
          </TableCell>
          <TableCell nowrap>
            {stringOverrides?.statusColumnHeader || 'Status'}
          </TableCell>
          {!showRecordPaymentForm && <TableCell />}
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
