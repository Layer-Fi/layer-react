import { TableRow } from '@components/TableRow/TableRow'
import { TableHead } from '@components/TableHead/TableHead'
import { TableCell } from '@components/TableCell/TableCell'
import { TableBody } from '@components/TableBody/TableBody'
import { Table } from '@components/Table/Table'
import { Text } from '@components/Typography/Text'
import { IconButton } from '@components/Button/IconButton'
import { ButtonVariant } from '@components/Button/Button'
import { Fragment } from 'react'
import { useBillsContext, useBillsRecordPaymentContext } from '@contexts/BillsContext'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { Bill } from '@internal-types/bills'
import ChevronRight from '@icons/ChevronRight'
import { TableCellAlign } from '@internal-types/table'
import { convertCentsToCurrency, formatDate } from '@utils/format'
import { SubmitAction, SubmitButton } from '@components/Button/SubmitButton'
import { DueStatus } from '@components/DueStatus/DueStatus'
import { CheckboxWithTooltip } from '@ui/Checkbox/Checkbox'
import { BillsTableStringOverrides } from '@components/Bills/BillsTableWithPanel'
import { getVendorName } from '@utils/vendors'
import classNames from 'classnames'
import { DATE_FORMAT_SHORT } from '@config/general'
import { BillsTableLoader } from '@components/Bills/BillsTableLoader'

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
  const { paginatedData: data, openBillDetails, status, isLoading, error } = useBillsContext()

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
  ) => {
    const isSelected = Boolean(billsToPay.find(record => record.bill?.id === entry.id))
    const isSelectionDisabled = bulkSelectionActive && vendor && vendor?.id !== entry.vendor?.id

    const handleCheckboxChange = (value: boolean) => {
      if (value && !isSelected) {
        addBill(entry)
        return
      }

      removeBill(entry)
    }

    const onRecordPaymentClick = (e: React.MouseEvent) => {
      e.stopPropagation()

      if (billsToPay.map(x => x.bill?.id).includes(rowKey)) {
        setShowRecordPaymentForm(false)
        return
      }

      addBill(entry)
      setShowRecordPaymentForm(true)
    }

    const actionsColClassName = classNames(
      'Layer__bills-table__actions-col',
      status === 'PAID' ? 'Layer__bills-table__actions-col--narrow' : '',
    )

    return (
      <Fragment key={rowKey + '-' + index}>
        <TableRow rowKey={rowKey + '-' + index} variant='main'>
          <TableCell primary nowrap className='Layer__bills-table__vendor-col'>
            {bulkSelectionActive && status === 'UNPAID' && (
              <CheckboxWithTooltip
                variant='success'
                isSelected={isSelected}
                onChange={handleCheckboxChange}
                className='Layer__bills-table__checkbox'
                isDisabled={isSelectionDisabled}
                tooltip={isSelectionDisabled ? 'You can only select bills from the same vendor' : undefined}
              />
            )}
            <Text as='span' ellipsis status={isSelectionDisabled ? 'disabled' : undefined}>
              {getVendorName(entry.vendor)}
            </Text>
          </TableCell>

          <TableCell nowrap>{formatDate(entry.due_at, DATE_FORMAT_SHORT)}</TableCell>

          <TableCell primary>
            {convertCentsToCurrency(entry.total_amount)}
          </TableCell>

          {status === 'UNPAID' && (
            <TableCell primary nowrap>
              {convertCentsToCurrency(entry.outstanding_balance)}
            </TableCell>
          )}

          <TableCell className='Layer__bills-table__status-col' nowrap>
            <DueStatus dueDate={entry.due_at} paidAt={entry.paid_at} />
          </TableCell>

          {!showRecordPaymentForm && (
            <TableCell
              align={TableCellAlign.RIGHT}
              className={actionsColClassName}
            >
              <div className='Layer__bills__status-with-actions'>
                {status === 'UNPAID'
                  ? (
                    <SubmitButton
                      onClick={onRecordPaymentClick}
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
                  onClick={() => { openBillDetails(entry) }}
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
          {status === 'UNPAID' && (
            <TableCell nowrap>
              {stringOverrides?.openBalanceColumnHeader || 'Open balance'}
            </TableCell>
          )}
          <TableCell nowrap>
            {stringOverrides?.statusColumnHeader || 'Status'}
          </TableCell>
          {!showRecordPaymentForm && <TableCell />}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((entry, idx) =>
          renderBillsRow(entry, idx, `bills-row-${idx}`),
        )}
      </TableBody>
      {isLoading && !error ? <BillsTableLoader /> : null}
    </Table>
  )
}
