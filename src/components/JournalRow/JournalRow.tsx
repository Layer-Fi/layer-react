import React, { useContext, useEffect, useState } from 'react'
import { DATE_FORMAT } from '../../config/general'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars } from '../../models/Money'
import { JournalEntry, JournalEntryLine } from '../../types'
import { JournalContext, View } from '../Journal'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface JournalRowProps {
  row: JournalEntry | JournalEntryLine
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
  height: 41,
  paddingTop: 12,
  paddingBottom: 12,
  opacity: 1,
}

const COLLAPSED_STYLE = {
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  opacity: 0.5,
}

export const JournalRow = ({
  row,
  index,
  initialLoad,
  view,
  lineItemsLength = 8,
  defaultOpen = true,
  expanded = true,
  depth = 0,
  cumulativeIndex = 0,
  selectedEntries = false,
}: JournalRowProps) => {
  const { selectedEntryId, setSelectedEntryId, closeSelectedEntry } =
    useContext(JournalContext)

  const [isOpen, setIsOpen] = useState(defaultOpen)

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
    row.id === selectedEntryId && 'Layer__table-row--active',
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
                  paddingLeft: INDENTATION * depth + 16,
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
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
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
              Invoice (TBD null)
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
                    .map(item => item.amount)
                    .reduce((a, b) => a + b, 0),
                ),
              )}
            </span>
          </td>
        </tr>
        {(row.line_items || []).map((lineItem, idx) => (
          <JournalRow
            key={lineItem.id}
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
            {row.id.substring(0, 5)}
          </span>
        </span>
      </td>
      <td className='Layer__table-cell' />
      <td className='Layer__table-cell' />
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content' style={style}>
          {row.account.name}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span
          className='Layer__table-cell-content Layer__table-cell--amount'
          style={style}
        >
          ${centsToDollars(Math.abs(row.amount))}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span
          className='Layer__table-cell-content Layer__table-cell--amount'
          style={style}
        >
          ${centsToDollars(Math.abs(row.amount))}
        </span>
      </td>
    </tr>
  )
}
