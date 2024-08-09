import React, { useContext, useEffect, useState } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { JournalContext } from '../../contexts/JournalContext'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars } from '../../models/Money'
import {
  JournalEntry,
  JournalEntryLine,
  JournalEntryLineItem,
} from '../../types'
import { humanizeEnum } from '../../utils/format'
import { View } from '../Journal'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface JournalRowProps {
  row: JournalEntry | JournalEntryLine | JournalEntryLineItem
  index: number
  initialLoad?: boolean
  view: View
  lineItemsLength?: number
  defaultOpen?: boolean
  expanded?: boolean
  depth?: number
  cumulativeIndex?: number
  selectedEntries?: boolean
}

const INDENTATION = 24

const EXPANDED_STYLE = {
  height: '100%',
  opacity: 1,
}

const COLLAPSED_STYLE = {
  height: 0,
  opacity: 0.5,
  paddingTop: 0,
  paddingBottom: 0,
}

const rowId = (row: JournalEntry | JournalEntryLineItem | JournalEntryLine) => {
  if ('id' in row) {
    return row.id
  }

  return `${row.account_identifier.id}-${Math.random()}`
}

const accountName = (row: JournalEntryLine | JournalEntryLineItem) => {
  if ('account' in row) {
    return row.account.name
  }

  return row.account_identifier.name
}

export const JournalRow = ({
  row,
  index,
  initialLoad,
  view,
  lineItemsLength = 8,
  defaultOpen = false,
  expanded = false,
  depth = 0,
  cumulativeIndex = 0,
  selectedEntries = false,
}: JournalRowProps) => {
  const { selectedEntryId, setSelectedEntryId, closeSelectedEntry } =
    useContext(JournalContext)

  const [isOpen, setIsOpen] = useState(index === 0 ? true : defaultOpen)

  const style = expanded
    ? {
        ...EXPANDED_STYLE,
        transitionDelay: `${15 * index}ms`,
      }
    : {
        ...COLLAPSED_STYLE,
        transitionDelay: `${lineItemsLength - 15 * index}ms`,
      }
  const [showComponent, setShowComponent] = useState(false)

  const baseClass = classNames(
    'Layer__journal-table-row',
    rowId(row) === selectedEntryId && 'Layer__table-row--active',
    initialLoad && 'initial-load',
    'Layer__table-row--with-show',
    showComponent ? 'show' : 'Layer__table-row--anim-starting-state',
    isOpen && 'Layer__journal__table-row--expanded',
  )

  const journalEntryLineClass = classNames(
    'Layer__journal-entry-table-row',
    selectedEntries && 'Layer__table-row--active',
    initialLoad && 'initial-load',
    'Layer__table-row--with-show',
    showComponent ? 'show' : 'Layer__table-row--anim-starting-state',
    'Layer__journal-line__table-row',
    !expanded && 'Layer__table-row--hidden',
  )

  useEffect(() => {
    if (initialLoad) {
      const timeoutId = setTimeout(() => {
        setShowComponent(true)
      }, index * 10)

      return () => clearTimeout(timeoutId)
    } else {
      setShowComponent(true)
    }
  }, [])

  if ('line_items' in row) {
    return (
      <>
        <tr
          className={baseClass}
          style={{ transitionDelay: `${15 * index}ms` }}
          onClick={e => {
            e.stopPropagation()

            if (selectedEntryId === row.id) {
              closeSelectedEntry()
            } else {
              setSelectedEntryId(row.id)
            }
          }}
        >
          <td className='Layer__table-cell Layer__journal__arrow'>
            <span className='Layer__table-cell-content'>
              <span
                className='Layer__table-cell-content-indentation'
                style={{
                  paddingLeft: INDENTATION * depth,
                }}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()

                  setIsOpen(!isOpen)
                }}
              >
                {row.line_items && row.line_items.length > 0 && (
                  <ChevronDownFill
                    size={16}
                    className='Layer__table__expand-icon'
                    style={{
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                  />
                )}
              </span>
            </span>
          </td>
          <td className='Layer__table-cell'>
            <span className='Layer__table-cell-content'>
              {row.id.substring(0, 5)}
            </span>
          </td>
          <td className='Layer__table-cell'>
            <span className='Layer__table-cell-content'>
              {row.date && formatTime(parseISO(row.date), DATE_FORMAT)}
            </span>
          </td>
          <td className='Layer__table-cell'>
            <span className='Layer__table-cell-content'>
              {humanizeEnum(row.entry_type)}
            </span>
          </td>
          <td className='Layer__table-cell'>
            <span className='Layer__table-cell-content'>{`(${row.line_items.length})`}</span>
          </td>
          <td className='Layer__table-cell Layer__table-cell--primary'>
            <span className='Layer__table-cell-content Layer__table-cell--amount'>
              $
              {centsToDollars(
                Math.abs(
                  row.line_items
                    .filter(item => item.direction === 'DEBIT')
                    .map(item => item.amount)
                    .reduce((a, b) => a + b, 0),
                ),
              )}
            </span>
          </td>
          <td className='Layer__table-cell Layer__table-cell--primary'>
            <span className='Layer__table-cell-content Layer__table-cell--amount'>
              $
              {centsToDollars(
                Math.abs(
                  row.line_items
                    .filter(item => item.direction === 'CREDIT')
                    .map(item => item.amount)
                    .reduce((a, b) => a + b, 0),
                ),
              )}
            </span>
          </td>
        </tr>
        {(row.line_items || []).map((lineItem, idx) => (
          <JournalRow
            key={`${row.id}-${idx}`}
            row={lineItem}
            depth={depth + 1}
            index={idx}
            expanded={isOpen}
            cumulativeIndex={cumulativeIndex + idx + 1}
            lineItemsLength={(row.line_items ?? []).length}
            view={view}
            selectedEntries={row.id === selectedEntryId}
          />
        ))}
      </>
    )
  }

  return (
    <tr
      className={journalEntryLineClass}
      style={{ transitionDelay: `${15 * index}ms` }}
    >
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content' style={style} />
      </td>
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content' style={style}>
          <span className='Layer__table-cell-hidden'>
            {rowId(row).substring(0, 5)}
          </span>
        </span>
      </td>
      <td className='Layer__table-cell' />
      <td className='Layer__table-cell' />
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content' style={style}>
          {accountName(row)}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        {row.direction === 'DEBIT' && (
          <span
            className='Layer__table-cell-content Layer__table-cell--amount'
            style={style}
          >
            ${centsToDollars(Math.abs(row.amount))}
          </span>
        )}
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        {row.direction === 'CREDIT' && (
          <span
            className='Layer__table-cell-content Layer__table-cell--amount'
            style={style}
          >
            ${centsToDollars(Math.abs(row.amount))}
          </span>
        )}
      </td>
    </tr>
  )
}
