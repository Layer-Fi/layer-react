import React, { useContext } from 'react'
import { BillsContext } from '../../contexts/BillsContext'
import { TableProvider } from '../../contexts/TableContext'
import { BillType } from '../../hooks/useBills/useBills'
import ChevronRight from '../../icons/ChevronRight'
import { View } from '../../types/general'
import { TableCellAlign } from '../../types/table'
import { SubmitButton } from '../Button'
import { SubmitAction } from '../Button/SubmitButton'
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
          {bulkRecordPayment && activeTab === 'unpaid' && (
            <TableCell>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={e => {
                  handleCheckboxChange(e)
                }}
              />
            </TableCell>
          )}
          <TableCell>{entry.vendor}</TableCell>
          <TableCell>{entry.dueDate}</TableCell>
          <TableCell>{entry.billAmount.toFixed(2)}</TableCell>
          <TableCell align={TableCellAlign.RIGHT}>
            {entry.openBalance.toFixed(2)}
          </TableCell>
          <TableCell align={TableCellAlign.RIGHT}>
            <div className='Layer__bills__status-with-actions'>
              <span>{entry.status}</span>
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
                  className='Layer__bank-transaction__submit-btn'
                  active={true}
                  action={SubmitAction.UPDATE}
                >
                  {stringOverrides?.recordPaymentButtonText || 'Record payment'}
                </SubmitButton>
              ) : null}
              <ChevronRight
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
          <TableCell isHeaderCell>
            {stringOverrides?.vendorColumnHeader || 'Vendor'}
          </TableCell>
          <TableCell isHeaderCell>
            {stringOverrides?.dueDateColumnHeader || 'Due date'}
          </TableCell>
          <TableCell isHeaderCell>
            {stringOverrides?.billAmountColumnHeader || 'Bill amount'}
          </TableCell>
          <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
            {stringOverrides?.openBalanceColumnHeader || 'Open balance'}
          </TableCell>
          <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
            {stringOverrides?.statusColumnHeader || 'Status'}
          </TableCell>
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
