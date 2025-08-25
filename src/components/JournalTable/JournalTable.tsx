import { Fragment, useContext, useLayoutEffect } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { JournalContext } from '../../contexts/JournalContext'
import { TableProvider } from '../../contexts/TableContext'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'

import { entryNumber, type LedgerEntry } from '../../schemas/generalLedger/ledgerEntry'
import { View } from '../../types/general'
import { TableCellAlign } from '../../types/table'
import { humanizeEnum } from '../../utils/format'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'
import { JournalTableStringOverrides } from './JournalTableWithPanel'
import { format as formatTime } from 'date-fns'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'

export const JournalTable = ({
  view,
  data,
  stringOverrides,
}: {
  view: View
  data: LedgerEntry[]
  stringOverrides?: JournalTableStringOverrides
}) => (
  <TableProvider>
    <JournalTableContent
      view={view}
      data={data}
      stringOverrides={stringOverrides}
    />
  </TableProvider>
)

const JournalTableContent = ({
  data,
  stringOverrides,
}: {
  view: View
  data: LedgerEntry[]
  stringOverrides?: JournalTableStringOverrides
}) => {
  const { selectedEntryId, setSelectedEntryId, closeSelectedEntry } =
    useContext(JournalContext)

  const { isOpen, setIsOpen } = useTableExpandRow()

  useLayoutEffect(() => {
    if (data.length > 0) {
      setIsOpen(data.map(x => `journal-row-${x.id}`))
    }
  }, [data])

  const renderJournalRow = (
    row: LedgerEntry,
    index: number,
    rowKey: string,
    depth: number,
  ) => {
    const expandable = !!row.lineItems && row.lineItems.length > 0
    const expanded = !expandable || isOpen(rowKey)

    return (
      <Fragment key={rowKey + '-' + index}>
        <TableRow
          rowKey={rowKey + '-' + index}
          expandable={expandable}
          isExpanded={expanded}
          handleExpand={() => setIsOpen(rowKey)}
          selected={selectedEntryId === row.id}
          onClick={(e) => {
            e.stopPropagation()

            if (selectedEntryId === row.id) {
              closeSelectedEntry()
            }
            else {
              setSelectedEntryId(row.id)
            }
          }}
          depth={depth}
        >
          <TableCell
            withExpandIcon={expandable}
            onClick={(e) => {
              e.stopPropagation()
              if (expandable) setIsOpen(rowKey)
            }}
          >
            {entryNumber(row)}
          </TableCell>
          <TableCell>
            {formatTime(row.entryAt, DATE_FORMAT)}
          </TableCell>
          <TableCell>{humanizeEnum(row.entryType)}</TableCell>
          <TableCell>
            (
            {row.lineItems.length}
            )
          </TableCell>
          <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
            {'line_items' in row
              && Math.abs(
                row.lineItems
                  .filter(item => item.direction === LedgerEntryDirection.Debit)
                  .map(item => item.amount)
                  .reduce((a, b) => a + b, 0),
              )}
          </TableCell>
          <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
            {'line_items' in row
              && Math.abs(
                row.lineItems
                  .filter(item => item.direction === LedgerEntryDirection.Credit)
                  .map(item => item.amount)
                  .reduce((a, b) => a + b, 0),
              )}
          </TableCell>
        </TableRow>
        {expandable
          && expanded
          && row.lineItems.map((subItem, subIdx) => (
            <TableRow
              key={rowKey + '-' + index + '-' + subIdx}
              rowKey={rowKey + '-' + index + '-' + subIdx}
              depth={depth + 1}
              selected={selectedEntryId === row.id}
            >
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>{subItem.account.name}</TableCell>
              {subItem.direction === LedgerEntryDirection.Debit && subItem.amount >= 0
                ? (
                  <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                    {subItem.amount}
                  </TableCell>
                )
                : (
                  <TableCell />
                )}
              {subItem.direction === LedgerEntryDirection.Credit && subItem.amount >= 0
                ? (
                  <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                    {subItem.amount}
                  </TableCell>
                )
                : (
                  <TableCell />
                )}
            </TableRow>
          ))}
      </Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow isHeadRow rowKey='journal-head-row'>
          <TableCell isHeaderCell>
            {stringOverrides?.idColumnHeader || 'Id'}
          </TableCell>
          <TableCell isHeaderCell>
            {stringOverrides?.dateColumnHeader || 'Date'}
          </TableCell>
          <TableCell isHeaderCell>
            {stringOverrides?.transactionColumnHeader || 'Transaction'}
          </TableCell>
          <TableCell isHeaderCell>
            {stringOverrides?.accountColumnHeader || 'Account Name'}
          </TableCell>
          <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
            {stringOverrides?.debitColumnHeader || 'Debit'}
          </TableCell>
          <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
            {stringOverrides?.creditColumnHeader || 'Credit'}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((entry, idx) =>
          renderJournalRow(entry, idx, `journal-row-${entry.id}`, 0),
        )}
      </TableBody>
    </Table>
  )
}
