import { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { LedgerAccountNodeType } from '@internal-types/chartOfAccounts'
import { Direction } from '@internal-types/general'
import { type View } from '@internal-types/general'
import { type LedgerAccountLineItem } from '@internal-types/ledgerAccounts'
import { decodeLedgerEntrySource } from '@schemas/generalLedger/ledgerEntrySource'
import { lineEntryNumber } from '@utils/journal'
import { centsToDollars } from '@utils/money'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { Text, TextWeight } from '@components/Typography/Text'

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
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
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
                {row.date && formatDate(row.date)}
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
                {row.date && formatDate(row.date)}
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
                  {t('common:label.debit', 'Debit')}
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {' '}
                  {row.direction === Direction.DEBIT
                    && `$${centsToDollars(row?.amount || 0)}`}
                </span>
              </div>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  {t('common:label.credit', 'Credit')}
                </span>
                <span className='Layer__ledger_account-table__balances-mobile__value'>
                  {row.direction === Direction.CREDIT
                    && `$${centsToDollars(row?.amount || 0)}`}
                </span>
              </div>
              <div className='Layer__ledger_account-table__balance-item'>
                <span className='Layer__ledger_account-table__balances-mobile__label'>
                  {t('generalLedger:label.running_balance', 'Running balance')}
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
          {row.date && formatDate(row.date)}
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
