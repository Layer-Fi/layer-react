import React, { useContext, useMemo } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { flattenAccounts } from '../../hooks/useLedgerAccounts/useLedgerAccounts'
import DownloadCloud from '../../icons/DownloadCloud'
import { centsToDollars } from '../../models/Money'
import { Button, BackButton, ButtonVariant } from '../Button'
import { LedgerAccountsContext } from '../LedgerAccounts/LedgerAccounts'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export const AccountsReceivable = () => {
  const { data, showARForAccountId, setShowARForAccountId } = useContext(
    LedgerAccountsContext,
  )

  const entry = useMemo(() => {
    return flattenAccounts(data?.accounts || []).find(
      x => x.id === showARForAccountId,
    )
  }, [showARForAccountId])

  const baseClassName = classNames(
    'Layer__accounts-receivable__index',
    showARForAccountId && 'open',
  )

  const close = () => setShowARForAccountId(undefined)

  return (
    <div className={baseClassName}>
      <div className='Layer__accounts-receivable__header'>
        <BackButton onClick={close} />
        <div className='Layer__accounts-receivable__title-container'>
          <Text
            weight={TextWeight.bold}
            className='Layer__accounts-receivable__title'
          >
            {entry?.name || ''}
          </Text>
          <Button
            variant={ButtonVariant.secondary}
            rightIcon={<DownloadCloud size={12} />}
          >
            Download
          </Button>
        </div>
        <div className='Layer__accounts-receivable__balance-container'>
          <Text
            weight={TextWeight.bold}
            className='Layer__accounts-receivable__balance-label'
          >
            Current balance
          </Text>
          <Text
            weight={TextWeight.bold}
            className='Layer__accounts-receivable__balance-value'
          >
            ${centsToDollars(entry?.balance || 0)}
          </Text>
        </div>
      </div>
      <table className='Layer__table Layer__accounts-receivable-table'>
        <thead>
          <tr>
            <th className='Layer__table-header'>Date</th>
            <th className='Layer__table-header'>Journal id #</th>
            <th className='Layer__table-header'>Source</th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Debit
            </th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Credit
            </th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Running balance
            </th>
          </tr>
        </thead>
        <tbody>
          {entry?.entries?.map(x => {
            return (
              <tr key={x.id}>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content'>
                    {x.createdAt &&
                      formatTime(parseISO(x.createdAt), DATE_FORMAT)}
                  </span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content'>#123</span>
                </td>
                <td className='Layer__table-cell'>
                  <span className='Layer__table-cell-content'>Invoice</span>
                </td>
                <td className='Layer__table-cell Layer__table-cell--amount'>
                  <span className='Layer__table-cell-content'>
                    {x.direction} $X,XXX.XX
                  </span>
                </td>
                <td className='Layer__table-cell Layer__table-cell--amount'>
                  <span className='Layer__table-cell-content'>$X,XXX.XX</span>
                </td>
                <td className='Layer__table-cell Layer__table-cell--amount'>
                  <span className='Layer__table-cell-content'>$X,XXX.XX</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
