import { useContext } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { centsToDollars } from '../../models/Money'
import { LedgerAccountLineItem, lineEntryNumber } from '../../schemas/generalLedger/ledgerEntry'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import { View } from '../../types/general'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'
import { format as formatTime } from 'date-fns'
import { LedgerAccountNodeType } from '../../types/chart_of_accounts'

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

  if (view === 'tablet') {
    return (
      <tr
        className={classNames(
          'Layer__table-row',
          row.entryId === selectedEntryId && 'Layer__table-row--active',
        )}
        style={{ transitionDelay: `${15 * index}ms` }}
        onClick={() => {
          if (selectedEntryId === row.entryId) {
            closeSelectedEntry()
          }
          else {
            setSelectedEntryId(row.entryId)
          }
        }}
      >
        <td className='Layer__table-cell Layer__ledger-account-table__tablet-main-col'>
          <span className='Layer__table-cell-content'>
            <div className='Layer__ledger-account-table__tablet-main-col__date'>
              <Text>
                {row.date && formatTime(row.date, DATE_FORMAT)}
              </Text>
              <Text
                weight={TextWeight.normal}
                className='Layer__ledger_account-table__journal-id'
              >
                {lineEntryNumber(row)}
              </Text>
            </div>
            <Text>{row?.source?.displayDescription ?? ''}</Text>
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
            {row.direction === LedgerEntryDirection.Debit
              && `$${centsToDollars(row?.amount || 0)}`}
          </span>
        </td>
        <td className='Layer__table-cell Layer__table-cell--primary'>
          <span className='Layer__table-cell-content Layer__table-cell--amount'>
            {row.direction === LedgerEntryDirection.Credit
              && `$${centsToDollars(row?.amount || 0)}`}
          </span>
        </td>
        <td className='Layer__table-cell Layer__table-cell--primary'>
          <span className='Layer__table-cell-content Layer__table-cell--amount'>
            {`$${centsToDollars(row.runningBalance)}`}
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
          row.entryId === selectedEntryId && 'Layer__table-row--active',
        )}
        style={{ transitionDelay: `${15 * index}ms` }}
        onClick={() => {
          if (selectedEntryId === row.entryId) {
            closeSelectedEntry()
          }
          else {
            setSelectedEntryId(row.entryId)
          }
        }}
      >
        <td className='Layer__table-cell Layer__ledger-account-table__tablet-main-col'>
          <span className='Layer__table-cell-content'>
            <div className='Layer__ledger-account-table__tablet-main-col__date'>
              <Text>
                {row.date && formatTime(row.date, DATE_FORMAT)}
              </Text>
              <Text
                weight={TextWeight.normal}
                className='Layer__ledger_account-table__journal-id'
              >
                {lineEntryNumber(row)}
              </Text>
            </div>
            <Text>{row?.source?.displayDescription ?? ''}</Text>
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
                  {row.direction === LedgerEntryDirection.Debit
                    && `$${centsToDollars(row?.amount || 0)}`}
                </span>
              </div>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  Credit
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {row.direction === LedgerEntryDirection.Credit
                    && `$${centsToDollars(row?.amount || 0)}`}
                </span>
              </div>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  Running balance
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {`$${centsToDollars(row.runningBalance)}`}
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
        row.entryId === selectedEntryId && 'Layer__table-row--active',
      )}
      style={{ transitionDelay: `${15 * index}ms` }}
      onClick={() => {
        if (selectedEntryId === row.entryId) {
          closeSelectedEntry()
        }
        else {
          setSelectedEntryId(row.entryId)
        }
      }}
    >
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content'>
          {row.date && formatTime(row.date, DATE_FORMAT)}
        </span>
      </td>
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content'>{lineEntryNumber(row)}</span>
      </td>
      <td className='Layer__table-cell'>
        <span className='Layer__table-cell-content'>
          {row?.source?.displayDescription ?? ''}
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
          {row.direction === LedgerEntryDirection.Debit
            && `$${centsToDollars(row?.amount || 0)}`}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span className='Layer__table-cell-content Layer__table-cell--amount'>
          {row.direction === LedgerEntryDirection.Credit
            && `$${centsToDollars(row?.amount || 0)}`}
        </span>
      </td>
      <td className='Layer__table-cell Layer__table-cell--primary'>
        <span className='Layer__table-cell-content Layer__table-cell--amount'>
          {`$${centsToDollars(row.runningBalance)}`}
        </span>
      </td>
    </tr>
  )
}
