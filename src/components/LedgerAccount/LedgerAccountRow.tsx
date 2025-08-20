import { useContext, useMemo } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { centsToDollars } from '../../models/Money'
import { Direction, LedgerAccountLineItem } from '../../types'
import { View } from '../../types/general'
import { lineEntryNumber } from '../../utils/journal'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { LedgerAccountNodeType } from '../../types/chart_of_accounts'
import { decodeLedgerEntrySource } from '../../schemas/ledgerEntrySource'

export interface LedgerAccountRowProps {
  row: LedgerAccountLineItem
  index: number
  view: View
  nodeType?: LedgerAccountNodeType
}

export const LedgerAccountRow = ({
  row,
  index,
  view,
  nodeType,
}: LedgerAccountRowProps) => {
  const { selectedEntryId, setSelectedEntryId, closeSelectedEntry } =
    useContext(LedgerAccountsContext)
  const ledgerEntrySource = useMemo(() => {
    return row.source ? decodeLedgerEntrySource(row.source) : undefined
  }, [row.source])

  if (view === 'tablet') {
    return (
      <tr
        className={classNames(
          'Layer__table-row',
          row.entry_id === selectedEntryId && 'Layer__table-row--active',
        )}
        style={{ transitionDelay: `${15 * index}ms` }}
        onClick={() => {
          if (selectedEntryId === row.entry_id) {
            closeSelectedEntry()
          }
          else {
            setSelectedEntryId(row.entry_id)
          }
        }}
      >
        <td className='Layer__table-cell Layer__ledger-account-table__tablet-main-col'>
          <span className='Layer__table-cell-content'>
            <div className='Layer__ledger-account-table__tablet-main-col__date'>
              <Text>
                {row.date && formatTime(parseISO(row.date), DATE_FORMAT)}
              </Text>
              <Text
                weight={TextWeight.normal}
                className='Layer__ledger_account-table__journal-id'
              >
                {lineEntryNumber(row)}
              </Text>
            </div>
            <Text>{ledgerEntrySource?.displayDescription ?? ''}</Text>
            {nodeType !== LedgerAccountNodeType.Leaf
              && (
                <Text weight={TextWeight.normal}>
                  {row.account?.name ?? ''}
                </Text>
              )}
          </span>
        </td>
        <td className='Layer__table-cell Layer__table-cell--primary'>
          <span className='Layer__table-cell-content Layer__table-cell--amount'>
            {row.direction === Direction.DEBIT
              && `$${centsToDollars(row?.amount || 0)}`}
          </span>
        </td>
        <td className='Layer__table-cell Layer__table-cell--primary'>
          <span className='Layer__table-cell-content Layer__table-cell--amount'>
            {row.direction === Direction.CREDIT
              && `$${centsToDollars(row?.amount || 0)}`}
          </span>
        </td>
        <td className='Layer__table-cell Layer__table-cell--primary'>
          <span className='Layer__table-cell-content Layer__table-cell--amount'>
            {`$${centsToDollars(row.running_balance)}`}
          </span>
        </td>
      </tr>
    )
  }

  if (view === 'mobile') {
    return (
      <tr
        className={classNames(
          'Layer__table-row',
          row.entry_id === selectedEntryId && 'Layer__table-row--active',
        )}
        style={{ transitionDelay: `${15 * index}ms` }}
        onClick={() => {
          if (selectedEntryId === row.entry_id) {
            closeSelectedEntry()
          }
          else {
            setSelectedEntryId(row.entry_id)
          }
        }}
      >
        <td className='Layer__table-cell Layer__ledger-account-table__tablet-main-col'>
          <span className='Layer__table-cell-content'>
            <div className='Layer__ledger-account-table__tablet-main-col__date'>
              <Text>
                {row.date && formatTime(parseISO(row.date), DATE_FORMAT)}
              </Text>
              <Text
                weight={TextWeight.normal}
                className='Layer__ledger_account-table__journal-id'
              >
                {lineEntryNumber(row)}
              </Text>
            </div>
            <Text>{ledgerEntrySource?.displayDescription ?? ''}</Text>
            {nodeType !== LedgerAccountNodeType.Leaf
              && (
                <Text weight={TextWeight.normal}>
                  {row.account?.name ?? ''}
                </Text>
              )}
            <div className='Layer__ledger_account-table__balances-mobile'>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  Debit
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {' '}
                  {row.direction === Direction.DEBIT
                    && `$${centsToDollars(row?.amount || 0)}`}
                </span>
              </div>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  Credit
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {row.direction === Direction.CREDIT
                    && `$${centsToDollars(row?.amount || 0)}`}
                </span>
              </div>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  Running balance
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {`$${centsToDollars(row.running_balance)}`}
                </span>
              </div>
            </div>
          </span>
        </td>
      </tr>
    )
  }

  return (
    <tr
      className={classNames(
        'Layer__table-row',
        row.entry_id === selectedEntryId && 'Layer__table-row--active',
      )}
      style={{ transitionDelay: `${15 * index}ms` }}
      onClick={() => {
        if (selectedEntryId === row.entry_id) {
          closeSelectedEntry()
        }
        else {
          setSelectedEntryId(row.entry_id)
        }
      }}
    >
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content'>
          {row.date && formatTime(parseISO(row.date), DATE_FORMAT)}
        </span>
      </td>
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content'>{lineEntryNumber(row)}</span>
      </td>
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content'>
          {ledgerEntrySource?.displayDescription ?? ''}
        </span>
      </td>
      {nodeType !== LedgerAccountNodeType.Leaf
        && (
          <td className='Layer__table-cell'>
            <span className='Layer__table-cell-content'>
              {row.account?.name ?? ''}
            </span>
          </td>
        )}
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span className='Layer__table-cell-content Layer__table-cell--amount'>
          {row.direction === Direction.DEBIT
            && `$${centsToDollars(row?.amount || 0)}`}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span className='Layer__table-cell-content Layer__table-cell--amount'>
          {row.direction === Direction.CREDIT
            && `$${centsToDollars(row?.amount || 0)}`}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span className='Layer__table-cell-content Layer__table-cell--amount'>
          {`$${centsToDollars(row.running_balance)}`}
        </span>
      </td>
    </tr>
  )
}
