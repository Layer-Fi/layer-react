import React, { useContext } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { TableProvider } from '../../contexts/TableContext'
import { BillType } from '../../hooks/useBills/useBills'
import ChevronRight from '../../icons/ChevronRight'
import { View } from '../../types/general'
import { TableCellAlign } from '../../types/table'
import { convertNumberToCurrency } from '../../utils/format'
import { ButtonVariant, IconButton, SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
import { DueStatus } from '../DueStatus'
import { Checkbox } from '../Input'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'
import { BillsTableStringOverrides } from './BillsTableWithPanel'

export const BillsTable = ({
  view,
  data,
  stringOverrides,
  bulkRecordPayment,
  selectedEntries,
  setSelectedEntries,
  activeTab,
}: {
  view: View
  data: BillType[]
  stringOverrides?: BillsTableStringOverrides
  bulkRecordPayment: boolean
  selectedEntries: BillType[]
  setSelectedEntries: (entries: BillType[]) => void
  activeTab: string
}) => (
  <TableProvider>
    <BillsTableContent
      view={view}
      data={data}
      stringOverrides={stringOverrides}
      bulkRecordPayment={bulkRecordPayment}
      selectedEntries={selectedEntries}
      setSelectedEntries={setSelectedEntries}
      activeTab={activeTab}
    />
  </TableProvider>
)

const BillsTableContent = ({
  data,
  stringOverrides,
  bulkRecordPayment,
  selectedEntries,
  setSelectedEntries,
  activeTab,
}: {
  view: View
  data: BillType[]
  stringOverrides?: BillsTableStringOverrides
  bulkRecordPayment: boolean
  selectedEntries: BillType[]
  setSelectedEntries: (entries: BillType[]) => void
  activeTab: string
}) => {
  const {
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    setBillDetailsId,
  } = useContext(BillsContext)

  const renderBillsRow = (
    entry: BillType,
    index: number,
    rowKey: string,
    depth: number,
  ) => {
    const isSelected = selectedEntries.some(e => e.vendor === entry.vendor)
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setSelectedEntries([...selectedEntries, entry])
      } else {
        setSelectedEntries(
          selectedEntries.filter(e => e.vendor !== entry.vendor),
        )
      }
    }

    return (
      <React.Fragment key={rowKey + '-' + index}>
        <TableRow
          rowKey={rowKey + '-' + index}
          selected={selectedEntryId === rowKey}
          depth={depth}
        >
          <TableCell primary>
            {bulkRecordPayment && activeTab === 'unpaid' && (
              <Checkbox
                checked={isSelected}
                onChange={e => {
                  handleCheckboxChange(e)
                }}
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
              {activeTab === 'unpaid' ? (
                <SubmitButton
                  onClick={e => {
                    e.stopPropagation()

                    if (selectedEntryId === rowKey) {
                      closeSelectedEntry()
                    } else {
                      setSelectedEntryId(rowKey)
                    }
                  }}
                  active={true}
                  action={SubmitAction.UPDATE}
                  variant={ButtonVariant.secondary}
                >
                  {stringOverrides?.recordPaymentButtonText || 'Record payment'}
                </SubmitButton>
              ) : null}
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
