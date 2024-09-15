import React, { useContext, useEffect } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { JournalContext } from '../../contexts/JournalContext'
import { TableProvider } from '../../contexts/TableContext'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import {
  JournalEntry,
  JournalEntryLine,
  JournalEntryLineItem,
} from '../../types'
import { View } from '../../types/general'
import { TableCellAlign } from '../../types/table'
import { humanizeEnum } from '../../utils/format'
import { entryNumber } from '../../utils/journal'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'
import { JournalTableStringOverrides } from './JournalTableWithPanel'
import { parseISO, format as formatTime } from 'date-fns'

const rowId = (row: JournalEntry | JournalEntryLineItem | JournalEntryLine) => {
  if ('id' in row) {
    return row.id
  }
  if ('account_identifier' in row) {
    return `${row.account_identifier.id}-${Math.random()}`
  }

  return `${Math.random()}`
}

const accountName = (
  row: JournalEntry | JournalEntryLine | JournalEntryLineItem,
) => {
  if ('account' in row) {
    return row.account.name
  }
  if ('account_identifier' in row) {
    return row.account_identifier.name
  }
  return ''
}

export const JournalTable = ({
  view,
  data,
  stringOverrides,
}: {
  view: View
  data: JournalEntry[]
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
  data: JournalEntry[]
  stringOverrides?: JournalTableStringOverrides
}) => {
  const { selectedEntryId, setSelectedEntryId, closeSelectedEntry } =
    useContext(JournalContext)

  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffect(() => {
    if (data.length > 0) {
      setIsOpen([`journal-row- + ${data[0].id}`])
    }
  }, [])

  const renderJournalRow = (
    row: JournalEntry,
    index: number,
    rowKey: string,
    depth: number,
  ) => {
    const expandable = !!row.line_items && row.line_items.length > 0
    const expanded = expandable ? isOpen(rowKey) : true
    return (
      <React.Fragment key={rowKey + '-' + index}>
        <TableRow
          rowKey={rowKey + '-' + index}
          expandable={expandable}
          isExpanded={expanded}
          handleExpand={() => setIsOpen(rowKey)}
          selected={selectedEntryId === row.id}
          onClick={e => {
            e.stopPropagation()

            if (selectedEntryId === row.id) {
              closeSelectedEntry()
            } else {
              setSelectedEntryId(row.id)
            }
          }}
          depth={depth}
        >
          <TableCell
            withExpandIcon={expandable}
            onClick={e => {
              e.stopPropagation()

              expandable && setIsOpen(rowKey)
            }}
          >
            {entryNumber(row)}
          </TableCell>
          <TableCell>
            {row.date && formatTime(parseISO(row.date), DATE_FORMAT)}
          </TableCell>
          <TableCell>{humanizeEnum(row.entry_type)}</TableCell>
          <TableCell>({row.line_items.length})</TableCell>
          <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
            {'line_items' in row &&
              Math.abs(
                row.line_items
                  .filter(item => item.direction === 'DEBIT')
                  .map(item => item.amount)
                  .reduce((a, b) => a + b, 0),
              )}
          </TableCell>
          <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
            {'line_items' in row &&
              Math.abs(
                row.line_items
                  .filter(item => item.direction === 'CREDIT')
                  .map(item => item.amount)
                  .reduce((a, b) => a + b, 0),
              )}
          </TableCell>
        </TableRow>
        {expandable &&
          expanded &&
          row.line_items.map((subItem, subIdx) => (
            <TableRow
              key={rowKey + '-' + index + '-' + subIdx}
              rowKey={rowKey + '-' + index + '-' + subIdx}
              depth={depth + 1}
              selected={selectedEntryId === row.id}
            >
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>{accountName(subItem)}</TableCell>
              {subItem.direction === 'DEBIT' && subItem.amount > 0 ? (
                <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                  {subItem.amount}
                </TableCell>
              ) : (
                <TableCell />
              )}
              {subItem.direction === 'CREDIT' && subItem.amount > 0 ? (
                <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                  {subItem.amount}
                </TableCell>
              ) : (
                <TableCell />
              )}
            </TableRow>
          ))}
      </React.Fragment>
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
            {stringOverrides?.accountColumnHeader || 'Account'}
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
